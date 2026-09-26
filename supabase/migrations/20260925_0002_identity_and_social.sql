-- 0002 · identity, contacts and blocks — the shared primitives every other table depends on.
-- Legacy KV layout: user:<phone>, usercode:<code>, username:<name>, session:<token>,
-- blocks:<phone>, contacts:<phone>, device:<id>, phoneDevice:<phone>.
create table app.identity (
  phone       text primary key constraint identity_phone_check check (phone ~ '^09[0-9]{9}$'),
  user_id     uuid not null unique,
  created_at  timestamptz not null default now()
);

create table app.session_device (
  id          text primary key,                      -- legacy `device:<deviceId>` ↔ phone mapping
  phone       text not null references app.identity(phone) on delete cascade,
  ua          text not null default '',
  ip          inet,
  last_seen_at timestamptz not null default now(),
  created_at  timestamptz not null default now()
);
create unique index session_device_phone_key on app.session_device (phone, id);

create table app.contact (
  owner_phone   text not null references app.identity(phone) on delete cascade,
  contact_phone text not null references app.identity(phone) on delete cascade,
  created_at    timestamptz not null default now(),
  primary key (owner_phone, contact_phone)
);

create table app.block (
  blocker_phone text not null references app.identity(phone) on delete cascade,
  blocked_phone text not null references app.identity(phone) on delete cascade,
  created_at    timestamptz not null default now(),
  primary key (blocker_phone, blocked_phone)
);

-- The phone claim lives in the JWT; `app.identity` is the fallback for tokens minted before
-- the claim existed.  It is defined here (not in 0001) because it reads the table above.
create function app.current_phone() returns text
language sql stable security definer set search_path = public, app, extensions as $$
  -- Canonical local form 09XXXXXXXXX, normalised from whatever the token carries:
  -- Supabase stores phone in E.164 ("+989123456789"); legacy Robah Plus used 09123456789 and
  -- at one point a "98-9123456789" shape.  Never accepted from client input — JWT only.
  select case
           when v_digits = '' then ''
           when v_digits like '09%' and length(v_digits) = 11 then v_digits
           when v_digits like '9%'  and length(v_digits) = 10 then '0' || v_digits
           when v_digits like '989%'   then '0' || right(v_digits, 10)   -- +98 912 345 6789
           when v_digits like '00989%' then '0' || right(v_digits, 10)   -- 0098 912 345 6789
           when v_digits like '9%' and length(v_digits) = 11 and v_digits <> '9'||right(v_digits,10) then right(v_digits,11)
           when length(v_digits) = 11 then v_digits
           else ''
         end
    from (select translate(
            coalesce(
              nullif(regexp_replace(coalesce(auth.jwt() ->> 'phone', ''), '[^0-9]', '', 'g'), ''),
              (select i.phone from app.identity i where i.user_id = auth.uid())
            ), '', '') as v_digits) x;
$$;

-- Blocks and contacts are private.  Any policy in another table that has to read them must go
-- through a SECURITY DEFINER helper, otherwise RLS on app.block hides the row from the policy.
create function app.is_blocked_between(a text, b text) returns boolean
language sql stable security definer set search_path = public, app, extensions as $$
  select exists (select 1 from app.block
                  where (blocker_phone, blocked_phone) in ((a, b), (b, a)))
$$;

alter table app.contact enable row level security;
alter table app.block enable row level security;
alter table app.session_device enable row level security;
alter table app.identity enable row level security;

-- the phone ↔ auth.users mapping is created by the sign-in edge function, never by a client
create policy identity_no_client_read on app.identity for select to authenticated using (false);

create policy contact_owner on app.contact for all to authenticated
  using (owner_phone = app.current_phone()) with check (owner_phone = app.current_phone());
create policy block_owner on app.block for all to authenticated
  using (blocker_phone = app.current_phone()) with check (blocker_phone = app.current_phone());
create policy device_self on app.session_device for all to authenticated
  using (phone = app.current_phone()) with check (phone = app.current_phone());

comment on table app.identity is 'phone → auth.users.id map. The only client-visible identity fact is the JWT; this table is written by edge functions with the service role.';
comment on function app.is_blocked_between is 'Definer-side block check so cross-table policies are not defeated by RLS on app.block.';

comment on function app.current_phone() is 'Phone of the authenticated user, derived from the JWT only. Never accepted from client input.';
