-- 0008 · wallet + ledger  (legacy: Durable Object `chars:<phone>` key wallet:v1)
-- Fields match what production already tracks so the migration is a copy, not a redesign.
create table app.wallet (
  phone                   text primary key references app.identity(phone) on delete cascade,
  diamonds                bigint not null default 0 check (diamonds  >= 0 and  diamonds  <= 1e15),
  fox_coins               bigint not null default 0 check (fox_coins >= 0 and fox_coins <= 1e15),
  total_diamonds_earned   bigint not null default 0 check (total_diamonds_earned >= 0),
  total_fox_coins_earned  bigint not null default 0 check (total_fox_coins_earned >= 0),
  total_diamonds_spent    bigint not null default 0 check (total_diamonds_spent >= 0),
  total_fox_coins_spent   bigint not null default 0 check (total_fox_coins_spent >= 0),
  games_played            integer not null default 0,
  games_won               integer not null default 0,
  levels_completed        integer not null default 0,
  owned_characters        text[] not null default '{}',
  active_character        text not null default '',
  tank_items              text[] not null default '{}',
  revision                bigint not null default 0,
  updated_at              timestamptz not null default now(),
  created_at              timestamptz not null default now()
);

create table app.wallet_transaction (
  id              uuid primary key default app.gen_random_uuid(),
  phone           text not null references app.identity(phone) on delete cascade,
  kind            app.tx_kind not null,
  currency        app.currency not null,
  amount          bigint not null check (amount >= 0),          -- always positive; direction comes from kind
  status          app.tx_status not null default 'completed',
  balance_after   bigint,
  group_id        text references app.group(id) on delete set null,
  game_code       text,
  reference_id    text,                                          -- purchase id, message id, …
  request_id      text,                                          -- client idempotency key (echoed for retries)
  fingerprint     text,                                          -- sha256 of the normalized request
  meta            jsonb not null default '{}'::jsonb,
  created_at      timestamptz not null default now()
);
create index wallet_tx_phone_idx on app.wallet_transaction (phone, created_at desc, id desc);
create unique index wallet_tx_request_uniq on app.wallet_transaction (phone, request_id)
  where request_id is not null and kind <> 'game_reward';
-- a quiz question can only ever be paid once, even across retries with different request ids
create unique index wallet_tx_quiz_question_uniq on app.wallet_transaction (reference_id)
  where kind = 'game_reward' and reference_id is not null;

-- ── the ONLY way balances move ───────────────────────────────────────────────
-- NOTE on style: plpgsql `RETURN QUERY` does *not* stop execution — a guard written that
-- way falls through into the UPDATE below.  These functions therefore return a single jsonb
-- and use a real `RETURN`, which cannot leak past a guard.
create function app.wallet_apply(
  p_currency app.currency,
  p_delta bigint,                              -- > 0 credits, < 0 debits
  p_kind app.tx_kind,
  p_group_id text default null,
  p_game_code text default null,
  p_reference_id text default null,
  p_request_id text default null,
  p_meta jsonb default '{}'::jsonb,
  p_phone text default null                     -- service role only (admin grants)
) returns jsonb
language plpgsql security definer set search_path = public, app, extensions as $$
declare
  v_phone   text := coalesce(nullif(p_phone, ''), app.current_phone());
  v_balance bigint := 0;
  v_after   bigint := 0;
  v_tx      app.wallet_transaction;
  v_fp      text;
begin
  if v_phone = '' then return jsonb_build_object('ok', false, 'error', 'auth_required'); end if;
  if p_delta is null or p_delta = 0 then return jsonb_build_object('ok', false, 'error', 'zero_amount'); end if;
  if abs(p_delta) > 1e12 then return jsonb_build_object('ok', false, 'error', 'amount_too_large'); end if;

  -- admin grants (explicit p_phone) must also prove knowledge of the server secret, so a
  -- stolen service role alone cannot mint currency for arbitrary accounts.
  if nullif(p_phone, '') is not null then
    if coalesce(p_meta ->> 'admin_code', '') <> coalesce(app.secret('FOX_WALLET_ADMIN_CODE'), '~impossible~') then
      return jsonb_build_object('ok', false, 'error', 'forbidden');
    end if;
  end if;

  v_fp := encode(app.digest(concat_ws('|', coalesce(p_request_id, ''), p_currency, p_kind, p_delta::text,
                                  coalesce(p_reference_id, ''), coalesce(p_group_id, '')), 'sha256'), 'hex');

  -- idempotency: the same (phone, request_id, fingerprint) returns the original result verbatim
  if p_request_id is not null then
    select * into v_tx from app.wallet_transaction
     where wallet_transaction.phone = v_phone
       and wallet_transaction.request_id = p_request_id
       and wallet_transaction.fingerprint = v_fp;
    if found then
      return jsonb_build_object('ok', true, 'balance', v_tx.balance_after, 'transaction_id', v_tx.id,
                                'idempotent', true);
    end if;
    if exists (select 1 from app.wallet_transaction
                where phone = v_phone and request_id = p_request_id) then
      return jsonb_build_object('ok', false, 'error', 'idempotency_conflict');
    end if;
  end if;

  if not exists (select 1 from app.wallet where phone = v_phone) then
    insert into app.wallet (phone) values (v_phone) on conflict (phone) do nothing;
  end if;

  if p_currency = 'diamond' then
    select diamonds into v_balance from app.wallet where phone = v_phone for update;
    if v_balance + p_delta < 0 then
      return jsonb_build_object('ok', false, 'error', 'insufficient_diamonds', 'balance', v_balance);
    end if;
    update app.wallet set
      diamonds                = diamonds + p_delta,
      total_diamonds_earned   = total_diamonds_earned + greatest(p_delta, 0),
      total_diamonds_spent    = total_diamonds_spent  + greatest(-p_delta, 0),
      revision                = revision + 1,
      updated_at              = now()
     where phone = v_phone
    returning diamonds into v_after;
  else
    select fox_coins into v_balance from app.wallet where phone = v_phone for update;
    if v_balance + p_delta < 0 then
      return jsonb_build_object('ok', false, 'error', 'insufficient_coins', 'balance', v_balance);
    end if;
    update app.wallet set
      fox_coins               = fox_coins + p_delta,
      total_fox_coins_earned  = total_fox_coins_earned + greatest(p_delta, 0),
      total_fox_coins_spent   = total_fox_coins_spent  + greatest(-p_delta, 0),
      revision                = revision + 1,
      updated_at              = now()
     where phone = v_phone
    returning fox_coins into v_after;
  end if;

  insert into app.wallet_transaction
    (phone, kind, currency, amount, balance_after, group_id, game_code, reference_id, request_id, fingerprint, meta)
    values (v_phone, p_kind, p_currency, abs(p_delta), v_after, p_group_id, p_game_code,
            p_reference_id, p_request_id, v_fp, coalesce(p_meta, '{}'::jsonb) - 'admin_code')
    returning * into v_tx;

  return jsonb_build_object('ok', true, 'balance', v_after, 'transaction_id', v_tx.id, 'idempotent', false);
