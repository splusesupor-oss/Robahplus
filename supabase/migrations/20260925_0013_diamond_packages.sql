-- 0013 · diamond packages, purchases, profile writes, privilege hardening
-- Two structural rules drive this file:
--   * price lists that gate money must not live in the client bundle (or in an edge function's
--     source, where a mis-wired build could ship them) → they live in the database;
--   * a profile write must never be able to touch `role`, and a wallet write must never be
--     able to name another user.

-- ---------------------------------------------------------------------------
-- 1. server-owned price list
-- ---------------------------------------------------------------------------
create table app.diamond_package (
  id             text primary key check (id ~ '^[a-z0-9_]{2,40}$'),
  label          text not null,
  diamonds       int  not null check (diamonds between 1 and 100000),
  coins_required int  not null default 0 check (coins_required between 0 and 10000000),
  price_toman    int  not null default 0 check (price_toman between 0 and 100000000),
  position       int  not null default 0,
  active         boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create trigger diamond_package_touch before update on app.diamond_package
for each row execute function app.touch_updated_at();

alter table app.diamond_package enable row level security;
alter table app.diamond_package force row level security;
revoke insert, update, delete on table app.diamond_package from anon, authenticated;
grant select on table app.diamond_package to anon, authenticated;

create policy diamond_package_read on app.diamond_package for select
  using (active or app.is_admin());

comment on table app.diamond_package is 'Server-side catalogue of purchasable diamond packs. Clients read it, never write it.';

insert into app.diamond_package (id, label, diamonds, coins_required, price_toman, position) values
  ('dm_10',  '۱۰ الماس',  10,  20,     0, 10),
  ('dm_25',  '۲۵ الماس',  25,  50,     0, 20),
  ('dm_50',  '۵۰ الماس',  50, 100, 25000, 30),
  ('dm_100', '۱۰۰ الماس', 100, 200, 45000, 40)
on conflict (id) do nothing;

create function app.wallet_packages() returns jsonb
language sql stable security definer set search_path = public, app, extensions as $$
  select coalesce(jsonb_agg(jsonb_build_object(
           'id', p.id, 'label', p.label, 'diamonds', p.diamonds,
           'coinsRequired', p.coins_required, 'priceToman', p.price_toman) order by p.position), '[]'::jsonb)
    from app.diamond_package p
   where p.active
$$;
grant execute on function app.wallet_packages() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 2. purchase bookkeeping (idempotency shared with the wallet ledger)
-- ---------------------------------------------------------------------------
create table app.diamond_purchase (
  id            uuid primary key default app.gen_random_uuid(),
  phone         text not null references app.identity(phone) on delete cascade,
  package_id    text not null references app.diamond_package(id),
  payment_ref   text,
  amount_toman  int  not null default 0 check (amount_toman >= 0),
  status        text not null default 'pending'
                check (status in ('pending','completed','failed','refunded')),
  request_id    text not null unique,
  wallet_tx_id  uuid,
  created_at    timestamptz not null default now(),
  confirmed_at  timestamptz
);
create index diamond_purchase_phone_idx on app.diamond_purchase (phone, created_at desc);
create index diamond_purchase_pending_idx on app.diamond_purchase (status) where status = 'pending';

alter table app.diamond_purchase enable row level security;
alter table app.diamond_purchase force row level security;
revoke insert, update, delete on table app.diamond_purchase from anon, authenticated;
grant select on table app.diamond_purchase to authenticated;
create policy diamond_purchase_own on app.diamond_purchase for select to authenticated
  using (phone = app.current_phone());

comment on table app.diamond_purchase is 'One row per pack purchase attempt; request_id is the idempotency key and the phone is captured up-front so the gateway webhook needs no elevated rights.';

-- app.buy_diamond_pack(package_id, request_id, payment_ref?)
--   * called by the user's own session  → creates/updates a row for that phone;
--   * called by the payment webhook (service role, no phone in the JWT) → the phone is taken
--     from the pending row, so the webhook can only ever complete a purchase that a user
--     started themselves, and can never credit an arbitrary number.
create function app.buy_diamond_pack(p_package text, p_request_id text, p_payment_ref text default null)
returns jsonb
language plpgsql security definer
set search_path = public, app, extensions
as $$
declare
  v_self   text := app.current_phone();
  v_phone  text;
  v_pack   app.diamond_package;
  v_prev   app.diamond_purchase;
  v_res    jsonb;
begin
  if p_request_id is null or length(p_request_id) < 6 or length(p_request_id) > 128 then
    raise exception 'request_id required' using errcode = '22023';
  end if;

  select * into v_prev from app.diamond_purchase where request_id = p_request_id;
  if found and v_self <> '' and v_prev.phone <> v_self then
    raise exception 'request_id belongs to another user' using errcode = '42501';
  end if;
  if found and v_prev.status = 'completed' then
    return jsonb_build_object('ok', true, 'idempotent', true, 'purchase_id', v_prev.id,
                              'status', 'completed', 'wallet', app.wallet_snapshot_for(v_prev.phone));
  end if;

  v_phone := case when v_self <> '' then v_self else nullif(v_prev.phone, '') end;
  if v_phone is null then
    raise exception 'auth required' using errcode = '42501';
  end if;

  if p_package is not null then
    select * into v_pack from app.diamond_package where id = p_package and active;
    if not found then raise exception 'unknown package' using errcode = '22023'; end if;
  elsif found then
    select * into v_pack from app.diamond_package where id = v_prev.package_id;
  else
    raise exception 'package required' using errcode = '22023';
  end if;

  -- paid packs stay pending until the gateway confirms them; coin-funded packs settle now
  if v_pack.price_toman > 0 and p_payment_ref is null then
    insert into app.diamond_purchase (phone, package_id, amount_toman, status, request_id)
    values (v_phone, v_pack.id, v_pack.price_toman, 'pending', p_request_id)
    on conflict (request_id) do nothing;
    return jsonb_build_object('ok', true, 'status', 'pending', 'amount_toman', v_pack.price_toman,
                              'package_id', v_pack.id, 'request_id', p_request_id);
  end if;

  -- The self path uses the client-facing wrappers (they resolve the phone from the JWT and
  -- cannot name another user).  Only the gateway webhook may target another phone, and then it
  -- still has to satisfy wallet_apply's admin-code check — this function never bypasses it.
  if v_self <> '' then
    -- coin-funded pack: pay with fox coins now (a paid pack is never coin-charged here)
    if v_pack.coins_required > 0 and v_pack.price_toman = 0 then
      v_res := app.wallet_debit('fox_coin', v_pack.coins_required, 'diamond_pack', null, null,
                                v_pack.id, p_request_id || ':coin',
                                jsonb_build_object('packageId', v_pack.id, 'stage', 'coins'));
      if coalesce(v_res ->> 'ok', 'false') <> 'true' then return v_res; end if;
    end if;
    v_res := app.wallet_credit('diamond', v_pack.diamonds, 'diamond_pack', null, null,
                               v_pack.id || ':' || coalesce(p_payment_ref, p_request_id), p_request_id,
                               jsonb_build_object('packageId', v_pack.id, 'priceToman', v_pack.price_toman));
    if coalesce(v_res ->> 'ok', 'false') <> 'true' then
      if v_pack.coins_required > 0 and v_pack.price_toman = 0 then
        perform app.wallet_credit('fox_coin', v_pack.coins_required, 'refund', null, null,
                                  v_pack.id, p_request_id || ':refund',
                                  jsonb_build_object('reason', 'pack_failed', 'packageId', v_pack.id));
      end if;
      return v_res;
    end if;
  else
    if not app.is_service_call() then
      raise exception 'not allowed to complete another user'' purchase' using errcode = '42501';
    end if;
    if v_pack.price_toman = 0 then
      -- coin-funded packs settle inside the owner's own session; a webhook must not run them
      return jsonb_build_object('ok', false, 'error', 'coin_packs_need_owner_session');
    end if;
    -- a distinct request id (':settle') so the ledger entry never collides with the idempotency
    -- fingerprint of the pending row the user created themselves
    v_res := app.wallet_apply('diamond', v_pack.diamonds, 'diamond_pack', null, null,
                              v_pack.id || ':' || coalesce(p_payment_ref, p_request_id), p_request_id || ':settle',
                              jsonb_build_object('packageId', v_pack.id, 'priceToman', v_pack.price_toman,
                                                 'admin_code', app.secret('FOX_WALLET_ADMIN_CODE')),
                              v_phone);
    if coalesce(v_res ->> 'ok', 'false') <> 'true' then return v_res; end if;
  end if;

  insert into app.diamond_purchase (phone, package_id, payment_ref, amount_toman, status, request_id, wallet_tx_id, confirmed_at)
  values (v_phone, v_pack.id, p_payment_ref, v_pack.price_toman, 'completed', p_request_id,
          nullif(v_res ->> 'transaction_id', '')::uuid, now())
  on conflict (request_id) do update
     set status = 'completed',
         confirmed_at = now(),
         wallet_tx_id = coalesce(excluded.wallet_tx_id, app.diamond_purchase.wallet_tx_id),
         payment_ref  = coalesce(excluded.payment_ref, app.diamond_purchase.payment_ref);

  return jsonb_build_object('ok', true, 'status', 'completed', 'amount', v_pack.diamonds,
                            'package_id', v_pack.id, 'purchase_id',
                            (select id from app.diamond_purchase where request_id = p_request_id),
                            'transaction', v_res, 'wallet', app.wallet_snapshot_for(v_phone));
end $$;

-- snapshot helper with an explicit phone (security definer, used by the purchase flow above;
-- revoked from clients on purpose — the UI uses app.wallet_snapshot(), which is JWT-scoped)
create or replace function app.wallet_snapshot_for(p_phone text) returns jsonb
language sql stable security definer set search_path = public, app, extensions as $$
  select to_jsonb(w) from app.wallet w where w.phone = p_phone
$$;
revoke all on function app.wallet_snapshot_for(text) from public, anon, authenticated;
comment on function app.wallet_snapshot_for is 'Internal: read one wallet by phone for the purchase flow. Never callable from a client role.';

revoke execute on function app.buy_diamond_pack(text, text, text) from public, anon;
grant execute on function app.buy_diamond_pack(text, text, text) to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- 3. profile writes: one entry point, privileged columns out of reach
-- ---------------------------------------------------------------------------
create or replace function app.set_profile(
  p_name text default null, p_bio text default null, p_avatar_path text default null
) returns jsonb
language plpgsql security definer set search_path = public, app, extensions as $$
declare v_phone text := app.current_phone(); v app.profile;
begin
  if v_phone = '' then raise exception 'auth required' using errcode = '42501'; end if;
  update app.profile set
    name        = coalesce(nullif(trim(p_name), ''), name),
    bio         = coalesce(p_bio, bio),
    avatar_path = coalesce(p_avatar_path, avatar_path),
    avatar_url  = case when p_avatar_path is null then avatar_url else null end,
    profile_revision = profile_revision + 1
  where phone = v_phone
  returning * into v;
  return jsonb_build_object('ok', true, 'profile', to_jsonb(v));
end $$;
grant execute on function app.set_profile(text, text, text) to authenticated;

-- username: friendly error instead of a raw unique-violation, and it never touches role
create or replace function app.set_username(p_username text) returns void
language plpgsql security definer set search_path = public, app, extensions as $$
declare v_phone text := app.current_phone();
begin
  if v_phone = '' then raise exception 'auth required' using errcode = '42501'; end if;
  if p_username is null or p_username !~ '^[a-zA-Z0-9_.]{3,32}$' then
    raise exception 'invalid username' using errcode = '22023';
  end if;
  if exists (select 1 from app.profile p where p.username = p_username::app.citext and p.phone <> v_phone) then
    raise exception 'username_taken' using errcode = '23505';
  end if;
  update app.profile
     set username = p_username::app.citext, profile_revision = profile_revision + 1
   where phone = v_phone;
end $$;

-- Belt and braces on top of the column-grant + policy: a client may only ever create its own
-- profile as a plain `user`, and may never move a profile onto another identity.
create or replace function app.check_profile_privilege() returns trigger
language plpgsql security definer set search_path = public, app, extensions as $$
begin
  -- IMPORTANT: a BEFORE trigger that returns NULL silently drops the row (INSERT 0 0 with no
  -- error), so every path here must return NEW.  Guard triggers in this schema follow the same rule.
  if app.is_service_call() or app.is_admin() then return new; end if;
  if tg_op = 'INSERT' and new.role <> 'user' then
    raise exception 'cannot self-assign a privileged role' using errcode = '42501';
  end if;
  if tg_op = 'UPDATE' and new.role is distinct from old.role then
    raise exception 'cannot change own role' using errcode = '42501';
  end if;
  if tg_op = 'UPDATE' and (new.phone is distinct from old.phone or new.user_id is distinct from old.user_id) then
    raise exception 'cannot reassign a profile' using errcode = '42501';
  end if;
  return new;
end $$;
drop trigger if exists profile_privilege_guard on app.profile;
create trigger profile_privilege_guard before insert or update on app.profile
for each row execute function app.check_profile_privilege();
