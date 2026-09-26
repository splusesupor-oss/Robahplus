# `fox-api` adapter — where each legacy route went

The extracted production bundle (see [`legacy/BUNDLE-NOTES.md`](../legacy/BUNDLE-NOTES.md))
embedded the whole backend in one Cloudflare Worker and exposed it as
`api('/api/<route>')`. The Worker bundle itself is **not** part of this repo on
purpose: it contains live credentials. What the frontend needs to keep working is
an adapter in front of Supabase, and the table below is the authoritative map.

Frontend-side entry points (loaded before everything else):

| file | provides |
| --- | --- |
| `apps/web/supabase/config.js` | `FOX_API_BASE`, `FOX_SUPABASE`, `foxFunction()`, `foxHeaders()`, `foxRealtime()`, `foxSession` |
| `apps/web/supabase/wallet.js` | `foxWallet.get() / .call() / .refresh() / .subscribe()` — the only wallet source the UI may render |

Everything is served by the Supabase project: edge functions under
`<project>/functions/v1/<name>`, tables under the `app` schema through PostgREST,
images through Storage, live rows through Realtime.

## Route map

| legacy `/api/...` | new call | notes |
| --- | --- | --- |
| `POST /api/auth/request-code` | `foxFunction('auth', {action:'send_code', phone})` | OTP is hashed in `app.auth_code`, never returned to the client |
| `POST /api/auth/verify-code` | `foxFunction('auth', {action:'verify', phone, code})` | provisions/updates the GoTrue user, returns `{session, profile, wallet}` |
| `GET /api/auth/me` | `foxFunction('auth', {action:'me'})` | profile + server wallet |
| `POST /api/auth/logout` | `foxFunction('auth', {action:'logout'})` | revokes the OTP table rows and the device row |
| `GET /api/wallet` | `foxFunction('wallet', {action:'read'})` | replaces every `localStorage.fox_user` balance read |
| `GET /api/wallet/transactions` | `foxFunction('wallet', {action:'transactions', limit, before})` | append-only ledger, own rows only |
| `POST /api/wallet/spend` | `foxFunction('wallet', {action:'debit', currency, amount, kind, requestId, ...})` | `requestId` makes retries safe |
| `POST /api/wallet/earn` | `foxFunction('wallet', {action:'credit', ...})` | only the service path can credit; client credit calls are rejected unless the kind is public (`pack_purchase`) |
| `GET /api/shop/packages` | `foxFunction('wallet', {action:'packages'})` | diamond packs now live in the DB (`app.diamond_package`), not in JS |
| `POST /api/shop/buy-pack` | `foxFunction('wallet', {action:'buy-diamond-pack', packageId, requestId})` | |
| `POST /api/groups/create` | `foxFunction('group', {action:'create', ...})` | charges the 399-diamond fee and refunds it if the insert fails |
| `GET /api/groups` | `foxFunction('group', {action:'list'})` | |
| `GET /api/groups/:id` | `foxFunction('group', {action:'get', groupId})` | |
| `POST /api/groups/join` | `foxFunction('group', {action:'join', invite})` | |
| `POST /api/groups/leave` | `foxFunction('group', {action:'leave', groupId})` | |
| `POST /api/groups/invite` | `foxFunction('group', {action:'invite', groupId, phone})` | |
| `POST /api/groups/kick` | `foxFunction('group', {action:'kick', ...})` | admin+ only, per group |
| `POST /api/groups/set-role` | `foxFunction('group', {action:'set-role', ...})` | |
| `POST /api/groups/mute` | `foxFunction('group', {action:'mute', ...})` | |
| `POST /api/groups/ban` | `foxFunction('group', {action:'ban', ...})` | ban is scoped to that `group_id` |
| `POST /api/groups/pin` | `foxFunction('group', {action:'pin', ...})` | |
| `PATCH /api/groups/:id` | `foxFunction('group', {action:'update', ...})` | name/rules/photo; no shared state between groups |
| `POST /api/messages/group` | `foxFunction('messages', {action:'group-send', groupId, ...})` | mutes/bans/length checks server-side |
| `GET /api/messages/group/:id` | `foxFunction('messages', {action:'group-history', groupId, before, limit})` | |
| `DELETE /api/messages/:id` | `foxFunction('messages', {action:'group-delete', messageId})` | own message, or moderator in that group |
| `POST /api/messages/group/seen` | `foxFunction('messages', {action:'group-seen', ...})` | |
| `GET /api/dm/thread` | `foxFunction('messages', {action:'dm-thread', peerPhone})` | refuses when either side blocked the other |
| `POST /api/dm/send` | `foxFunction('messages', {action:'dm-send', ...})` | |
| `GET /api/dm/history` | `foxFunction('messages', {action:'dm-history', ...})` | |
| `POST /api/games/start` | `foxFunction('rewards', {action:'start', gameCode})` | server opens the session and reserves the stake |
| `POST /api/games/finish` | `foxFunction('rewards', {action:'finish', sessionId, outcome, payload})` | the outcome is re-evaluated from `payload`; a client cannot declare a win |
| `POST /api/games/claim` | `foxFunction('rewards', {action:'claim', sessionId, requestId})` | amount comes from `app.game_reward_rule` |
| `GET /api/ranking` | `foxFunction('rewards', {action:'ranking', periodType, periodKey})` | |
| `POST /api/ranking/claim` | `foxFunction('rewards', {action:'claim-ranking-prize', periodType, periodKey})` | only for a period frozen by `app.freeze_ranking_period()` |
| `POST /api/media/upload` | `foxFunction('media', {action:'create-signed-upload-url', kind, mime, bytes})` → PUT → `{action:'finalize'}` | per-kind size/MIME limits, path `<phone>/<ulid>.<ext>` |
| `GET /api/media/url` | `foxFunction('media', {action:'signed-url', path})` | private bucket, 15-minute URLs |
| `POST /api/report` | `foxFunction('moderation', {action:'report', ...})` | |
| `GET /api/moderation/queue` | `foxFunction('moderation', {action:'queue'})` | admins only |
| `POST /api/moderation/restrict` | `foxFunction('moderation', {action:'restrict', ...})` | |
| `POST /api/moderation/lift` | `foxFunction('moderation', {action:'lift', ...})` | |
| `POST /api/moderation/purge` | `foxFunction('moderation', {action:'purge-user', ...})` | |
| `GET /api/me/restrictions` | `foxFunction('moderation', {action:'my-status'})` | reads `app.current_restriction()` |
| `POST /api/ai/chat` | `foxFunction('ai', {action:'chat', ...})` | upstream key stays in `AI_GATEWAY_KEY`; free quota, then 1 fox coin, refunded if upstream fails |
| `POST /api/notifications/register` | `foxFunction('notifications', {action:'register', token, platform})` | APK/web push tokens; per-device, never shared |
| `POST /api/notifications/unregister` | `foxFunction('notifications', {action:'unregister', token})` | |

## What replaced the Worker's websocket fan-out

Realtime is the platform's job now: `foxRealtime('group:<id>', handler)` subscribes
to `postgres_changes` on `app.group_message` filtered by `group_id`. RLS decides
row-by-row who may see a message, so a socket can no longer leak across groups,
and no presence/room bookkeeping has to be maintained by hand.

## What was deliberately **not** ported

* the Worker's in-memory rate limiter → Supabase edge-function level limits plus
  DB-side guards (`app.auth_code` attempts, `game_reward_rule.max_per_day`);
* any secret the Worker carried (admin code, AI gateway key, Firebase service
  account, Cloudflare tokens) → GitHub/Supabase Secrets by name only;
* client-side balance arithmetic and the `fox_user` localStorage wallet.
