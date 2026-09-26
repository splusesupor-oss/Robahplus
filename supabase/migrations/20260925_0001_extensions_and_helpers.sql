-- 0001 · extensions, enums, shared helpers
-- Target: Supabase Postgres 15+  (schema `app` holds helpers, public holds the data model)

create schema if not exists app;

create extension if not exists pgcrypto;
create extension if not exists citext;

-- ── enums ────────────────────────────────────────────────────────────────────
create type app.currency     as enum ('diamond','fox_coin');
create type app.tx_kind      as enum (
  'game_reward','diamond_pack','coin_purchase','transfer','spend','refund',
  'group_creation','group_join_fee','character_purchase','tank_purchase',
  'ai_message','ai_conversation_credits','ranking_prize','profile_bonus','admin_grant'
);
create type app.tx_status    as enum ('pending','completed','failed','reversed');
create type app.period_type  as enum ('weekly','monthly');
create type app.role_tier    as enum ('member','admin','owner');
create type app.restrict_kind as enum ('ban','mute');
create type app.report_state as enum ('new','reviewed','actioned','rejected');

create function app.current_user_id() returns uuid
language sql stable
as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;

-- The PostgREST request role.  Empty/unset means "not an API request at all" (a migration, a
-- fixture, psql), which behaves like the service role for the checks below.
create function app.jwt_role() returns text
language sql stable as $$
  select coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    nullif(coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb ->> 'role', ''),
    'service_role'
  )::text
$$;

create function app.is_service_call() returns boolean
language sql stable as $$ select (app.jwt_role() = 'service_role') $$;

create function app.is_admin() returns boolean
language sql stable security definer
set search_path = public, app
as $$
  select coalesce(
    (coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb
       -> 'app_metadata' ->> 'role') = 'admin',
    false
  );
$$;

-- ── shared guards ────────────────────────────────────────────────────────────
create function app.touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

comment on schema app is 'Robah Plus data model + server-side helpers (RLS-aware)';
comment on function app.is_admin() is 'True when the JWT app_metadata.role is "admin" — the only way to reach admin-only paths.';
