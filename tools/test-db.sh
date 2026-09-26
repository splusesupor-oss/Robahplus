#!/usr/bin/env bash
# tools/test-db.sh — apply shims + migrations + security tests against a local postgres.
#
#   tools/test-db.sh                                   # throwaway cluster in ./.pgdata
#   DATABASE_URL=postgres.example-invalid://useR:passWoRd@host:5432/db tools/test-db.sh
#
# Exit code 0 means: every migration applied AND every RLS / wallet / group-isolation
# assertion passed.  Security tests only count when they run against a real engine, so this
# script exists to make `npm run test:db` runnable in CI without a Supabase project.
#
# Notes on fidelity:
#   * FORCE ROW LEVEL SECURITY is switched on for every app.* table, so the harness cannot get a
#     "green" run merely because the role running the test happens to own the tables.
#   * Roles anon / authenticated / service_role and the auth.* / storage.* stand-ins come from
#     supabase/tests/00_local_supabase_shims.sql (never shipped as a migration).
#   * Things a hosted project adds on top (Realtime publication, storage RLS on the real
#     storage.objects, PostgREST's role switching) are asserted by reading the policy list, not
#     by this harness.
set -euo pipefail
cd "$(dirname "$0")/.."

PGBIN="${PGBIN:-$( { ls -d /usr/lib/postgresql/*/bin 2>/dev/null || true; } | tail -1)}"
# A sandbox/CI image without the server binaries: install them so `npm run test:db` still runs.
if [[ -z "${DATABASE_URL:-}" && -z "$PGBIN" && "${FOX_PG_AUTOINSTALL:-1}" == "1" ]]; then
  echo "· postgres binaries missing → installing (apt-get)"
  (sudo -n apt-get update -qq || apt-get update -qq) >/dev/null 2>&1 || true
  echo "· (install can take ~30s)"
  (sudo -n DEBIAN_FRONTEND=noninteractive apt-get install -y -qq postgresql postgresql-contrib      || DEBIAN_FRONTEND=noninteractive apt-get install -y -qq postgresql postgresql-contrib) >/dev/null 2>&1 || true
  PGBIN="$( { ls -d /usr/lib/postgresql/*/bin 2>/dev/null || true; } | tail -1)"
fi
if [[ -z "${DATABASE_URL:-}" && -z "$PGBIN" ]]; then
  echo "✗ no postgres found. Either point DATABASE_URL at a scratch database, or install the" >&2
  echo "  server (Debian/Ubuntu: apt-get install postgresql) and re-run.  Migrations are plain" >&2
  echo "  SQL, so \`supabase db push\` in the hosted project does not need this script at all." >&2
  exit 3
fi
PGDATA="${PGDATA:-$PWD/.pgdata}"
PORT="${PGPORT:-55432}"
DB="${DBNAME:-robah}"
RUNAS="${RUNAS:-fox}"

psql_run() { # psql_run <-f file | -c "sql">
  if [[ -n "${DATABASE_URL:-}" ]]; then
    psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -q "$@"
  else
    "$PGBIN/psql" -h /tmp -p "$PORT" -d "$DB" -U "$RUNAS" -v ON_ERROR_STOP=1 -q "$@"
  fi
}

if [[ -z "${DATABASE_URL:-}" ]]; then
  if [[ ! -f "$PGDATA/PG_VERSION" ]]; then
    echo "· initdb → $PGDATA"
    rm -rf "$PGDATA"; mkdir -p "$PGDATA"
    "$PGBIN/initdb" -D "$PGDATA" -U "$RUNAS" --auth=trust -E UTF8 --locale=C >/dev/null
    chmod 700 "$PGDATA"   # a workspace snapshot/restore can widen this, and postgres then refuses to boot
  fi
  if ! "$PGBIN/pg_isready" -h /tmp -p "$PORT" -q 2>/dev/null; then
    echo "· starting postgres on port $PORT"
    "$PGBIN/pg_ctl" -D "$PGDATA" -o "-p $PORT -k /tmp -c listen_addresses=''" -l "$PGDATA/server.log" start >/dev/null
    sleep 1
  fi
  "$PGBIN/psql" -h /tmp -p "$PORT" -d postgres -U "$RUNAS" -Atc "select 1 from pg_database where datname='$DB'" \
    | grep -q 1 || "$PGBIN/createdb" -h /tmp -p "$PORT" -U "$RUNAS" "$DB"
fi

echo "· resetting"
psql_run -c "set client_min_messages to warning; drop schema if exists app cascade; create schema if not exists app;" >/dev/null
psql_run -c "truncate storage.objects, storage.buckets; delete from auth.users;" >/dev/null 2>&1 || true
# extensions are created by migration 0001 (`with schema app`), deliberately NOT pre-created here:
# doing so dropped them into `public` and made every `app.*` helper lookup fail on a fresh cluster.

echo "· applying local Supabase shims"
psql_run -f supabase/tests/00_local_supabase_shims.sql >/dev/null

for f in supabase/migrations/*.sql; do
  printf '· migration %s\n' "$f"
  psql_run -f "$f" >/dev/null
done

# service_role is what the edge functions run as: it needs the same access the platform grants it
psql_run -c "grant usage, create on schema app to service_role;
  grant all on all tables in schema app to service_role;
  grant all on all sequences in schema app to service_role;
  grant all on all functions in schema app to service_role;" >/dev/null

echo "· forcing RLS (so ownership cannot mask a policy mistake)"
psql_run -f supabase/tests/10_local_force_rls.sql >/dev/null

echo "· security / RLS / wallet tests"
psql_run -f supabase/tests/rls_and_wallet.sql

# inventory, so CI logs show what actually landed
psql_run -c "
select 'tables' as kind, count(*) from pg_tables where schemaname='app'
union all select 'policies', count(*) from pg_policies where schemaname='app'
union all select 'security-definer fns', count(*) from pg_proc p join pg_namespace n on n.oid=p.pronamespace
   where n.nspname='app' and p.prosecdef
union all select 'rls-enforced tables', count(*) from pg_class c join pg_namespace n on n.oid=c.relnamespace
   where n.nspname='app' and c.relkind='r' and c.relrowsecurity
union all select 'tables WITHOUT rls', count(*) from pg_class c join pg_namespace n on n.oid=c.relnamespace
   where n.nspname='app' and c.relkind='r' and not c.relrowsecurity
order by 1;"

echo "✔ migrations + security tests OK"
