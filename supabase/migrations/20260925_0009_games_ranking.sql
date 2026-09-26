-- 0009 · games, reward rules, ranking  (legacy: room:<game>:<id> DOs + ranking:user:<phone>)
-- Rewards are NEVER taken from the client.  The client sends (game_code, mode, result);
-- the amount is looked up in app.game_reward_rule, exactly like GAME_REWARDS_CONFIG does today.
create table app.game (
  code        text primary key,                  -- 'quiz','sudoku','bow','memh','dooz','dots','mensh','lumb','words','tank','fe'
  title_fa    text not null,
  is_pvp      boolean not null default true,
  enabled     boolean not null default true,
  settings    jsonb not null default '{}'::jsonb
);

create table app.game_reward_rule (
  game_code   text not null references app.game(code) on delete cascade,
  mode        text not null default 'solo',      -- solo | pvp | tournament
  result      text not null default 'win',       -- win | lose | draw | mvp
  currency    app.currency not null,
  amount      integer not null check (amount between 1 and 1000),
  max_per_day integer not null default 20,
  primary key (game_code, mode, result, currency)
);

create table app.game_session (
  id           uuid primary key default gen_random_uuid(),
  game_code    text not null references app.game(code) on delete restrict,
  phone        text not null references app.identity(phone) on delete cascade,
  group_id     text references app.group(id) on delete set null,
  mode         text not null default 'solo',
  status       text not null default 'active' check (status in ('active','won','lost','draw','cancelled','expired')),
  started_at   timestamptz not null default now(),
  finished_at  timestamptz,
  result_meta  jsonb not null default '{}'::jsonb
);
create index game_session_phone_idx on app.game_session (phone, started_at desc);

create table app.game_reward_grant (
  id            uuid primary key default gen_random_uuid(),
  session_id    uuid not null references app.game_session(id) on delete cascade,
  phone         text not null references app.identity(phone) on delete cascade,
  game_code     text not null,
  mode          text not null,
  result        text not null,
  currency      app.currency not null,
  amount        integer not null,
  transaction_id uuid not null,
  granted_at    timestamptz not null default now(),
  unique (session_id, currency)                   -- one grant per session per currency, full stop
);

-- anti-cheat: per-day caps are enforced in the grant function, not in the client
-- A client may only say "session X finished".  The currency, the amount and the per-day cap
-- are all looked up server-side; the claim is idempotent per session.
create function app.game_claim_reward(p_session uuid, p_request_id text default null) returns jsonb
language plpgsql security definer set search_path = public, app, extensions as $$
declare
  s   app.game_session;
  r   app.game_reward_rule;
  g   app.game_reward_grant;
  res jsonb;
  today_count integer;
  outcome text;
begin
  select * into s from app.game_session
   where id = p_session and phone = app.current_phone();
  if not found then return jsonb_build_object('ok', false, 'error', 'session_not_found'); end if;
  if s.status in ('cancelled','expired') then
    return jsonb_build_object('ok', false, 'error', 'session_' || s.status);
  end if;

  -- already granted? hand back the original result (idempotent replay)
  select * into g from app.game_reward_grant where session_id = p_session;
  if found then
    return jsonb_build_object('ok', true, 'amount', g.amount, 'currency', g.currency,
                              'transaction_id', g.transaction_id, 'idempotent', true);
  end if;

  if s.status = 'active' then outcome := 'win'; else outcome := s.status; end if;
  select * into r from app.game_reward_rule
   where game_code = s.game_code and mode = s.mode and result = outcome;
  if not found then return jsonb_build_object('ok', false, 'error', 'no_reward_rule'); end if;

  select count(*) into today_count from app.game_reward_grant
   where phone = app.current_phone() and game_code = s.game_code
     and granted_at >= date_trunc('day', now());
  if today_count >= r.max_per_day then
    return jsonb_build_object('ok', false, 'error', 'daily_cap_reached');
  end if;

  res := app.wallet_apply(r.currency, r.amount, 'game_reward', null, s.game_code, p_session::text,
                          p_request_id, jsonb_build_object('mode', s.mode, 'result', outcome), null);
  if coalesce((res ->> 'ok')::boolean, false) is not true then
    return jsonb_build_object('ok', false, 'error', coalesce(res ->> 'error', 'wallet_error'));
  end if;

  insert into app.game_reward_grant (session_id, phone, game_code, mode, result, currency, amount, transaction_id)
    values (p_session, app.current_phone(), s.game_code, s.mode, outcome, r.currency, r.amount,
            (res ->> 'transaction_id')::uuid)
  on conflict (session_id, currency) do nothing
  returning * into g;
  if not found then
    -- lost a race against a parallel claim: re-read the winner
    select * into g from app.game_reward_grant where session_id = p_session;
    return jsonb_build_object('ok', true, 'amount', g.amount, 'currency', g.currency,
                              'transaction_id', g.transaction_id, 'idempotent', true);
  end if;

  update app.game_session
     set status = case when s.status = 'active' then 'won' else s.status end,
         finished_at = coalesce(finished_at, now())
   where id = p_session;
  update app.wallet
     set games_played = games_played + 1,
         games_won    = games_won + case when outcome in ('win','won') then 1 else 0 end
   where phone = app.current_phone();

  return jsonb_build_object('ok', true, 'amount', g.amount, 'currency', g.currency,
                            'transaction_id', g.transaction_id, 'idempotent', false);
