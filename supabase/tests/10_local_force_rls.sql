-- Local-only harness tweaks (never shipped as a migration).
--
-- 1) FORCE ROW LEVEL SECURITY on every app.* table.  The harness applies migrations as a plain
--    role and also owns nothing, so this is mostly belt-and-braces — but it guarantees that no
--    assertion in supabase/tests/rls_and_wallet.sql can pass merely because "this role happens to
--    own the table", which is exactly the kind of hole a hosted project must not rely on.
-- 2) The service role gets the same table grants the platform gives it (see tools/test-db.sh),
--    plus BYPASSRLS from the shim, so fixtures can seed without inventing a permissive policy.
-- 3) app.assert(): the tiny checker the security tests use.  Owned by the platform admin here.
select 'alter table app.' || t.tablename || ' force row level security;'
  from pg_tables t
 where t.schemaname = 'app'
 order by 1\gexec

-- The service role bypasses RLS by privilege (BYPASSRLS, created in 00_local_supabase_shims.sql),
-- exactly like the hosted platform, so no policy is needed and none is created here: a policy
-- would hide the very class of mistake these tests are meant to find.

create or replace function app.assert(cond boolean, label text) returns void
language plpgsql as $$ begin
  if not coalesce(cond, false) then raise exception 'TEST FAILED: %', label; end if;
  raise notice '  ok — %', label;
end $$;
