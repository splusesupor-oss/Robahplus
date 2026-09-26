# `legacy/worker.raw.js` — code map (numbers re-measured from the redacted snapshot)

| fact | value |
| --- | --- |
| size / lines | 11,051,861 chars / 49,468 lines, one ES module |
| distinct `/api/…` route strings | **171** |
| method comparisons in the router | 120 × POST, 41 × GET, 2 × DELETE, 1 × PUT |
| KV calls (`env.CHAT.get/put/delete`, batches) | ~580 |
| real `WebSocket`/`WebSocketPair` sites | 3 (lines 21560, 24720, 38218) |
| inline HTML document | `<!DOCTYPE html>…</html>` with 18 `<style>` and 27 `<script>` blocks |

## Route families (top of 171)

| family | routes | what it owns | Supabase landing |
| --- | --- | --- | --- |
| `/api/admin/*` | 12 | panel, user search, grants, restrictions, purge | `functions/moderation`, `functions/wallet {action:admin-grant}` |
| `/api/quiz`, `/api/mensh`, `/api/lumb`, `/api/bow`, `/api/dots`, `/api/memh`, `/api/dooz`, `/api/words`, `/api/sudoku` | 79 | the nine mini-games: sessions, results, records, tanks/characters | `functions/rewards` + `app.game*` tables (outcome re-evaluated server-side) |
| `/api/groups/*` | 7 | create/join/leave/invite/kick/mute/ban/pin/settings | `functions/group` |
| `/api/chat`, `/api/messages/*` | 7 | group streams, seen markers, deletes | `functions/messages` + Realtime `app.group_message` |
| `/api/auth/*` | 5 | OTP request/verify, session, logout | `functions/auth` + `app.auth_code` + GoTrue |
| `/api/dm/*` | 5 | threads, send, history, delete | `functions/messages` (dm-*) |
| wallet / shop / diamonds | ~12 | balances, transactions, packs | `functions/wallet` + `app.diamond_package` |
| ranking | ~6 | weekly/monthly boards, prizes | `functions/rewards {action:ranking|claim-prize}` + `app.ranking_*` |
| media / avatar | ~8 | uploads, chunked avatar blobs | `functions/media` + Storage (chunking dropped: one object per file) |
| ai | ~9 | chat, characters, quota | `functions/ai` (key in `AI_GATEWAY_KEY`) |
| notifications | ~4 | FCM register/test | `functions/notifications` + `app.device_token` |

## Notable implementation facts (all verified by reading the bundle)

* `line 1897` — `const aiTok = env?.AI_TOKEN || "<REDACTED_CFUT_TOKEN>"`: the **Cloudflare account
  API token was the fallback for the AI gateway**. Anything that could reach the Worker's AI path
  could mint requests billed to the whole Cloudflare account.
* `line 44524` — `const ADMIN_PASS = "<REDACTED_ADMIN_PASS>"`: one static password, no expiry, no
  second factor, guarding the 12 admin routes.
* `line 48291` / `48314` — `if (key !== "<REDACTED_CFUT_TOKEN>")` guarded a migration/import
  endpoint, i.e. the same token doubled as an admin API key.
* `lines 963–967` — avatars are stored in KV **split into 16 KiB chunks** (`profile:avatar:<i>`)
  with `avatarChunks` bookkeeping in `profile:v1`. No versioning, no size limit, no MIME check.
* `lines 2011 / 2145 / 8826` — the client keeps `localStorage.fox_user`, which carries the wallet
  numbers the UI paints (see the cutover note in `docs/CUTOVER.md`).
* `lines 21560 / 24720 / 38218` — hand-rolled sockets (tank/presence and the fan-out pair) that
  Realtime replaces.
