-- 0005 · reports, bans/mutes, admin audit  (legacy: reports, report:<id>, modstate, audit:*)
-- Server-side truth for moderation.  Nothing here is writable by a normal client:
-- a user can never lift their own restriction or flip their own role.
create table app.report (
  id             uuid primary key default gen_random_uuid(),
  reporter_phone text not null references app.identity(phone) on delete cascade,
  target_phone   text references app.identity(phone) on delete cascade,
  target_message uuid,                              -- group_message.id or dm_message.id
  group_id       text,                              -- validated by the reports edge fn; kept non-FK so reports outlive a deleted group
  reason         text not null check (char_length(reason) between 1 and 300),
  state          app.report_state not null default 'new',
  handled_by     text,
  handled_at     timestamptz,
  created_at     timestamptz not null default now()
);
create index report_state_idx on app.report (state, created_at desc);
create index report_group_idx on app.report (group_id, created_at desc);

create table app.user_restriction (
  phone       text not null references app.identity(phone) on delete cascade,
  kind        app.restrict_kind not null,            -- ban | mute (account-wide; per-group mute lives on group_member)
  reason      text not null default '',
  issued_by   text,                                  -- admin phone, or 'system'
  starts_at   timestamptz not null default now(),
  expires_at  timestamptz,                           -- null = permanent
  created_at  timestamptz not null default now(),
  primary key (phone, kind)
);
create index restriction_active_idx on app.user_restriction (phone, expires_at);

create table app.audit_log (
  id         bigint generated always as identity primary key,
  actor      text,
  action     text not null,            -- group_create, ban, unban, pin, unpin, make_admin, remove_admin, purge_user …
  target     text,
  group_id   text,
  detail     jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index audit_time_idx on app.audit_log (created_at desc);

-- used by the web/APK to render the "حساب شما محدود شده است" banner
create function app.current_restriction()
returns table (restricted boolean, kind text, reason text, expires_at timestamptz, permanent boolean)
language sql stable security definer set search_path = public, app as $$
  select true, r.kind::text, r.reason, r.expires_at, (r.expires_at is null)::boolean
    from app.user_restriction r
   where r.phone = app.current_phone()
     and (r.expires_at is null or r.expires_at > now())
   order by case r.kind when 'ban' then 0 else 1 end
   limit 1;
$$;

create function app.is_banned(p text) returns boolean
language sql stable security definer set search_path = public, app as $$
  select exists (select 1 from app.user_restriction r
                  where r.phone = p and r.kind = 'ban'
                    and (r.expires_at is null or r.expires_at > now()))
$$;

alter table app.report enable row level security;
alter table app.user_restriction enable row level security;
alter table app.audit_log enable row level security;

create policy report_create on app.report for insert to authenticated
  with check (reporter_phone = app.current_phone() and coalesce(target_phone, '') <> app.current_phone());
create policy report_read_own on app.report for select to authenticated
  using (reporter_phone = app.current_phone() or app.is_admin());
-- moderators may move a report along, nobody may delete one
create policy report_moderate on app.report for update to authenticated
  using (app.is_admin()) with check (app.is_admin() and handled_by = app.current_phone());

-- everyone may see whether *they* are restricted; writing restrictions is service-role only
create policy restriction_self_read on app.user_restriction for select to authenticated using (phone = app.current_phone());

create policy audit_admin_read on app.audit_log for select to authenticated using (app.is_admin());

comment on table app.user_restriction is 'Account-wide ban/mute. Clients have SELECT on their own row only — restrictions cannot be lifted from the frontend.';
comment on table app.report is 'User reports. The reporter is always the authenticated user; target and group are validated by the moderate/reports edge function.';
