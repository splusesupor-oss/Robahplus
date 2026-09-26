# Audit — what the project was, what is preserved, what is broken today

Scope of the audit: the production Worker bundle (the deployed `ai-fox` app, 49,468 lines —
inventory in [`legacy/CODEMAP.md`](../legacy/CODEMAP.md)), the HTML/CSS/JS it inlines, the KV
namespace it uses, its admin routes, its APK handshake, and the local build scripts. Nothing was
removed from the visible app while migrating: `apps/web/golden/index.html` is the live document
byte-for-byte, and `apps/web/app|styles` are derived views of it.

## 1 · What exists today (per subsystem)

| subsystem | current implementation (measured) | preserved by | notes |
| --- | --- | --- | --- |
| Frontend | single HTML doc, 18 `<style>` + 27 `<script>` inline blocks, 1.77 MiB; 187 hashed static images | `apps/web/` | still served by Cloudflare Workers; `npm run build` reproduces the deploy dir |
| Routing/API | 171 distinct `/api/…` routes in the Worker, all POST-ish (120 POST / 41 GET) | `supabase/functions/*` + RLS | full route→function map in `apps/web/supabase/README.md` |
| Auth | phone + OTP code checked in the Worker, session token held in `localStorage.fox_session` | `functions/auth`, `app.auth_code`, GoTrue users | code is stored **hashed** with a TTL and attempt counter; `fox_session` key kept so installed APKs resume |
| Identity | phone is the only user key (`09XXXXXXXXX`, sometimes E.164 in transit) | `app.identity`, `app.current_phone()` | normalisation table + tests (`rls_and_wallet.sql` block 8) |
| Groups | per-group members/roles/messages/settings in KV, one shared `group_id` string | `app.group*` (6 tables) | isolation is RLS-enforced and per-group bans; verified by tests 1–7 |
| DM | pairwise threads, block list | `app.dm_thread/dm_message/dm_like/app.block` | a blocked pair cannot even open a thread (`app.is_blocked_between()`) |
| Wallet | diamonds + fox coins in KV; the UI reads numbers from `localStorage.fox_user` | `app.wallet` + `app.wallet_transaction` + `functions/wallet` | client no longer has any write path; `apps/web/supabase/wallet.js` marks cached numbers `stale` until the server answers |
| Purchases | price list hard-coded in the bundle (`DIAMOND_PACKAGES`) | `app.diamond_package` + `app.buy_diamond_pack()` | moved into the DB (migration 0013) so the client bundle stops carrying prices |
| Games | nine games, each with its own `/api/<game>/…` family; results trusted from the client | `app.game*` + `functions/rewards` | outcome re-evaluated server-side, rule decides the amount, one grant per session, daily cap |
| Ranking | weekly/monthly boards computed on request | `app.ranking_period/entry` + `app.freeze_ranking_period()` | prizes only claimable for a **frozen** period, deduped by `app.ranking_claim` PK |
| Profile | `profile:v1` in KV + avatars split into 16 KiB KV chunks | `app.profile` + Storage via `functions/media` | chunking and its `avatarChunks` bookkeeping are gone; a profile write goes through `app.set_profile()` |
| AI chat | key fallback = the Cloudflare **account token** (bundle line 1897) | `functions/ai` + `AI_GATEWAY_KEY` | free quota then 1 fox coin, refunded if the upstream call fails |
| Media | KV blobs, no size/MIME checks | `functions/media` + private buckets | per-kind limits, `<phone>/<ulid>.<ext>` paths, 15-minute signed URLs |
| Moderation | one `ADMIN_PASS` constant guarding 12 admin routes | `functions/moderation` + `app.report/user_restriction/audit_log` | admin = JWT `app_metadata.role='admin'` **and** `FOX_ADMIN_CODE`; bans/mutes per group or global |
| Realtime | hand-rolled `WebSocketPair` fan-out + presence bookkeeping | Supabase Realtime (`postgres_changes` on `app.group_message`) | no room bookkeeping to leak across groups |
| Push | FCM via a service account embedded in the Worker | `functions/notifications` + `app.device_token` | credential moved to a Supabase Secret; tokens are per device, revocable |
| APK | WebView on the Worker URL, `RobahPush/1` UA marker, JS bridges (`window.RobahNative…`) | unchanged + `docs/APK.md` | the APK never learns the service-role key; base URL points at the project (or the Worker, which proxies to it) |
| Env/config | no `.env`, everything inline | `.env.example`, GitHub/Supabase Secrets | see §3 |

## 2 · Defects found in the current app (worth fixing, not caused by this migration)

