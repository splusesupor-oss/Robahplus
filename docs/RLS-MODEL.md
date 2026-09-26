# RLS model — what each layer is responsible for

Threat model, in the order the request travels:

```
browser / APK ──(1)──▶ Edge Function ──(2)──▶ PostgREST ──(3)──▶ Postgres RLS ──(4)──▶ triggers + CHECKs ──(5)──▶ guards inside SECURITY DEFINER fns
   no secrets          JWT, action whitelist    anon/authenticated    policies below      server-only columns      admin code, idempotency,
                       amount/kind whitelists   key + user JWT        (48 policies)       non-negative balances    frozen periods, group scope
```

(1) The client only ever holds the publishable key. (2) Edge functions re-derive the phone from the
verified JWT — never from the body — and whitelist `kind`/`currency`/amount ranges. (3) RLS is what
makes (2) non-load-bearing: a raw REST call with the anon key cannot see or write what a policy
excludes. (4) Column-level grants + `CHECK`s make the remaining columns unreachable and the values
bounded. (5) Function-internal guards cover what no policy can express (cross-row invariants,
idempotency, external secrets).

## Inventory (48 policies, dumped from the test database)

| table | policy | command | rule |
| --- | --- | --- | --- |
| `app.identity` | `identity_no_client_read` | SELECT | `false` — the phone↔user map is not readable from a client at all |
| `app.profile` | `profile_self_read` / `profile_self_write` / `profile_self_insert` | SELECT / UPDATE / INSERT | read: any profile (public handle); write: `phone = app.current_phone()`; insert: own row only, `role='user'` |
| `app.session_device` | `device_self` | ALL | own device rows |
| `app.contact` | `contact_owner` | ALL | own contacts |
| `app.block` | `block_owner` | ALL | own blocks (cross-table checks go through `app.is_blocked_between()`, a definer helper, because a policy cannot read a row RLS hides) |
| `app.auth_code` | *(none)* | — | service-role only: `anon`/`authenticated` have no grant, so an OTP can never be read or replayed through REST |
| `app.group` | `group_read_member` / `group_update_owner_or_admin` | SELECT / UPDATE | member-or-moderator reads; `app.can_moderate_group(id)` writes |
| `app.group_member` | `member_read_own_group` / `member_self_join` / `member_write_owner_or_admin` / `member_delete` | SELECT / INSERT / INSERT / DELETE | join only yourself as `member`, never if banned; admin/owner rows only via the service path; leave-your-own-or-kick-as-moderator |
| `app.group_message` | `msg_read_member` / `msg_insert_member` / `msg_edit_own` / `msg_delete` | SELECT / INSERT / UPDATE / DELETE | read/write inside your group; edit only your own body; delete own **or** as that group's moderator |
| `app.group_ban` | `ban_read_mod` / `ban_write_mod` | SELECT / ALL | per-group moderation only, and only for that `group_id` |
| `app.group_seen` | `seen_self` | ALL | your own read markers |
| `app.dm_thread` | `thread_participants` / `thread_start` | SELECT / INSERT | you must be `phone_a` or `phone_b`; start is checked by WITH CHECK + `app.is_blocked_between()` |
| `app.dm_message` | `dm_read_participants` / `dm_write_participants` / `dm_edit_own` / `dm_soft_delete` | SELECT / INSERT / UPDATE / DELETE | participant-only, honours `deleted_for`; hard delete is `false` → deletion is a soft marker |
| `app.dm_like` | `like_participants` | ALL | participants only |
| `app.wallet` | `wallet_self_read` | SELECT | **no write policy exists** → a balance can only move through `app.wallet_*` |
| `app.wallet_transaction` | `wallet_tx_self_read` | SELECT | same: append-only from the client's point of view |
| `app.diamond_package` | `diamond_package_read` | SELECT | active rows public; the catalogue is not writable by clients |
| `app.diamond_purchase` | `diamond_purchase_own` | SELECT | own purchases; writes belong to `app.buy_diamond_pack()` |
| `app.game` / `app.game_reward_rule` | `game_public_read` / `game_rule_public_read` | SELECT | the rules are readable (so the UI can show them) and never writable |
| `app.game_session` | `session_self` | ALL | your own sessions — a claim against someone else's id reads as "not found" |
| `app.game_reward_grant` | `grant_self_read` | SELECT | own grants; the grant itself is written inside `app.game_claim_reward()` |
| `app.ranking_period` / `app.ranking_entry` | `period_read` / `ranking_read` | SELECT | boards are public; no client write path |
| `app.ranking_claim` | `ranking_claim_self` | SELECT | claiming happens in `app.claim_ranking_prize()`, deduped by PK |
| `app.report` | `report_create` / `report_read_own` / `report_moderate` | INSERT / SELECT / UPDATE | file anything about anything; read your own or (as admin) all; only admins triage |
| `app.user_restriction` | `restriction_self_read` | SELECT | you can see your own restriction, never write one (`functions/moderation` does) |
| `app.audit_log` | `audit_admin_read` | SELECT | admins only; no client insert/update/delete grants |
| `app.media` | `media_self_read` / `media_self_insert` / `media_self_delete` | SELECT / INSERT / DELETE | own uploads, plus whatever a group/DM peer may legitimately see |
| `app.device_token` | `device_token_self_read` | SELECT | you can list your tokens; register/unregister is service-role |
| `app.ai_character` | `ai_character_read` | SELECT | read-only: pricing lives server-side |
| `app.config_secret_ref` | *(none, `FORCE RLS`)* | — | zero policies + RLS forced ⇒ unreadable to every non-owner role |

