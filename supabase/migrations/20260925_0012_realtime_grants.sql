-- 0012 · realtime, sequences, grants, compat views
-- Realtime: the client subscribes to postgres_changes with a filter on group_id / thread_id.
-- Because RLS already hides foreign rows, the publication below is safe.
do $$
begin
  if exists (select 1 from pg_catalog.pg_publication where pubname = 'supabase_realtime') then
    execute 'alter publication supabase_realtime add table app.group_message';
    execute 'alter publication supabase_realtime add table app.dm_message';
    execute 'alter publication supabase_realtime add table app.wallet';
    execute 'alter publication supabase_realtime add table app.report';
  else
    raise notice 'supabase_realtime publication not present (local test db) — skipping';
  end if;
end $$;

-- Realtime on app.* requires the schema be readable by the anon/authenticated roles we grant below.
grant usage on schema app to anon, authenticated, service_role;
grant select on all tables in schema app to authenticated;
grant select on all sequences in schema app to authenticated;
grant execute on all functions in schema app to authenticated;
revoke execute on function app.secret(text) from public, anon, authenticated;
revoke all on table app.config_secret_ref from public, anon, authenticated;
alter default privileges in schema app grant select on tables to authenticated;

-- ── legacy compatibility views: the current web client speaks `phone`, the new model too.
create view app.leaderboard_weekly as
select rank() over (order by e.diamonds desc, e.fox_coins desc) as rank,
       p.phone, p.name, p.username, p.avatar_url, e.diamonds, e.fox_coins
  from app.ranking_entry e
  join app.ranking_period pr on pr.id = e.period_id
  join app.profile p on p.phone = e.phone
 where pr.period_key = to_char(now(), 'IYYY-"W"IW');

comment on view app.leaderboard_weekly is 'Drop-in for the legacy getLeaderboards() payload.';
