-- Local stand-in for the parts of a Supabase project that our migrations depend on.
-- Applied before supabase/migrations/*.sql by `tools/test-db.sh` so the SQL can be
-- exercised with a stock postgres server.  In a real Supabase project these objects
-- already exist and this file is NOT applied.
-- The stand-in schemas must exist before anything references or grants on them.
create schema if not exists app;
create schema if not exists auth;
create schema if not exists storage;
create schema if not exists supabase_realtime;

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then
    create role service_role nologin bypassrls;  -- Supabase's own service_role has BYPASSRLS
  end if;
  -- Supabase's own superuser: owns the app schema, so security-definer helpers bypass RLS
  if not exists (select 1 from pg_roles where rolname = 'supabase_admin') then
    create role supabase_admin superuser login;
  end if;
end $$;

-- The harness connects as one login role; make it a member of every API role so the test file can
-- switch between them with `set role`, exactly as PostgREST does per request.
grant anon, authenticated, service_role to current_user;

-- In a hosted project these grants already exist; here we mirror them.
grant usage on schema auth, storage to anon, authenticated, service_role;

-- auth.users (subset) — the real Supabase table owns passwords/phone confirmation
create table if not exists auth.users (
  id uuid primary key default gen_random_uuid(),
  phone text unique,
  phone_confirmed_at timestamptz,
  raw_user_meta_data jsonb not null default '{}'::jsonb,
  raw_app_meta_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- auth.jwt() / auth.uid() as Supabase defines them
create or replace function auth.jwt() returns jsonb language sql stable as $$
  select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb
$$;
create or replace function auth.uid() returns uuid language sql stable as $$
  select nullif(coalesce(auth.jwt() ->> 'sub', ''), '')::uuid
$$;
create or replace function auth.role() returns text language sql stable as $$
  select coalesce(nullif(current_setting('request.jwt.claim.role', true), ''), auth.jwt() ->> 'role')
$$;

-- storage schema bits used by 0008
create table if not exists storage.buckets (
  id text primary key, name text, public boolean default false,
  file_size_limit bigint, allowed_mime_types text[], created_at timestamptz default now()
);
create table if not exists storage.objects (
  id uuid primary key default gen_random_uuid(),
  bucket_id text references storage.buckets(id),
  name text, owner uuid, created_at timestamptz default now(),
  unique (bucket_id, name)
);
-- the harness' service_role needs the same rights the platform gives it on auth.*/storage.*
grant all on all tables in schema auth to service_role;
grant all on all tables in schema storage to service_role;
grant usage on schema auth, storage to service_role;

create or replace function storage.foldername(name text) returns text[] language sql immutable as $$
  select string_to_array(regexp_replace(name, '/[^/]*$', ''), '/')
$$;
alter table storage.objects enable row level security;

-- Test identities: three logins that are members of `authenticated`, so the security tests can
-- switch context with `set role` while the JWT claims supply the phone / role of the user.
do $$
declare r text;
begin
  foreach r in array array['fox_a','fox_b','fox_admin'] loop
    if not exists (select 1 from pg_roles where rolname = r) then
      execute format('create role %I login', r);
    end if;
    execute format('grant authenticated to %I', r);
    execute format('grant usage on schema app, auth, storage to %I', r);
  end loop;
end $$;

grant execute on function auth.jwt(), auth.uid(), auth.role() to anon, authenticated, service_role;
