-- 0003 · OTP codes for the legacy 6-digit login flow (mirrors KV: usercode:<code>, codeHash:<h>)
-- Supabase phone auth (Twilio/VP) is the preferred path; this table exists so the existing
-- "کد ۶ رقمی" UX can be served by an edge function without inventing a new flow.  Codes are
-- stored hashed and are single-use.
create table app.auth_code (
  phone       text not null,
  code_hash   text not null primary key,
  kind        text not null check (kind in ('register','login')),
  attempts    integer not null default 0,
  created_at  timestamptz not null default now(),
  expires_at  timestamptz not null default (now() + interval '5 minutes')
);
create index auth_code_phone_idx on app.auth_code (phone, created_at desc);

-- the table is referenced by app.hash_code() before the wallet migration creates it
create table if not exists app.config_secret_ref (
  key   text primary key,
  value text not null
);

alter table app.auth_code enable row level security;
-- deliberately zero policies: the table is invisible to every API role, reachable only by
-- the auth edge function through the service-role client.
alter table app.auth_code force row level security;

-- the hash used for codes and for anything else that must never be compared in SQL: sha256 with
-- a server-side pepper, so a leaked table is not a leaked code list.
create function app.hash_code(p_code text) returns text
language sql security definer set search_path = public, app, extensions as $$
  -- reads the pepper straight from the config table: this function is created before app.secret()
  -- exists (wallet migration), and it must stay usable by the auth edge function only.
  select encode(digest(coalesce(p_code,'') || '|' ||
                       coalesce((select value from app.config_secret_ref where key = 'FOX_CODE_PEPPER'), 'dev-pepper-change-me'),
                       'sha256'), 'hex')
$$;
revoke all on function app.hash_code(text) from public, anon, authenticated;

comment on table app.auth_code is 'Single-use hashed OTP codes for register/login. No policies = unreadable through the API.';
