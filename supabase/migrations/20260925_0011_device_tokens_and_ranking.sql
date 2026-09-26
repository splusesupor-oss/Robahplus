-- 0011 · device tokens, AI catalogue, ranking prize claim
-- Tables the edge functions `notifications` and `ai` need, plus the server-side prize payout.

create table app.device_token (
  token         text primary key,
  phone         text not null references app.identity(phone) on delete cascade,
  platform      text not null default 'android' check (platform in ('android','ios','web')),
  disabled_at   timestamptz,
  last_seen_at  timestamptz not null default now(),
  created_at    timestamptz not null default now()
);
create index device_token_phone_idx on app.device_token (phone);
alter table app.device_token enable row level security;
-- FCM tokens are service-role-managed (the notification function writes them).  Giving clients a
-- policy here would let one device disable another user's pushes, so: read-your-own, no writes.
create policy device_token_self_read on app.device_token for select to authenticated using (phone = app.current_phone());

create table app.ai_character (
  code           text primary key,
  title_fa       text not null,
  system_prompt  text not null default '',
  model          text not null default '',
  price_coins    integer not null default 1 check (price_coins between 0 and 100),
  daily_free     integer not null default 5 check (daily_free between 0 and 100),
  requires_ownership boolean not null default false,
  enabled        boolean not null default true
);
alter table app.ai_character enable row level security;
create policy ai_character_read on app.ai_character for select to authenticated using (enabled);
-- pricing lives server-side only: a client that could write here could set its own price to 0
grant select on app.ai_character to authenticated;

-- Ranking prizes: paid out of a *frozen* period only, once per (period, user).  The primary key
-- is what makes a double claim impossible; the amount is looked up, never accepted from the call.
create function app.claim_ranking_prize(p_period_type app.period_type default 'weekly', p_period_key text default null)
returns jsonb
language plpgsql security definer set search_path = public, app, extensions as $$
declare
  v_phone text := app.current_phone();
  pr      app.ranking_period;
  rk      integer;
  prize   integer;
  res     jsonb;
begin
  if v_phone = '' then return jsonb_build_object('ok', false, 'error', 'auth_required'); end if;

  select * into pr from app.ranking_period
   where type = p_period_type
     and period_key = coalesce(nullif(p_period_key, ''),
                               to_char(now(), case when p_period_type = 'weekly' then 'IYYY-"W"IW' else 'IYYY-MM' end))
   limit 1;
  if not found then return jsonb_build_object('ok', false, 'error', 'period_not_found'); end if;
  if pr.frozen_at is null then return jsonb_build_object('ok', false, 'error', 'period_not_frozen'); end if;

  select rank into rk from (
    select rank() over (order by e.diamonds desc, e.fox_coins desc) as rank, e.phone
      from app.ranking_entry e where e.period_id = pr.id
  ) r where r.phone = v_phone;
  if rk is null then return jsonb_build_object('ok', false, 'error', 'not_ranked'); end if;

  prize := app.ranking_prize_for(rk);
  if prize <= 0 then return jsonb_build_object('ok', false, 'error', 'no_prize', 'rank', rk); end if;

  res := app.wallet_apply('diamond', prize, 'ranking_prize', null, null, pr.period_key,
                          'ranking:' || pr.period_key || ':' || v_phone, jsonb_build_object('rank', rk), null);
  if coalesce((res ->> 'ok')::boolean, false) is not true then
    return jsonb_build_object('ok', false, 'error', coalesce(res ->> 'error', 'wallet_error'));
  end if;

  insert into app.ranking_claim (period_id, phone, rank, prize, transaction_id)
    values (pr.id, v_phone, rk, prize, (res ->> 'transaction_id')::uuid)
    on conflict (period_id, phone) do nothing;

  return jsonb_build_object('ok', true, 'rank', rk, 'prize', prize,
                            'transaction_id', res ->> 'transaction_id');
exception when unique_violation then
  return jsonb_build_object('ok', false, 'error', 'already_claimed');
end $$;

create function app.freeze_ranking_period(p_period_type app.period_type default 'weekly') returns jsonb
language plpgsql security definer set search_path = public, app, extensions as $$
declare pr app.ranking_period;
begin
  -- scheduled (pg_cron / a CI job with the service key): marks the current period settled so its
  -- prizes become claimable, and snapshots the leaderboard into app.ranking_entry first.
  perform app.ranking_snapshot(p_period_type);
  select * into pr from app.ranking_period
   where type = p_period_type
     and period_key = to_char(now(), case when p_period_type = 'weekly' then 'IYYY-"W"IW' else 'IYYY-MM' end)
   limit 1;
  if not found then return jsonb_build_object('ok', false, 'error', 'no_period'); end if;
  update app.ranking_period set frozen_at = now() where id = pr.id and frozen_at is null;
  return jsonb_build_object('ok', true, 'period', pr.period_key, 'frozen', true);
end $$;

grant execute on function app.claim_ranking_prize(app.period_type, text) to authenticated;
revoke execute on function app.freeze_ranking_period(app.period_type) from public, anon, authenticated;
grant execute on function app.freeze_ranking_period(app.period_type) to service_role;

comment on function app.claim_ranking_prize is 'Pays the frozen period prize once per user; amount from app.ranking_prize_for, never from the caller.';
