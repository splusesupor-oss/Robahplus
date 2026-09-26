# Edge functions — the contract the client codes against

All nine live in `supabase/functions/<name>/index.ts` and share `supabase/functions/_shared/`:

| module | provides |
| --- | --- |
| `deps.ts` | pinned `@supabase/supabase-js` import (esm.sh, versioned — no floating deps) |
| `respond.ts` | `ok(data)` / `fail(code,msg,status,extra)` — the legacy envelope: `{ok:true,…}` / `{ok:false,error,msg,message}` + CORS |
| `context.ts` | `context(req,{admin,service})`, `AuthError`, `assertAdminCode`, `normalisePhone`, `serviceClient()` |

`context()` is the security boundary: **the acting phone comes only from the verified JWT**, it must
match `^09\d{9}$`, `exp` is checked, and the returned `user` client is bound to that JWT so every
query the function makes is still subject to RLS. `admin` (service-role) is only used for writes that
must cross users, and each such action carries its own guard.

## Common rules

* one entry point per domain, dispatched on `body.action`; unknown actions return the allowed list;
* money/reward actions require `requestId` (6–128 chars) → idempotent replay via
  `app.wallet_apply`'s fingerprint;
* whitelists are explicit: `CURRENCIES = {diamond, fox_coin}`, `KINDS` (the `app.tx_kind` enum
  minus the ones clients may never use, e.g. `admin_grant`), `MAX_AMOUNT = 1_000_000`;
* Persian user-facing `msg`, machine-readable `error` code, HTTP status — the client can switch on
  `error` and show `msg` verbatim;
* no secret is ever echoed: `admin-grant` writes `{currency, amount, requestId}` to `app.audit_log`,
  never the admin code (an earlier draft put it in the audit metadata; that is fixed).

## `auth`

| action | body | returns |
| --- | --- | --- |
| `send-code` | `{phone, kind:'login'|'register'}` | `{sent:true, expiresInSec}` — **the code is never echoed back**: only `sha256(code)` is stored in `app.auth_code` with `expires_at`, `attempts`, `used_at` |
| `verify` | `{phone, code, device?, pushToken?}` | `{session:{access_token,refresh_token,expires_in}, profile, wallet}` — creates the GoTrue user through the admin API if the phone is new, then inserts `app.identity` / `app.profile` / `app.wallet` and upserts `app.session_device` |
| `me` | — | `{user, wallet, serverTime}` |
| `profile` | `{name?, bio?, avatarPath?, username?}` | `{user, wallet, username}` — writes via `app.set_profile()` / `app.set_username()`; a taken handle returns `warning:"username_taken"`, never a 500 |
| `logout` | `{device?}` | `{signedOut:true}` — deletes that user's `app.device_token` rows (push stops) and the device pairing |

## `wallet`

`read` · `transactions` · `debit` · `credit` · `buy-diamond-pack` · `confirm-payment` ·
`packages` · `admin-grant`

* `read` calls `wallet_snapshot()`; **the response shape is what `apps/web/supabase/wallet.js`
  paints** — no arithmetic on the client.
* `debit`/`credit` return `{transaction, balance, idempotent, wallet}` (the whole wallet object, so
  the UI re-syncs in one step).
* `buy-diamond-pack` delegates to `app.buy_diamond_pack(package, request_id, payment_ref?)`: the
  price, coin cost and diamond amount are read from `app.diamond_package` inside the function —
  a client can only name an id. A paid pack returns `{status:'pending', amountToman}`.
* `confirm-payment` is the gateway's door: it may settle **only** a `request_id` that a user already
  started (the phone is read back from `app.diamond_purchase`), needs the service role or
  `x-fox-admin-code`, and re-credits nothing on a retry.
* `admin-grant` requires `assertAdminCode` and passes `p_phone` to `app.wallet_apply`, which in turn
  demands `FOX_WALLET_ADMIN_CODE` in the metadata — two independent secrets for minting currency.

## `group`

`create` (charges 399 diamonds through `wallet_debit` and **refunds** if the insert fails) ·
`list` · `get` · `join` · `leave` · `invite` · `kick` · `set-role` · `mute` · `ban` · `pin` · `update`

Every mutating action re-checks `app.can_moderate_group(groupId)` server-side; `set-role` is the only
path to `admin`/`owner`, and the `group_member_role_guard` trigger blocks the same attempt through
REST (including `ON CONFLICT DO UPDATE`, which INSERT policies cannot see).

## `messages`

Group: `group-send` (mutes/bans/length checked server-side, `sender_phone` taken from the JWT —
forging someone else's message fails WITH CHECK), `group-history`, `group-delete`, `seen`.
DM: `dm-thread` (refuses when either side blocked the other), `dm-send`, `dm-history`, `dm-delete`
(soft, per-user). Live delivery is Realtime on `app.group_message`; the function layer is for writes
and history, so a client never needs a write policy on the message table.

## `rewards`

`start` → server opens the `app.game_session` and reserves the stake · `finish` → the outcome is
re-evaluated from `payload` (a client cannot declare a win) · `claim` → amounts come from
`app.game_reward_rule`, one grant per `(session, currency)`, `max_per_day` enforced, replay-safe ·
`ranking` / `claim-prize` → prizes are only claimable for a **frozen** period via
`app.claim_ranking_prize(period_type, period_key)`, deduped by the `app.ranking_claim` PK
(`already_claimed` on a second attempt).

## `media`

`sign-upload` → `createSignedUploadUrl` with path `<phone>/<ulid>.<ext>`; each `kind` has its own
size and MIME limits (enforced in the function and reported back as `maxBytes` so the UI can validate
before uploading), and the `app.media` row is inserted with the returned path · `finalize` → verifies the
object exists, records size/ETag, attaches it to a group/thread when asked · `sign-read` → a 600 s
signed URL for a private bucket object the caller may legitimately see (both URL types return
`expiresInSec` so the client knows its window).

## `moderation`

`report` · `queue` (admins) · `restrict` · `lift` · `purge-user` · `my-status` (reads
`app.current_restriction()`, which is what group/message policies consult). All admin actions write
`app.audit_log`; nothing here trusts a client-side "I am a moderator" claim — a moderator of group X
gets group X's queue, never another group's.

## `ai`

Proxies the upstream gateway with `AI_GATEWAY_KEY` server-side. Free quota first, then **1 fox coin
per message** debited with `p_request_id = 'ai:' + messageId`; if the upstream call fails the debit is
refunded under its own request id. Character pricing/personas come from `app.ai_character` (read-only
to clients), so a client cannot pick a free premium model.

## `notifications`

`register` / `unregister` / `test`. A Google OAuth token is minted in-function with Web Crypto
(RS256 over `FCM_SERVICE_ACCOUNT_JSON`) — no npm install, no key file in Storage. Tokens are
per-device rows; `test` sends only to the caller's own devices.

## Local run

```bash
supabase start && supabase db reset
supabase functions serve --env-file .env --no-verify-jwt   # local only: skips the JWT signature check
curl -s $SUPABASE_URL/functions/v1/wallet -H "authorization: Bearer $JWT" \
     -H 'content-type: application/json' -d '{"action":"read"}'
```

`deno task verify` (type-check + lint + format) runs in CI on every push, so a function that does
not type-check never reaches the project.
