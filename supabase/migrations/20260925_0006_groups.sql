-- 0006 · groups — per-group isolation is the whole point of this migration.
-- Legacy layout was KV: group:<id>, groups:list, group_msg:<id>, group_ban:<id>:<phone>,
-- group_seen:<phone>:<id>.  Here every group is an isolated row with its own message stream,
-- membership, settings, moderation and reports.  Two group_ids never share state — only the
-- engine (functions, policies, edge functions) is shared.

create table app.group (
  id            text primary key check (id ~ '^[a-z0-9][a-z0-9_.:-]{1,63}$'),
  name          text not null check (char_length(name) between 1 and 80),
  description   text not null default '' check (length(description) <= 1000),
  photo_path    text,
  owner_phone   text not null references app.identity(phone) on delete restrict,
  bot_enabled   boolean not null default true,
  allow_member_invite boolean not null default true,
  allow_member_edit   boolean not null default false,
  join_fee_diamonds integer not null default 0 check (join_fee_diamonds between 0 and 100000),
  settings      jsonb not null default '{}'::jsonb,
  pinned_message_id uuid,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table app.group_member (
  group_id      text not null references app.group(id) on delete cascade,
  phone         text not null references app.identity(phone) on delete cascade,
  role          app.role_tier not null default 'member',
  muted_until   timestamptz,                       -- per-group mute, set by that group's owner/admins
  joined_at     timestamptz not null default now(),
  primary key (group_id, phone)
);
create index group_member_phone_idx on app.group_member (phone);

create trigger group_touch before update on app.group
for each row execute function app.touch_updated_at();

-- ── hard anti-escalation barrier ─────────────────────────────────────────────
-- RLS cannot inspect the value of `excluded.role` on an ON CONFLICT … DO UPDATE, and a table
-- owner (or a future grant mistake) could bypass the policies.  This trigger runs on every
-- statement regardless of role, so "a member can never make themselves admin/owner" is true even
-- if a policy is ever loosened.  Moderators and service_role are the only ways to change a role.
create function app.check_member_role_change() returns trigger
language plpgsql security definer set search_path = public, app, extensions as $$
begin
  -- "no JWT at all" = a server-side statement (migration, fixture, direct SQL) → allowed
  if app.is_service_call() then
    return new;
  end if;
  -- an UPDATE moves a row from one group to another: the actor must moderate BOTH sides
  if tg_op = 'UPDATE' and not app.can_moderate_group(old.group_id) then
    raise exception 'membership belongs to another group' using errcode = '42501';
  end if;
  if app.is_admin() or app.can_moderate_group(new.group_id) then
    return new;
  end if;
  -- any change of role (including a self-join "downgrading" the owner) needs a moderator;
  -- a plain new membership as 'member' is the one case a client may write itself
  if tg_op = 'INSERT' or new.role is distinct from old.role then
    if new.role <> 'member' or tg_op = 'UPDATE' then
      raise exception 'role changes require a group moderator' using errcode = '42501';
    end if;
  end if;
  if tg_op = 'UPDATE' and old.phone is distinct from new.phone then
    raise exception 'membership cannot be reassigned' using errcode = '42501';
  end if;
  return new;
end $$;
create trigger group_member_role_guard before insert or update on app.group_member
for each row execute function app.check_member_role_change();

-- exactly one owner per group
create function app.check_group_owner() returns trigger
language plpgsql security definer set search_path = public, app, extensions as $$
begin
  if new.role <> 'owner' then return new; end if;
  if (select count(*) from app.group_member m
       where m.group_id = new.group_id and m.role = 'owner'
         and m.phone is distinct from new.phone) > 0 then
    raise exception 'a group can have only one owner' using errcode = '23514';
  end if;
  return new;
end $$;
create trigger group_owner_unique after insert or update of role on app.group_member
for each row execute function app.check_group_owner();

create table app.group_message (
  id            uuid primary key default gen_random_uuid(),
  group_id      text not null references app.group(id) on delete cascade,
  sender_phone  text references app.identity(phone) on delete set null,
  body          text not null check (length(body) <= 4000),
  media_paths   text[] not null default '{}',
  reply_to      uuid references app.group_message(id) on delete set null,
  forwarded_from jsonb,
  edited_at     timestamptz,
  created_at    timestamptz not null default now()
);
-- the hot path: newest messages of ONE group only
create index group_message_stream_idx on app.group_message (group_id, created_at desc, id desc);
create index group_message_sender_idx on app.group_message (sender_phone);

create table app.group_ban (
  group_id      text not null references app.group(id) on delete cascade,
  phone         text not null,
  reason        text not null default '',
  banned_by     text not null,
  expires_at    timestamptz,
  created_at    timestamptz not null default now(),
  primary key (group_id, phone)
);

create table app.group_seen (
  group_id      text not null references app.group(id) on delete cascade,
  phone         text not null references app.identity(phone) on delete cascade,
  last_read_at  timestamptz not null default now(),
  primary key (group_id, phone)
);

-- ── helpers used by policies (security definer: they may read tables the caller cannot) ──
create function app.is_group_banned(g text) returns boolean
language sql stable security definer set search_path = public, app, extensions as $$
  select exists (select 1 from app.group_ban b
                  where b.group_id = g and b.phone = app.current_phone()
                    and (b.expires_at is null or b.expires_at > now()))
$$;

create function app.is_group_member(g text) returns boolean
language sql stable security definer set search_path = public, app, extensions as $$
  select exists (
    select 1 from app.group_member m
     where m.group_id = g and m.phone = app.current_phone()
       and not app.is_group_banned(g)
  ) or exists (select 1 from app.group gp where gp.id = g and gp.owner_phone = app.current_phone()
                                          and not app.is_group_banned(g))
$$;

create function app.group_role(g text) returns app.role_tier
language sql stable security definer set search_path = public, app, extensions as $$
  select coalesce(
    (select m.role from app.group_member m where m.group_id = g and m.phone = app.current_phone()),
    case when exists (select 1 from app.group gp where gp.id = g and gp.owner_phone = app.current_phone())
         then 'owner'::app.role_tier end
  )
$$;

create function app.can_moderate_group(g text) returns boolean
language sql stable security definer set search_path = public, app, extensions as $$
  select app.is_admin() or app.group_role(g) in ('owner','admin')
$$;

create function app.is_group_muted(g text) returns boolean
language sql stable security definer set search_path = public, app, extensions as $$
  -- a muted member may read but not post; mirrors the legacy modstate `muteUntil`
  select exists (select 1 from app.group_member m
                  where m.group_id = g and m.phone = app.current_phone()
                    and m.muted_until is not null and m.muted_until > now())
     and not app.can_moderate_group(g)
$$;

-- ── RLS ──────────────────────────────────────────────────────────────────────
alter table app.group enable row level security;
alter table app.group_member enable row level security;
alter table app.group_message enable row level security;
alter table app.group_ban enable row level security;
alter table app.group_seen enable row level security;

-- Members of group X can read/modify group X only.  Queries for another group return zero
-- rows even when the id is guessed, which is what the "no shared group data" requirement means.
create policy group_read_member on app.group for select to authenticated
  using (app.is_group_member(id) or app.can_moderate_group(id));
create policy group_update_owner_or_admin on app.group for update to authenticated
  using (app.can_moderate_group(id)) with check (app.can_moderate_group(id));
-- deliberately no insert/delete policy: group creation (which also debits the 399-diamond fee)
-- and deletion only happen through the `group-create` / `group-delete` edge functions (service role)

create policy member_read_own_group on app.group_member for select to authenticated
  using (app.is_group_member(group_id) or phone = app.current_phone() or app.can_moderate_group(group_id));
-- only a service-role call (edge function) may write privileged roles, and only for a group it
-- moderates; a normal user always goes through member_self_join below
create policy member_write_owner_or_admin on app.group_member for insert to authenticated with check (
  app.is_service_call()
  and app.can_moderate_group(group_id)
  and not app.is_blocked_between(app.current_phone(), phone)
);
-- a user may join a public group themselves (fee/restrictions are validated by the edge fn),
-- but only ever as a plain member, and never into a group they were banned from
create policy member_self_join on app.group_member for insert to authenticated with check (
  phone = app.current_phone()
  and role = 'member'
  and not app.is_group_banned(group_id)
  -- "not already a member" is resolved from the group's own rows, not from the caller's view
  and not exists (select 1 from app.group_member x
                   where x.group_id = app.group_member.group_id
                     and x.phone = app.current_phone())
);
create policy member_delete on app.group_member for delete to authenticated
  using (app.can_moderate_group(group_id) or (phone = app.current_phone() and app.is_group_member(group_id)));
-- no UPDATE policy at all: promotion/demotion (make_admin / remove_admin) is admin-only and runs
-- through the edge function, so a member can never flip their own role to 'admin' or 'owner'.

create policy msg_read_member on app.group_message for select to authenticated
  using (app.is_group_member(group_id) or app.can_moderate_group(group_id));
create policy msg_insert_member on app.group_message for insert to authenticated with check (
  app.is_group_member(group_id)
  and sender_phone = app.current_phone()
  and not app.is_group_muted(group_id)
);
create policy msg_delete on app.group_message for delete to authenticated
  using (sender_phone = app.current_phone() or app.can_moderate_group(group_id));
create policy msg_edit_own on app.group_message for update to authenticated
  using (sender_phone = app.current_phone()) with check (sender_phone = app.current_phone());

create policy ban_read_mod on app.group_ban for select to authenticated using (app.can_moderate_group(group_id));
create policy ban_write_mod on app.group_ban for all to authenticated
  using (app.can_moderate_group(group_id)) with check (app.can_moderate_group(group_id) and banned_by = app.current_phone());

create policy seen_self on app.group_seen for all to authenticated
  using (phone = app.current_phone()) with check (phone = app.current_phone());

comment on table app.group_message is 'Per-group message stream, isolated by group_id. Realtime channel: postgres_changes filtered on group_id.';
comment on policy member_delete on app.group_member is 'Owners/admins remove anyone; a member may only remove themselves (leave). Role changes are impossible from the client.';
