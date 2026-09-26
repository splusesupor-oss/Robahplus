-- 0010 · media metadata + storage policies  (legacy: DO media-v2:<id> + KV media:/media-meta:)
create table app.media (
  id           uuid primary key default app.gen_random_uuid(),
  owner_phone  text not null references app.identity(phone) on delete cascade,
  bucket       text not null default 'fox-media' check (bucket in ('fox-media','fox-avatars','fox-group-photos')),
  object_path  text not null unique,
  content_type text not null,
  bytes        bigint not null check (bytes between 1 and 26214400),      -- 25 MiB cap, same as legacy MAX
  width        integer,
  height       integer,
  sha256       text,
  group_id     text references app.group(id) on delete set null,
  thread_id    uuid references app.dm_thread(id) on delete set null,
  created_at   timestamptz not null default now(),
  expires_at   timestamptz
);
create index media_owner_idx on app.media (owner_phone, created_at desc);

alter table app.media enable row level security;
create policy media_self_read on app.media for select to authenticated
  using (owner_phone = app.current_phone()
         or (group_id is not null and app.is_group_member(group_id))
         or (thread_id is not null and app.current_phone() = any (app.dm_participants(thread_id))));
create policy media_self_insert on app.media for insert to authenticated
  with check (owner_phone = app.current_phone());
create policy media_self_delete on app.media for delete to authenticated using (owner_phone = app.current_phone());

-- ── buckets: create once, then attach storage policies ──────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('fox-media',        'fox-media',        false, 26214400, array['image/jpeg','image/png','image/webp','image/gif','video/mp4','audio/mpeg','audio/ogg']),
  ('fox-avatars',      'fox-avatars',      true,   2097152, array['image/jpeg','image/png','image/webp']),
  ('fox-group-photos', 'fox-group-photos', true,   2097152, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

-- object path convention: <phone>/<ulid>.<ext> — the owner prefix is what the policies key on
create policy fox_media_owner_rw on storage.objects for all to authenticated
  using (bucket_id in ('fox-media','fox-avatars','fox-group-photos') and (storage.foldername(name))[1] = app.current_phone())
  with check (bucket_id in ('fox-media','fox-avatars','fox-group-photos') and (storage.foldername(name))[1] = app.current_phone());

create policy fox_public_read on storage.objects for select to anon, authenticated
  using (bucket_id in ('fox-avatars','fox-group-photos') or (bucket_id = 'fox-media' and app.current_phone() = (storage.foldername(name))[1]));

comment on table app.media is 'Metadata for uploaded objects; the bytes live in Supabase Storage. Group/thread recipients get read access through the join columns.';