1. **`apps/web/app/j25.js` does not parse, and the APK bridge guard is therefore dead.** The block
   wraps `window.prompt` so the internal channel tags `__fox_push_v1__` and `__fox_voice_v1__` (the
   strings the Worker's own push/voice hand-off uses) are swallowed in a plain browser instead of
   popping a native dialog. Two regex literals lost their backslashes:

   ```js
   /;s*wv)/                      // intended: /;\s*wv/   (Android WebView UA marker)
   /^__fox_[a-z0-9]+_vd+__$/i    // intended: /^__fox_[a-z0-9]+_v\d+__$/i
   ```

   Both throw at parse time (`node --check` fails on the block), so **the entire 15-line IIFE never
   runs** — a `SyntaxError` in a classic script cannot be caught by the `try` inside it, and the
   `try { … }catch(e){ return false }` guards around the two regexes are useless because the failure
   happens before the function is ever called. Consequence: the `window.prompt` wrapper is never
   installed, so a desktop/mobile *browser* shows a literal native dialog containing
   `__fox_push_v1__` / `__fox_voice_v1__` instead of swallowing it (the bug the comment at the top of
   the block promises to prevent). Inside the APK nothing regresses — the un-wrapped `prompt` is what
   the native bridge expects — which is exactly why nobody noticed. Fix = those two characters, one
   commit, no behaviour change on the native path.
   The same defect exists verbatim inside `apps/web/golden/index.html` (the split views are a faithful
   extraction: `node tools/02-extract-web.mjs --check` passes), which is why it is invisible today —
   browsers skip the broken block silently.
2. **AI calls were authenticated with the Cloudflare account token** (`env?.AI_TOKEN || "<token>"`),
   and the migration endpoint reused that token as its `key` check. Rotate it: one leaked AI call
   had account-wide blast radius.
3. **`ADMIN_PASS` is a single static string** for 12 admin routes, with no expiry and no second
   factor. In the new backend this becomes `app.is_admin()` (JWT claim, provisioned server-side)
   **plus** the `FOX_ADMIN_CODE` secret, and every admin action is written to `app.audit_log`.
4. **The wallet was readable and writable from the client's own storage.** `localStorage.fox_user`
   carried the numbers the UI shows; there was no ledger, so "spend 5 diamonds" and "win 50"
   were both client-declared. This is the single biggest reason the backend moved to Postgres:
   `app.wallet` has no client write policy at all, and `app.wallet_apply()` is the only door.
5. **Avatars in KV chunks** (`profile:avatar:<i>` at 16 KiB) have no integrity, size limit, MIME
   check, or expiry, and every read has to reassemble them. Storage buckets replace them; the
   client keeps working because `app.profile.avatar_path` is what `functions/media` signs.

## 3 · Secret hygiene (what must never enter the repo)

`tools/.secret-findings.json` records, by name and count only, what the redaction pass removed
from the legacy snapshot (a Cloudflare API token ×3, one admin password). Two scans guard the repo
from here on:

* `node tools/04-check-secrets.mjs` — dependency-free, 12 targeted rule groups (PEM keys, JWTs,
  provider token shapes, URL-embedded passwords, `Authorization:` literals, assignments to
  `*_key|*_token|password|admin_code`, plus an entropy check on token-shaped string literals);
* gitleaks, when the binary is present (`.gitleaks.toml` documents the three allowlisted
  false positives — game localStorage keys — and why the vendored bundle is covered by the scanner
  above instead).

Both are clean on the current tree:

```
$ node tools/04-check-secrets.mjs
✓ secret scan clean (90 file(s), 12 rule groups)
$ gitleaks dir . --no-banner --redact
INF scanned ~104.83 MB in 1.64s · INF no leaks found
```

`apps/web/golden/index.html` was re-read for live credentials after extraction: it contains no
`eyJ…` JWTs, no `sb_publishable_*` keys, no `cfut_`/`cfv0_` tokens (checked with the same
patterns as the scanner).

## 4 · What was deliberately not copied

* the Worker's KV namespace layout and its ad-hoc key strings → normalised tables + RPCs;
* its in-memory rate limiter → DB-side guards (`app.auth_code` attempts, `max_per_day`, sizes)
  plus per-function limits;
* the WebSocket fan-out → Realtime;
* inline secrets → Supabase Secrets (names in `.env.example` only);
* the client-side price list and reward amounts → `app.diamond_package`, `app.game_reward_rule`,
  `app.ranking_prize_for`, `app.ai_character`.

Nothing else was deleted: the app's feature surface (171 routes, nine games, ranking, groups, DM,
media, moderation, AI, push) is mapped in `apps/web/supabase/README.md`, each with the call the
frontend must make instead.
