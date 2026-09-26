-- 0004 · profiles (mirrors legacy KV keys: user:<phone>, username:<name>, profile:v1)
create table app.profile (
  phone           text primary key references app.identity(phone) on delete cascade,
  user_id         uuid not null unique,
  name            text not null default '',
  username        citext unique check (username is null or username ~ '^[a-zA-Z0-9_.]{3,32}$'),
  bio             text not null default '' check (length(bio) <= 500),
  avatar_url      text check (avatar_url is null or length(avatar_url) <= 2048),
  avatar_path     text,                                  -- storage object path, preferred over a raw URL
  code            text,                                  -- short invite/display code shown in the admin panel
  role            text not null default 'user' check (role in ('user','admin','moderator')),
  profile_revision bigint not null default 0,            -- drives the legacy identities: stream
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  last_seen_at    timestamptz not null default now()
);
create index profile_username_idx on app.profile (username);

create trigger profile_touch before update on app.profile
for each row execute function app.touch_updated_at();

-- username is global and unique: claim it atomically so no client can take a taken handle.
create function app.set_username(p_username text) returns void
language plpgsql security definer
set search_path = public, app
as $$
declare v_phone text := app.current_phone();
begin
  if v_phone = '' then raise exception 'auth required' using errcode = '42501'; end if;
  if p_username !~ '^[a-zA-Z0-9_.]{3,32}$' then raise exception 'invalid username' using errcode = '22023'; end if;
  update app.profile
     set username = p_username::citext, profile_revision = profile_revision + 1
   where phone = v_phone;
end $$;

-- Only the owner may edit their own profile, and never the privileged columns.
alter table app.profile enable row level security;
revoke update on table app.profile from anon, authenticated;
grant update (name, bio, avatar_url, avatar_path, profile_revision) on table app.profile to authenticated;

create policy profile_self_read on app.profile for select to authenticated using (true);
create policy profile_self_write on app.profile for update to authenticated
  using (phone = app.current_phone()) with check (phone = app.current_phone());
create policy profile_self_insert on app.profile for insert to authenticated
  with check (phone = app.current_phone() and user_id = auth.uid() and role = 'user');

comment on table app.profile is 'Public profile of a Robah Plus user. Privileged columns (role, user_id) are not updatable by clients.';