end $$;

-- Convenience wrappers: clients can only ever move their own balance, and only through one of
-- these two, so the direction of the ledger entry is never attacker-controlled.
create function app.wallet_credit(p_currency app.currency, p_amount bigint, p_kind app.tx_kind,
  p_group_id text default null, p_game_code text default null, p_reference_id text default null,
  p_request_id text default null, p_meta jsonb default '{}'::jsonb) returns jsonb
language plpgsql security definer set search_path = public, app, extensions as $$
begin
  if coalesce(p_amount, 0) <= 0 then return jsonb_build_object('ok', false, 'error', 'amount_must_be_positive'); end if;
  return app.wallet_apply(p_currency, p_amount, p_kind, p_group_id, p_game_code, p_reference_id, p_request_id, p_meta, null);
end $$;

create function app.wallet_debit(p_currency app.currency, p_amount bigint, p_kind app.tx_kind,
  p_group_id text default null, p_game_code text default null, p_reference_id text default null,
  p_request_id text default null, p_meta jsonb default '{}'::jsonb) returns jsonb
language plpgsql security definer set search_path = public, app, extensions as $$
begin
  if coalesce(p_amount, 0) <= 0 then return jsonb_build_object('ok', false, 'error', 'amount_must_be_positive'); end if;
  return app.wallet_apply(p_currency, -p_amount, p_kind, p_group_id, p_game_code, p_reference_id, p_request_id, p_meta, null);
end $$;

-- current snapshot for the UI (never trusts a client-side number)
create function app.wallet_snapshot() returns jsonb
language sql stable security definer set search_path = public, app, extensions as $$
  select jsonb_build_object(
    'phone', w.phone, 'diamonds', w.diamonds, 'foxCoins', w.fox_coins,
    'totalDiamondsEarned', w.total_diamonds_earned, 'totalFoxCoinsEarned', w.total_fox_coins_earned,
    'totalDiamondsSpent', w.total_diamonds_spent, 'totalFoxCoinsSpent', w.total_fox_coins_spent,
    'gamesPlayed', w.games_played, 'gamesWon', w.games_won, 'revision', w.revision,
    'updatedAt', w.updated_at, 'source', 'wallet-v1')
    from app.wallet w where w.phone = app.current_phone()
$$;

-- server-side secret lookup (populated from Supabase Vault / secrets, never from a client)
create table if not exists app.config_secret_ref (
  key   text primary key,
  value text not null
);
create or replace function app.secret(k text) returns text
language sql stable security definer set search_path = public, app, extensions as $$
  select value from app.config_secret_ref where key = k
$$;

alter table app.wallet enable row level security;
alter table app.wallet_transaction enable row level security;

-- clients may read their own wallet and ledger, and nothing else.  No INSERT/UPDATE/DELETE
-- policy exists at all → a client can never write a balance directly; every mutation goes
-- through app.wallet_apply (security definer) called by an Edge Function or the client RPC.
create policy wallet_self_read on app.wallet for select to authenticated using (phone = app.current_phone());
create policy wallet_tx_self_read on app.wallet_transaction for select to authenticated using (phone = app.current_phone());

-- clients may call the two wrappers (self-only, no p_phone); app.wallet_apply is service-role only
grant execute on function app.wallet_credit(app.currency, bigint, app.tx_kind, text, text, text, text, jsonb) to authenticated;
grant execute on function app.wallet_debit(app.currency, bigint, app.tx_kind, text, text, text, text, jsonb) to authenticated;
revoke execute on function app.wallet_apply(app.currency, bigint, app.tx_kind, text, text, text, text, jsonb, text) from public, anon, authenticated;
revoke all on function app.secret(text) from public, anon, authenticated;

comment on function app.wallet_apply is 'Single choke point for every balance change: validates, locks the row, is idempotent on request_id, and writes an immutable ledger row.';
comment on table app.wallet is 'Balances live here and nowhere else. Non-negative + bounded by CHECK, so a forged RPC can never produce a negative or unbounded balance.';