end $$;

-- ── ranking (legacy: ranking:user:<phone>, ranking:history:*, freeze cron 35 20 * * *) ──
create table app.ranking_period (
  id          uuid primary key default gen_random_uuid(),
  type        app.period_type not null,
  period_key  text not null,                     -- '2026-W39' / '2026-09'
  frozen_at   timestamptz,
  unique (type, period_key)
);

create table app.ranking_entry (
  period_id   uuid not null references app.ranking_period(id) on delete cascade,
  phone       text not null references app.identity(phone) on delete cascade,
  diamonds    bigint not null default 0,
  fox_coins   bigint not null default 0,
  updated_at  timestamptz not null default now(),
  primary key (period_id, phone)
);

create table app.ranking_claim (
  period_id   uuid not null references app.ranking_period(id) on delete cascade,
  phone       text not null references app.identity(phone) on delete cascade,
  rank        integer not null,
  prize       integer not null,
  transaction_id uuid,
  claimed_at  timestamptz not null default now(),
  primary key (period_id, phone)
);

create function app.ranking_snapshot(p_type app.period_type default 'weekly') returns void
language sql security definer set search_path = public, app, extensions as $$
  insert into app.ranking_period (type, period_key)
  values (p_type, to_char(now(), case when p_type = 'weekly' then 'IYYY-"W"IW' else 'IYYY-MM' end))
  on conflict (type, period_key) do nothing;

  insert into app.ranking_entry (period_id, phone, diamonds, fox_coins)
  select p.id, w.phone, w.total_diamonds_earned, w.total_fox_coins_earned
    from app.ranking_period p join app.wallet w on true
   where p.type = p_type and p.period_key = to_char(now(), case when p_type = 'weekly' then 'IYYY-"W"IW' else 'IYYY-MM' end)
  on conflict (period_id, phone)
  do update set diamonds = excluded.diamonds, fox_coins = excluded.fox_coins, updated_at = now();
$$;

create function app.ranking_prize_for(r integer) returns integer
language sql immutable set search_path = public, app, extensions as $$
  select case r when 1 then 100 when 2 then 70 when 3 then 50 else 0 end   -- legacy RANKING_PRIZES
$$;

alter table app.game_session enable row level security;
alter table app.game_reward_grant enable row level security;
alter table app.ranking_entry enable row level security;
alter table app.ranking_claim enable row level security;
alter table app.game enable row level security;
alter table app.game_reward_rule enable row level security;
alter table app.ranking_period enable row level security;

create policy game_public_read on app.game for select to authenticated using (enabled);
create policy game_rule_public_read on app.game_reward_rule for select to authenticated using (true);
create policy session_self on app.game_session for all to authenticated
  using (phone = app.current_phone())
  with check (phone = app.current_phone() and status in ('active','won','lost','draw'));
-- a client may never write a grant row directly; only app.game_claim_reward does
create policy grant_self_read on app.game_reward_grant for select to authenticated using (phone = app.current_phone());
create policy ranking_read on app.ranking_entry for select to authenticated using (true);
create policy ranking_claim_self on app.ranking_claim for select to authenticated using (phone = app.current_phone());
create policy period_read on app.ranking_period for select to authenticated using (true);

grant execute on function app.game_claim_reward(uuid, text) to authenticated;

comment on table app.game_reward_grant is 'One row per session; combined with the CHECK on the rule table this is what makes a fake reward impossible.';