## Anti-escalation pair (the pattern to copy for new features)

A policy alone cannot stop `INSERT … ON CONFLICT DO UPDATE`, because `ON CONFLICT` actions are not
checked against INSERT policies. So privilege columns are guarded twice — see
`supabase/migrations/20260925_0005_groups.sql` and `…_0013_diamond_packages.sql`:

```sql
create policy member_self_join on app.group_member for insert to authenticated with check (
  phone = app.current_phone() and role = 'member' and not app.is_group_banned(group_id)
  and not exists (select 1 from app.group_member x
                   where x.group_id = app.group_member.group_id and x.phone = app.current_phone()));

create trigger group_member_role_guard before insert or update on app.group_member
for each row execute function app.check_member_role_change();
```

Rules that hold in every guard trigger in this schema:

* return `NEW` (or `OLD`) — returning `NULL` from a `BEFORE` trigger *silently drops the row*
  (`INSERT 0 0`, no error), which is the most dangerous failure mode a security trigger can have.
  The tests therefore assert on `GET DIAGNOSTICS row_count` as well as on errors;
* allow exactly three actors: `app.is_service_call()`, `app.is_admin()`, or whoever moderates that
  specific group — and for an `UPDATE`, refuse rows that try to move into a group the caller does
  not moderate (hijack-by-reparenting);
* never trust `current_setting('request.jwt.claims')` for a *value*; only through
  `app.current_phone()` / `app.is_admin()`, which are the single normalising point (E.164, `0098…`,
  bare `9…` all collapse to `09XXXXXXXXX`).

## Why `service_role` is trusted *and* still constrained

The platform's service role bypasses RLS by privilege — that is what makes it dangerous, so it is
never reachable from a client, and three extra checks exist inside the definer functions:

* `app.wallet_apply()` refuses an explicit `p_phone` (i.e. touching **another** user's balance)
  unless `p_meta->>'admin_code'` equals the `FOX_WALLET_ADMIN_CODE` secret;
* `assertAdminCode()` in every admin-facing action compares `x-fox-admin-code` to the
  `FOX_ADMIN_CODE` secret, so a leaked service key alone cannot grant admin rights;
* `functions/wallet {action:confirm-payment}` may complete a purchase **only** for a `request_id` a
  user started themselves (the phone is read back from `app.diamond_purchase`), and the amount comes
  from `app.diamond_package` — never from the request body.

## How this is verified

`supabase/tests/rls_and_wallet.sql` runs 12 numbered blocks against a real Postgres (84 assertions,
`npm run test:db`). Each block switches role *at statement level* (`set role fox_b` + a JWT GUC),
and every "must be refused" case is written as an expected exception with an explicit
`when … then raise notice 'ok'` plus `when raise_exception then raise;` so a typo cannot produce a
vacuous pass. Where an attacker's role cannot even see the row, the state is re-checked afterwards
as `service_role` — otherwise "I can't see it" would look like "it didn't happen".

The harness also applies `FORCE ROW LEVEL SECURITY` to every `app.*` table, so no test can pass
merely because the harness role happens to own the table.
