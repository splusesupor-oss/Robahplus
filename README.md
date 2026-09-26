# Robah Plus · روباه پلاس

Migration of the Robah Plus app (chat groups, direct messages, wallet with diamonds and fox
coins, mini-games, weekly ranking, AI chat, media, moderation, push notifications) from a single
11 MB Cloudflare Worker that owned *everything* — HTML, API, KV storage, secrets — to a normal,
reviewable stack:

```
   ┌─────────────── clients ────────────────┐        ┌──────────── Supabase project ─────────────┐
   │                                        │        │                                            │
   │  web  → Cloudflare Workers (unchanged) │  HTTPS │  Edge Functions  auth wallet group …       │
   │  APK  → WebView on the same URL        │ ─────▶ │  Postgres      app.* schema + RLS          │
   │                                        │        │  Storage       media buckets (private)     │
   │  no service-role key anywhere in them  │        │  Realtime      app.group_message / dm_*    │
   └────────────────────────────────────────┘        │  Auth        GoTrue users (phone OTP)    │
                                                     └────────────────────────────────────────────┘
```

The web host stays separate from Supabase (Supabase is not a static file host) and the Worker
keeps serving the current site while the backend is switched over file by file.

## Status

| area | state |
| --- | --- |
| Data model, RLS, server-side functions | ✅ 13 migrations, 32 tables, 48 policies — `npm run test:db` (84 security assertions) |
| Edge functions | ✅ 9 functions, type-checked + linted (`deno task verify`) |
| Web client | ✅ golden app preserved byte-for-byte + `apps/web/supabase/` adapter layer ready to flip |
| CI/CD | ✅ `ci.yml` (checks, secret gates) + `deploy-supabase.yml` / `deploy-web.yml` — deploy steps inert until secrets exist |
| Push to GitHub / deploy to Supabase | ⛔ committed and verified, but no credential exists here to push or deploy with — see [HANDOVER.md](HANDOVER.md) |

Read [docs/AUDIT.md](docs/AUDIT.md) for what the original project actually contained (including
two defects worth fixing) and [docs/CUTOVER.md](docs/CUTOVER.md) for the order of operations.

## Layout

```
apps/web/            golden/index.html = the shipped single-file app (byte-for-byte)
  golden/              the authoritative HTML, exactly what the Worker returns
  app/ styles/         derived views of the inline blocks (reading, diffing, linting)
  static/              187 hashed image assets referenced by the app
  supabase/            config.js + wallet.js + the route map (new: the cutover layer)
  overrides.json       reviewed literal patches applied at build time (all disabled today)
apps/mobile/         APK shell notes (WebView + FCM); see docs/APK.md
supabase/
  migrations/          20260925_0001 … 0013 — the whole data model, in order
  functions/           _shared/ + auth wallet group messages rewards media moderation ai notifications
  tests/               local Supabase shims, FORCE-RLS harness, rls_and_wallet.sql
  config.toml          CLI settings (no keys)
legacy/                redacted snapshot of the production Worker + provenance notes
tools/                 extraction, assembly, local postgres test runner, secret scanner
docs/                  AUDIT · RLS-MODEL · EDGE-FUNCTIONS · SUPABASE · CUTOVER · WEB-HOSTING · APK
HANDOVER.md            how to push, rotate the old Worker's credentials, and go live
.github/workflows/     CI (checks) + deploy (needs secrets)
.env.example           variable names only — never values
```

## Day-to-day commands

```bash
npm run test:db          # apply every migration on a throwaway postgres + run the security tests
npm run check:split      # prove apps/web/app|styles still match golden/index.html
npm run build            # apps/web/build/index.html (+ static assets) = deployable web dir
npm run check:secrets    # the repo's own credential gate (12 rule groups, entropy check)
npm run build            # then: npm run check:client → parses, matches golden, no secrets shipped
npm test                 # check:split + test:db + check:secrets
deno task verify         # type-check, lint and format-check the edge functions
```

Local stack, if you have the Supabase CLI and Docker:

```bash
supabase start
supabase db reset                     # shims + migrations + seed
supabase functions serve --env-file .env
```

## Security rules this repo is built around

1. **Wallet is server-side only.** Balances live in `app.wallet`; the client can read its own row
   and nothing else. There is no INSERT/UPDATE/DELETE policy on `app.wallet` or
   `app.wallet_transaction` at all, so a forged REST call cannot move a balance — every mutation
   goes through `app.wallet_apply()`, which locks the row, enforces non-negative CHECKs, and is
   idempotent on `request_id`.
2. **Rewards are decided by the database.** A client reports a game *outcome*; the amount comes
   from `app.game_reward_rule`, one grant per session, daily caps enforced.
3. **Groups are fully isolated.** Every row carries `group_id`; membership, messages, bans,
   reports, pins and settings are per group. Two groups never share data, and an outsider cannot
   even probe for a message id (RLS returns "not found", no information leak).
4. **Admin = JWT `app_metadata.role`, never a client flag.** Promotion happens only through edge
   functions holding the service key; triggers block self-promotion in `app.profile` and
   `app.group_member` (a `BEFORE` trigger that returned `NULL` would silently drop rows, so every
   guard returns `NEW` and the tests assert on row counts too).
5. **Secrets stay out of git.** Only `.env.example` carries names. Real values live in GitHub
   Secrets and Supabase Secrets; the APK and the browser see the publishable key only.
6. **Price lists live in the database** (`app.diamond_package`, `app.ranking_prize_for`,
   `app.ai_character`), so a tampered client cannot invent a package or a prize.

## Secrets: names, not values

| variable | where it goes | why |
| --- | --- | --- |
| `SUPABASE_URL`, `SUPABASE_ANON_KEY` | web build env, APK env, GitHub Secrets | public by design, RLS still applies |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Secrets + GitHub Secrets only | bypasses RLS — never in a client |
| `FOX_ADMIN_CODE`, `FOX_WALLET_ADMIN_CODE` | Supabase Secrets | second factor for admin actions / minting currency for another user |
| `AI_GATEWAY_KEY`, `FCM_SERVICE_ACCOUNT_JSON`, `PAYMENT_GATEWAY_WEBHOOK_SECRET` | Supabase Secrets | only ever read inside edge functions |
| `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` | GitHub Secrets | used by the (inert) worker-deploy step |

The old Worker contained live copies of several of these; the snapshot in `legacy/` has them
replaced by `<REDACTED_*>` placeholders and `tools/.secret-findings.json` records what was found
by name and count only. **Rotate the values that were live in the Worker before going public.**
