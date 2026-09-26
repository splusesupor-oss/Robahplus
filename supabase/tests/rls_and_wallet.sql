-- supabase/tests/rls_and_wallet.sql
-- Security tests for the Robah Plus Supabase schema: RLS, wallet integrity, group isolation,
-- moderation.  Run with tools/test-db.sh; every assertion raises, so "TESTS PASSED" means the
-- security model actually holds on a real Postgres engine.
--
-- Contexts used (created by the harness, modelled on Supabase's roles):
--   fox_a      = user 09120000001, owns group g_alpha      (attacker-victim's peer)
--   fox_b      = user 09120000002, owns group g_beta       (the attacker in most tests)
--   fox_admin  = user 09120000001 with app_metadata.role   (proves claims unlock moderation)
--   service_role = what the edge functions use (bypasses RLS, cannot bypass the trigger guards)
\set ON_ERROR_STOP on
set client_min_messages to notice;

-- ═══ 0 · fixture — written through service_role, like the edge functions will be ═══
set role service_role;
do $$
declare a uuid := '11111111-1111-1111-1111-111111111111';
        b uuid := '22222222-2222-2222-2222-222222222222';
begin
  insert into auth.users (id, phone, phone_confirmed_at) values (a, '09120000001', now()), (b, '09120000002', now());
  insert into app.identity (phone, user_id) values ('09120000001', a), ('09120000002', b);
  insert into app.profile (phone, user_id, name, username) values
    ('09120000001', a, 'روباه اول', 'foxA'), ('09120000002', b, 'روباه دوم', 'foxB');
  insert into app.wallet (phone, diamonds, fox_coins, total_diamonds_earned) values
    ('09120000001', 1000, 500, 1000), ('09120000002', 0, 0, 0);
  insert into app.group (id, name, owner_phone) values ('g_alpha', 'گروه آلفا', '09120000001');
  insert into app.group (id, name, owner_phone) values ('g_beta',  'گروه بتا',  '09120000002');
  insert into app.group_member (group_id, phone, role) values ('g_alpha', '09120000001', 'owner');
  insert into app.group_member (group_id, phone, role) values ('g_beta',  '09120000002', 'owner');
  insert into app.group_message (group_id, sender_phone, body) values ('g_alpha', '09120000001', 'راز گروه آلفا');
  insert into app.group_message (group_id, sender_phone, body) values ('g_beta',  '09120000002', 'راز گروه بتا');
  insert into app.game (code, title_fa, is_pvp, enabled) values ('quiz', 'کوییز', true, true);
  insert into app.game_reward_rule (game_code, mode, result, currency, amount, max_per_day)
    values ('quiz', 'solo', 'won', 'diamond', 25, 3);          -- deliberately no 'win' rule
  insert into app.game_session (id, game_code, phone, mode, status)
    values ('aaaaaaaa-0000-0000-0000-000000000001', 'quiz', '09120000002', 'solo', 'won');
  insert into app.game_session (id, game_code, phone, mode, status)
    values ('aaaaaaaa-0000-0000-0000-000000000002', 'quiz', '09120000002', 'solo', 'active');
  insert into app.block (blocker_phone, blocked_phone) values ('09120000001', '09120000002');
  insert into app.report (reporter_phone, target_phone, reason) values ('09120000002', '09120000001', 'اسپم در گروه');
  insert into app.audit_log (actor, action, target) values ('09120000001', 'test_seed', 'g_alpha');
end $$;
reset role;

-- ═══ 1 · group isolation: B sees nothing of A's group ═══
set role fox_b;
select set_config('request.jwt.claims',
  '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated","phone":"09120000002"}', false);
do $$ begin
  perform app.assert((select count(*) from app."group" where id = 'g_alpha') = 0, 'B cannot read A''s group row');
  perform app.assert((select count(*) from app.group_message where group_id = 'g_alpha') = 0, 'B cannot read A''s messages');
  perform app.assert((select count(*) from app.group_member where group_id = 'g_alpha') = 0, 'B cannot list A''s members');
  perform app.assert((select count(*) from app."group" where id = 'g_beta') = 1, 'B can read their own group');
  begin
    insert into app.group_message (group_id, sender_phone, body) values ('g_alpha', '09120000002', 'نفوذ');
    raise exception 'TEST FAILED: B posted into A''s group' using errcode = 'P0001';
  exception
    when insufficient_privilege then raise notice '  ok — cannot post into another group';
    when raise_exception then raise;
  end;
  begin
    insert into app.group_message (group_id, sender_phone, body) values ('g_beta', '09120000001', 'جعل پیام');
    raise exception 'TEST FAILED: B posted as A inside B''s own group' using errcode = 'P0001';
  exception
    when insufficient_privilege then raise notice '  ok — cannot forge another sender';
    when raise_exception then raise;
  end;
end $$;
reset role;

-- ═══ 2 · wallet: read-only for clients, no direct writes, no minting ═══
set role fox_b;
select set_config('request.jwt.claims',
  '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated","phone":"09120000002"}', false);
do $$ declare r jsonb; begin
  perform app.assert((select count(*) from app.wallet) = 1, 'B sees only their own wallet');
  begin
    update app.wallet set diamonds = 999999 where phone = '09120000002';
    raise exception 'TEST FAILED: client updated their own wallet directly' using errcode = 'P0001';
  exception
    when insufficient_privilege then raise notice '  ok — no UPDATE on app.wallet for authenticated';
    when raise_exception then raise;
  end;
  begin
    insert into app.wallet_transaction (phone, kind, currency, amount) values ('09120000002','game_reward','diamond',5000);
    raise exception 'TEST FAILED: client inserted a ledger row' using errcode = 'P0001';
  exception
    when insufficient_privilege then raise notice '  ok — no INSERT on app.wallet_transaction';
    when raise_exception then raise;
  end;
  r := app.wallet_debit('diamond', 5000, 'spend', null, null, null, 'req-too-much');
  perform app.assert((r->>'ok')::boolean is not true and r->>'error' = 'insufficient_diamonds', 'overspend rejected');
  perform app.assert((select diamonds from app.wallet where phone = '09120000002') = 0, 'balance untouched by the rejected debit');
  r := app.wallet_credit('diamond', -500, 'game_reward');
  perform app.assert((r->>'ok')::boolean is not true and r->>'error' = 'amount_must_be_positive', 'negative amounts refused by the wrapper');
  r := app.wallet_credit('diamond', 40, 'game_reward', null, 'quiz', 'q-1', 'req-credit-1');
  perform app.assert((r->>'ok')::boolean and (r->>'balance')::bigint = 40, 'wallet_credit works through the RPC');
end $$;
reset role;

-- ═══ 3 · idempotency (verified server-side so we look at the real rows) ═══
set role fox_b;
select set_config('request.jwt.claims',
  '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated","phone":"09120000002"}', false);
do $$ declare r jsonb; begin
  r := app.wallet_credit('diamond', 40, 'game_reward', null, 'quiz', 'q-dup', 'req-dup-1');
  perform app.assert((r->>'ok')::boolean and (r->>'balance')::bigint = 80, 'first call credits 40');
  r := app.wallet_credit('diamond', 40, 'game_reward', null, 'quiz', 'q-dup', 'req-dup-1');
  perform app.assert((r->>'ok')::boolean and (r->>'idempotent')::boolean and (r->>'balance')::bigint = 80,
                     'replay returns the original result, no double credit');
  r := app.wallet_credit('diamond', 999, 'game_reward', null, 'quiz', 'q-other', 'req-dup-1');
  perform app.assert((r->>'ok')::boolean is not true and r->>'error' = 'idempotency_conflict',
                     'reusing a request_id for a different payload is refused');
  r := app.wallet_credit('diamond', 40, 'game_reward', null, 'quiz', 'q-dup-3', 'req-dup-3');
  perform app.assert((r->>'ok')::boolean and (r->>'balance')::bigint = 120, 'a genuinely new request_id still works');
end $$;
reset role;
set role service_role;
do $$ begin
  perform app.assert((select count(*) from app.wallet_transaction where phone='09120000002' and request_id='req-dup-1') = 1,
                     'the replay wrote no second ledger row');
  perform app.assert((select diamonds from app.wallet where phone='09120000002') = 120, 'final balance is exactly 3 × 40');
  perform app.assert((select total_diamonds_spent from app.wallet where phone='09120000002') = 0, 'no phantom spend was recorded');
end $$;
reset role;

-- ═══ 4 · privilege escalation is impossible from a client token ═══
set role fox_b;
select set_config('request.jwt.claims',
  '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated","phone":"09120000002"}', false);
do $$ begin
  begin
    update app.group_member set role = 'admin' where group_id = 'g_beta' and phone = '09120000002';
    raise exception 'TEST FAILED: B promoted themselves in their own group' using errcode = 'P0001';
  exception
    when insufficient_privilege then raise notice '  ok — no UPDATE policy on group_member';
    when others then
      if sqlerrm like 'role changes require%' then raise notice '  ok — role guard trigger blocked self-promotion';
      else raise; end if;
  end;
  begin
    insert into app.group_member (group_id, phone, role) values ('g_alpha','09120000002','owner');
    raise exception 'TEST FAILED: B inserted themselves as owner of A''s group' using errcode = 'P0001';
  exception
    when insufficient_privilege then raise notice '  ok — cannot self-insert as owner';
    when raise_exception then raise;
  end;
  begin
    update app.profile set role = 'admin' where phone = '09120000002';
    raise exception 'TEST FAILED: B promoted their own profile' using errcode = 'P0001';
  exception
    when insufficient_privilege then raise notice '  ok — profile.role is not updatable by clients';
    when raise_exception then raise;
  end;
  begin
    insert into app.user_restriction (phone, kind, reason) values ('09120000001','ban','انتقام');
    raise exception 'TEST FAILED: B banned A by writing user_restriction' using errcode = 'P0001';
  exception
    when insufficient_privilege then raise notice '  ok — restrictions are not client-writable';
    when raise_exception then raise;
  end;
  begin
    insert into app.game_reward_grant (session_id, phone, game_code, mode, result, currency, amount, transaction_id)
      values ('aaaaaaaa-0000-0000-0000-000000000001','09120000002','quiz','solo','won','diamond',99999,gen_random_uuid());
    raise exception 'TEST FAILED: client wrote a reward grant row' using errcode = 'P0001';
  exception
    when insufficient_privilege then raise notice '  ok — reward grants are server-side only';
    when raise_exception then raise;
  end;
end $$;
reset role;

-- ═══ 5 · game rewards: the server decides the amount, once per session ═══
set role fox_b;
select set_config('request.jwt.claims',
  '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated","phone":"09120000002"}', false);
do $$ declare r jsonb; begin
  r := app.game_claim_reward(gen_random_uuid(), 'req-no-session');
  perform app.assert((r->>'ok')::boolean is not true and r->>'error' = 'session_not_found', 'unknown session refused');
  r := app.game_claim_reward('aaaaaaaa-0000-0000-0000-000000000002', 'req-active');
  perform app.assert((r->>'ok')::boolean is not true and r->>'error' = 'no_reward_rule',
                     'an unfinished session cannot mint a reward (no "win" rule exists)');
  r := app.game_claim_reward('aaaaaaaa-0000-0000-0000-000000000001', 'req-rule-ok');
  perform app.assert((r->>'ok')::boolean and (r->>'amount')::int = 25, 'the rule decides 25, not the client');
  r := app.game_claim_reward('aaaaaaaa-0000-0000-0000-000000000001', 'req-rule-again');
  perform app.assert((r->>'ok')::boolean and (r->>'idempotent')::boolean, 're-claiming the same session is idempotent');
end $$;
reset role;
-- A must not be able to claim B's session
set role fox_a;
select set_config('request.jwt.claims',
  '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated","phone":"09120000001"}', false);
do $$ declare r jsonb; begin
  r := app.game_claim_reward('aaaaaaaa-0000-0000-0000-000000000001', 'req-steal');
  perform app.assert((r->>'ok')::boolean is not true and r->>'error' = 'session_not_found', 'A cannot claim B''s session');
end $$;
reset role;
set role service_role;
do $$ begin
  perform app.assert((select count(*) from app.wallet_transaction where kind='game_reward'
                       and reference_id='aaaaaaaa-0000-0000-0000-000000000001') = 1, 'one ledger row per session');
end $$;
reset role;

-- ═══ 6 · DMs: participants only, block list enforced ═══
set role fox_b;
select set_config('request.jwt.claims',
  '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated","phone":"09120000002"}', false);
do $$ begin
  begin
    insert into app.dm_thread (phone_a, phone_b) values ('09120000002','09120000001');
    raise exception 'TEST FAILED: a blocked user opened a thread' using errcode = 'P0001';
  exception
    when insufficient_privilege then raise notice '  ok — the block list is enforced in RLS';
    when raise_exception then raise;
  end;
end $$;
reset role;





-- ═══ 7 · group join/upsert attacks (run as the outsider) ═══
set role fox_b;
select set_config('request.jwt.claims',
  '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated","phone":"09120000002"}', false);
do $$ begin
  begin
    insert into app.group_member (group_id, phone, role) values ('g_beta','09120000001','admin')
      on conflict (group_id, phone) do update set role = excluded.role;
    raise exception 'TEST FAILED: self-insert as admin was accepted' using errcode = 'P0001';
  exception
    when insufficient_privilege then raise notice '  ok — self-insert/upsert as admin refused (WITH CHECK)';
    when others then
      if sqlerrm like 'role changes require%' then raise notice '  ok — refused by the role guard trigger';
      else raise; end if;
  end;
  begin
    insert into app.group_member (group_id, phone, role) values ('g_alpha','09120000001','member')
      on conflict (group_id, phone) do update set role = excluded.role;
    raise exception 'TEST FAILED: an outsider rewrote A''s membership' using errcode = 'P0001';
  exception
    when insufficient_privilege then raise notice '  ok — an outsider cannot rewrite another user''s membership';
    when others then
      if sqlerrm like 'membership belongs to another group%' or sqlerrm like 'role changes require%' then
        raise notice '  ok — refused by the role guard trigger';
      else raise; end if;
  end;
end $$;
reset role;
set role service_role;
do $$ begin
  perform app.assert((select role from app.group_member where group_id='g_alpha' and phone='09120000001') = 'owner',
                     'A''s owner membership is intact');
  perform app.assert((select count(*) from app.group_member where group_id='g_beta' and phone='09120000001') = 0,
                     'no attacker row was created');
  perform app.assert((select count(*) from app.group_message where group_id='g_alpha') = 1, 'A''s stream is intact');
  -- the legitimate path still works: a service-role (moderator edge fn) call may grant admin
  insert into app.group_member (group_id, phone, role) values ('g_beta','09120000001','admin')
    on conflict (group_id, phone) do update set role = excluded.role;
  perform app.assert((select count(*) from app.group_member where group_id='g_beta' and phone='09120000001' and role='admin') = 1,
                     'the server side CAN grant admin (this is the moderator edge-function path)');
end $$;
reset role;



-- ═══ 8 · profile writes are owner-scoped (and tolerate an E.164 JWT) ═══
set role fox_b;
select set_config('request.jwt.claims',
  '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated","phone":"+989120000002"}', false);
do $$ declare r int; begin
  perform app.assert(app.current_phone() = '09120000002', 'E.164 phone claim normalises to the local form');
  update app.profile set name = 'روبات من' where phone = '09120000002';
  get diagnostics r = row_count;
  perform app.assert(r = 1, 'B can rename their own profile from an E.164 token');
  update app.profile set name = 'دزدیده' where phone = '09120000001';
  get diagnostics r = row_count;
  perform app.assert(r = 0, 'B cannot rename A''s profile (zero rows affected)');
end $$;
reset role;
set role service_role;
do $$ begin
  perform app.assert((select name from app.profile where phone='09120000001') = 'روباه اول', 'A''s profile is untouched');
end $$;
reset role;

-- ═══ 9 · moderation is the JWT claim, not a client-side flag ═══
set role fox_b;
select set_config('request.jwt.claims',
  '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated","phone":"09120000002"}', false);
do $$ begin
  perform app.assert((select count(*) from app.report) = 1, 'a reporter sees the report they filed');
  perform app.assert((select count(*) from app.audit_log) = 0, '…but never the audit log');
end $$;
reset role;

set role fox_admin;
select set_config('request.jwt.claims',
  '{"sub":"33333333-3333-3333-3333-333333333333","role":"authenticated","phone":"09120000001","app_metadata":{"role":"moderator"}}', false);
do $$ begin
  perform app.assert((select count(*) from app.audit_log) = 0, 'app_metadata.role=moderator is NOT admin');
end $$;
select set_config('request.jwt.claims',
  '{"sub":"33333333-3333-3333-3333-333333333333","role":"authenticated","phone":"09120000001","app_metadata":{"role":"admin"}}', false);
do $$ begin
  perform app.assert((select count(*) from app.audit_log) = 1, 'the admin claim unlocks the audit log');
  begin
    insert into app.user_restriction (phone, kind) values ('09120000002','ban');
    raise exception 'TEST FAILED: an admin JWT wrote a restriction row directly' using errcode = 'P0001';
  exception
    when insufficient_privilege then raise notice '  ok — even an admin goes through the edge function (no policy)';
    when raise_exception then raise;
  end;
end $$;
reset role;

-- ═══ 10 · visibility sanity for the legitimate owner ═══
set role fox_a;
select set_config('request.jwt.claims',
  '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated","phone":"09120000001"}', false);
do $$ begin
  perform app.assert((select count(*) from app.group_message where group_id='g_alpha') = 1, 'owner reads their own stream');
  perform app.assert((select count(*) from app.wallet) = 1, 'owner reads only their own wallet');
  perform app.assert((select diamonds from app.wallet) = 1000, 'and the number is the server''s number');
end $$;
reset role;

-- ═══ 11 · diamond packs: server-side price list, atomic coin→diamond exchange ═══
-- seed 100 fox coins for B.  Deliberately a direct write as service_role (the same thing the
-- admin panel does through an edge function): app.wallet_apply refuses an explicit p_phone
-- without the FOX_WALLET_ADMIN_CODE secret, so a credit for *another* user can only ever happen
-- with that secret — exactly the guarantee the wallet tests already cover.
set role service_role;
update app.wallet set fox_coins = 100 where phone = '09120000002';
do $$ begin
  perform app.assert((select fox_coins from app.wallet where phone='09120000002') = 100, 'B starts with 100 fox coins');
end $$;
reset role;

set role fox_b;
select set_config('request.jwt.claims',
  '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated","phone":"09120000002"}', false);
do $$ begin
  perform app.assert((select count(*) from app.diamond_package) = 4, 'price list is readable by clients');
  perform app.assert(not exists (select 1 from app.diamond_package where price_toman > 0 and coins_required = 0),
                     'no pack is both free and coin-less');
  perform app.assert((select count(*) from app.diamond_purchase) = 0, 'purchases are invisible until they are mine');
end $$;
-- the catalogue is read-only through RLS
do $$ begin
  begin
    insert into app.diamond_package (id, label, diamonds) values ('dm_hack', 'hack', 999999);
    raise exception 'TEST FAILED: client invented a package' using errcode = 'P0001';
  exception
    when insufficient_privilege then raise notice '  ok — clients cannot invent a package';
    when others then if sqlerrm like 'permission denied%' then raise notice '  ok — clients cannot invent a package'; else raise; end if;
  end;
  begin
    update app.diamond_package set price_toman = 0 where id = 'dm_100';
    raise exception 'TEST FAILED: client re-priced a pack' using errcode = 'P0001';
  exception
    when insufficient_privilege then raise notice '  ok — clients cannot re-price a pack';
    when others then if sqlerrm like 'permission denied%' then raise notice '  ok — clients cannot re-price a pack'; else raise; end if;
  end;
end $$;
-- buy the coin-funded pack: 20 coins leave, 10 diamonds arrive, in one request_id
do $$ declare r jsonb; w bigint; base int;
begin
  select diamonds into base from app.wallet where phone = '09120000002';
  r := app.buy_diamond_pack('dm_10', 'pack:dm_10:b:1');
  perform app.assert(coalesce(r->>'ok','') = 'true', 'coin-funded pack purchases: ' || coalesce(r->>'error','?'));
  perform app.assert((select fox_coins from app.wallet where phone='09120000002') = 80, 'coins debited by the catalogue price (20)');
  perform app.assert((select diamonds from app.wallet where phone='09120000002') = base + 10,
                     'diamonds credited by the catalogue amount (10)');
  perform app.assert((select count(*) from app.diamond_purchase where phone='09120000002' and status='completed') = 1,
                     'one completed purchase row');
  -- replay with the same request id: nothing moves
  r := app.buy_diamond_pack('dm_10', 'pack:dm_10:b:1');
  perform app.assert(coalesce(r->>'idempotent','') = 'true', 'replay is reported as idempotent');
  perform app.assert((select diamonds from app.wallet where phone='09120000002') = base + 10, 'replay does not pay twice');
  perform app.assert((select fox_coins from app.wallet where phone='09120000002') = 80, 'replay does not charge twice');
  -- a paid pack must NOT credit diamonds before the gateway confirms
  r := app.buy_diamond_pack('dm_100', 'pack:dm_100:b:1');
  perform app.assert(coalesce(r->>'status','') = 'pending', 'paid pack stays pending without a payment reference');
  perform app.assert((select diamonds from app.wallet where phone='09120000002') = base + 10, 'pending pack credited nothing');
  -- and it cannot be conjured into completion by naming somebody else's request id
  w := (select diamonds from app.wallet where phone='09120000002');
  begin
    perform app.buy_diamond_pack(null, 'pack:dm_100:b:9999', 'fake-ref');
    raise exception 'TEST FAILED: an unknown purchase was completed' using errcode = 'P0001';
  exception
    when raise_exception then
      if sqlerrm like 'TEST FAILED%' then raise; end if;
    when insufficient_privilege or sqlstate '42501' then raise notice '  ok — a webhook cannot invent a purchase';
    when others then
      if sqlerrm like 'auth required%' or sqlerrm like 'package required%' then raise notice '  ok — a webhook cannot invent a purchase';
      else raise; end if;
  end;
  perform app.assert((select diamonds from app.wallet where phone='09120000002') = w, 'wallet unchanged by the invented completion');
end $$;
reset role;

-- the gateway path: service role completes the pending row by request id only (no phone, no price)
set role service_role;
do $$ declare r jsonb; base int;
begin
  -- re-read: other blocks in this file legitimately change B's wallet, so every delta below is
  -- measured against the balance *at this point*, not against a constant
  select diamonds into base from app.wallet where phone = '09120000002';
  r := app.buy_diamond_pack(null, 'pack:dm_100:b:1', 'gateway-tx-77');
  perform app.assert(coalesce(r->>'status','') = 'completed', 'gateway confirmation completes the purchase the user started');
  perform app.assert((select diamonds from app.wallet where phone='09120000002') = base + 100,
                     'and credits exactly the catalogue amount (100)');
  r := app.buy_diamond_pack(null, 'pack:dm_100:b:1', 'gateway-tx-78');
  perform app.assert(coalesce(r->>'idempotent','') = 'true', 'a second webhook callback is a no-op');
  perform app.assert((select diamonds from app.wallet where phone='09120000002') = base + 100,
                     'a retried webhook cannot double-credit');
  perform app.assert((select count(*) from app.diamond_purchase where phone='09120000002' and status='completed') = 2
                     and (select count(*) from app.diamond_purchase where phone='09120000002' and status='pending') = 0,
                     'exactly two completed purchases and nothing left pending');
end $$;
reset role;

-- ═══ 12 · profile privilege columns stay out of reach of the client ═══
set role fox_b;
select set_config('request.jwt.claims',
  '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated","phone":"09120000002"}', false);
do $$ declare r int;
begin
  -- a BEFORE trigger that returned NULL would silently drop the row → assert the row count too
  update app.profile set name = 'سلام' where phone = '09120000002';
  get diagnostics r = row_count;
  perform app.assert(r = 1, 'owner can rename through the granted column set');
  begin
    update app.profile set role = 'admin' where phone = '09120000002';
    raise exception 'TEST FAILED: role column was updatable by the client' using errcode = 'P0001';
  exception
    -- the column-level GRANT is the enforcement here: Postgres refuses the statement outright
    when insufficient_privilege then raise notice '  ok — role is not updatable by the client (column grant)';
    when raise_exception then if sqlerrm like 'TEST FAILED%' then raise; end if;
  end;
  perform app.assert((select role from app.profile where phone='09120000002') = 'user', 'and the value really did not change');
end $$;
do $$ begin
  begin
    update app.profile set phone = '09120000001' where phone = '09120000002';
    raise exception 'TEST FAILED: profile was reassigned to another identity' using errcode = 'P0001';
  exception
    when raise_exception then if sqlerrm like 'TEST FAILED%' then raise; end if;
    when others then
      if sqlerrm like 'cannot reassign a profile%' or sqlerrm like 'permission denied%' then raise notice '  ok — a profile cannot be moved onto another identity';
      else raise; end if;
  end;
  begin
    update app.profile set bio = repeat('x', 501) where phone = '09120000002';
    raise exception 'TEST FAILED: over-long bio accepted' using errcode = 'P0001';
  exception
    when raise_exception then if sqlerrm like 'TEST FAILED%' then raise; end if;
    when others then
      if sqlerrm like 'value too long%' or sqlerrm like 'new row for relation "profile" violates%' or sqlerrm like 'length%' then raise notice '  ok — bio length is enforced by CHECK';
      else raise; end if;
  end;
end $$;
-- set_profile() is the only sanctioned write path and it bumps the revision counter
do $$ declare r jsonb; rev0 bigint; rev1 bigint;
begin
  select profile_revision into rev0 from app.profile where phone = '09120000002';
  r := app.set_profile('روباه دوم', 'بیو', '09120000002/abc.png');
  perform app.assert(coalesce(r->>'ok','') = 'true', 'set_profile writes the owner row');
  select profile_revision into rev1 from app.profile where phone = '09120000002';
  perform app.assert(rev1 = rev0 + 1, 'set_profile bumps profile_revision (drives the identities stream)');
  perform app.assert((select avatar_path from app.profile where phone='09120000002') = '09120000002/abc.png', 'avatar path stored');
  begin
    perform app.set_username('foxA');
    raise exception 'TEST FAILED: a taken username was claimed' using errcode = 'P0001';
  exception
    when raise_exception then if sqlerrm like 'TEST FAILED%' then raise; end if;
    when others then
      if sqlerrm like 'username_taken%' then raise notice '  ok — taken usernames are refused by name';
      else raise; end if;
  end;
  begin
    perform app.set_username('a');
    raise exception 'TEST FAILED: invalid username accepted' using errcode = 'P0001';
  exception
    when raise_exception then if sqlerrm like 'TEST FAILED%' then raise; end if;
    when others then
      if sqlerrm like 'invalid username%' then raise notice '  ok — username shape is validated server-side';
      else raise; end if;
  end;
end $$;
reset role;
set role service_role;
do $$ begin
  perform app.assert((select role from app.profile where phone='09120000002') = 'user', 'B is still a plain user after every attack above');
  perform app.assert((select name from app.profile where phone='09120000001') = 'روباه اول', 'A''s profile was never touched by B');
end $$;
reset role;

select 'TESTS PASSED' as result;
