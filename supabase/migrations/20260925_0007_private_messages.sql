-- 0007 · private chats and likes  (legacy KV: dm:<a>:<b>, likes)  · contacts/blocks live in 0002
create table app.dm_thread (
  id            uuid primary key default gen_random_uuid(),
  phone_a       text not null references app.identity(phone) on delete cascade,
  phone_b       text not null references app.identity(phone) on delete cascade,
  created_at    timestamptz not null default now(),
  unique (phone_a, phone_b)
);

create table app.dm_message (
  id            uuid primary key default gen_random_uuid(),
  thread_id     uuid not null references app.dm_thread(id) on delete cascade,
  sender_phone  text not null references app.identity(phone) on delete set null,
  body          text not null check (length(body) <= 4000),
  media_paths   text[] not null default '{}',
  reply_to      uuid references app.dm_message(id) on delete set null,
  deleted_for   text[] not null default '{}',          -- per-side soft delete (legacy "delete for me")
  edited_at     timestamptz,
  created_at    timestamptz not null default now()
);
create index dm_thread_stream_idx on app.dm_message (thread_id, created_at desc, id desc);



create table app.dm_like (
  thread_id     uuid not null references app.dm_thread(id) on delete cascade,
  message_id    uuid not null references app.dm_message(id) on delete cascade,
  phone         text not null references app.identity(phone) on delete cascade,
  created_at    timestamptz not null default now(),
  primary key (message_id, phone)
);

create function app.dm_participants(t uuid) returns text[]
language sql stable security definer set search_path = public, app as $$
  select array[phone_a, phone_b] from app.dm_thread where id = t
$$;

alter table app.dm_thread enable row level security;
alter table app.dm_message enable row level security;
alter table app.dm_like enable row level security;

-- a thread is visible to its two participants only — never to a third user, never by id guessing
create policy thread_participants on app.dm_thread for select to authenticated
  using (app.current_phone() in (phone_a, phone_b));
create policy thread_start on app.dm_thread for insert to authenticated with check (
  app.current_phone() in (phone_a, phone_b) and phone_a <> phone_b
  and not app.is_blocked_between(phone_a, phone_b)
);

create policy dm_read_participants on app.dm_message for select to authenticated
  using (app.current_phone() = any (app.dm_participants(thread_id))
         and not (app.current_phone() = any (deleted_for)));
create policy dm_write_participants on app.dm_message for insert to authenticated with check (
  app.current_phone() = any (app.dm_participants(thread_id))
  and sender_phone = app.current_phone()
  and not app.is_blocked_between(app.current_phone(),
        (select p from unnest(app.dm_participants(thread_id)) p where p <> app.current_phone() limit 1))
);
create policy dm_edit_own on app.dm_message for update to authenticated
  using (sender_phone = app.current_phone())
  with check (sender_phone = app.current_phone());
create policy dm_soft_delete on app.dm_message for delete to authenticated using (false);

create function app.dm_mark_deleted(m uuid) returns void
language sql security definer set search_path = public, app as $$
  update app.dm_message set deleted_for = array_append(deleted_for, app.current_phone()) where id = m;
$$;

create policy like_participants on app.dm_like for all to authenticated
  using (app.current_phone() = any (app.dm_participants(thread_id)))
  with check (app.current_phone() = any (app.dm_participants(thread_id)) and phone = app.current_phone());

comment on table app.dm_message is 'Direct messages. Hard delete is disabled for clients; per-side deletion is recorded in deleted_for.';
