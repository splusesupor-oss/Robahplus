# Supabase project — setup, secrets, and deploy

Region choice: **EU (Frankfurt / `eu-central-1`)** — closest to the current Cloudflare traffic and to
Tehran, and the pooler string in `.env.example` already assumes it.

## 1 · Create + link

```bash
supabase projects create robahplus --template empty        # or use the dashboard
supabase link --project-ref <PROJECT_REF>
```

`supabase link` writes the ref into `supabase/.temp/` (git-ignored). Nothing else in the repo
changes when you point at a real project: the migrations are plain SQL and
`supabase/migrations/` is already ordered `0001 … 0013`.

## 2 · Apply the schema

Two equivalent paths — pick one; both are idempotent-safe because the migrations use
`create table/function … if not exists`-friendly ordering and are meant to be applied exactly once,
in order.

```bash
supabase db push                 # uses supabase/migrations/ + the linked project
# or, with only a DATABASE_URL and no CLI:
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/migrations/20260925_0001_extensions_and_helpers.sql   # …and so on, in filename order
```

Migrations 0001–0013 create: extensions/enums/helpers, identity+social, hashed OTP codes, profiles,
moderation/reports, groups, DM, wallet, games/ranking, media/storage, device tokens + ranking
prizes, realtime grants, and the diamond-package catalogue.

> `tools/test-db.sh` applies the same files against a throwaway Postgres and then runs the security
> tests. Run it before pushing (`npm run test:db`).

## 3 · Auth configuration (dashboard → Authentication)

| setting | value | why |
| --- | --- | --- |
| Providers | **Phone** only | the app's identity is an Iranian mobile number |
| SMTP / email | disabled | signup by email is off in `supabase/config.toml` |
| JWT expiry | 24 h (or shorter) + refresh | the edge functions re-check `exp` |
| Phone provider | Twilio Verify (or MessageBird) | `functions/auth {action:send-code}` delegates to GoTrue once configured; until then it stores a hashed code in `app.auth_code` |
| Site URL | `https://ai-fox.aifox-bot.workers.dev` | already set in `config.toml` |
| `Raw App metadata` | `{"role":"admin"}` for operators only | the only way to become admin; enforced by `app.is_admin()` |

## 4 · Secrets (dashboard → Edge Functions → Secrets, or CLI)

```bash
supabase secrets set \
  SUPABASE_URL="https://<PROJECT_REF>.supabase.co" \
  SUPABASE_ANON_KEY="sb_publishable_…" \
  SUPABASE_SERVICE_ROLE_KEY="eyJ… (service_role)" \
  FOX_ADMIN_CODE="…" \
  FOX_WALLET_ADMIN_CODE="…" \
  AI_GATEWAY_URL="https://api.openai.com/v1" \
  AI_GATEWAY_KEY="sk-…" \
  FCM_SERVICE_ACCOUNT_JSON='{"project_id":…,"private_key":"-----BEGIN PRIVATE KEY-----…"}' \
  PAYMENT_GATEWAY_WEBHOOK_SECRET="…"
```

* `SUPABASE_URL` + `SUPABASE_ANON_KEY` are needed because the functions build a **user-scoped**
  client (RLS applies to everything they read on a user's behalf).
* `SUPABASE_SERVICE_ROLE_KEY` is used only for provisioning users, admin writes and webhook
  settlement; it must never reach a client bundle or the APK.
* `FOX_WALLET_ADMIN_CODE` is the extra proof `app.wallet_apply()` demands before it will move
  **another** user's balance. If it is unset, cross-user grants fail closed — which is the safe
  default, not a bug.
* `FCM_SERVICE_ACCOUNT_JSON` is parsed inside `functions/notifications` with Web Crypto (no npm
  install step), so nothing needs to be uploaded to Storage.

## 5 · Deploy the functions

```bash
supabase functions deploy                 # all nine
supabase functions deploy wallet --no-verify-jwt   # only if you want the gateway webhook to bypass platform JWT check
```

`verify_jwt = true` is set for every function in `supabase/config.toml`, and each function also
does its own `context(req)` check — belt and braces. The payment webhook is the single exception:
it authenticates with `x-fox-payment-signature` → `PAYMENT_GATEWAY_WEBHOOK_SECRET`, and the
function still refuses to complete a purchase the user did not start.

## 6 · Realtime + Storage

* Realtime: migration `0012` adds `app.group_message` / `app.dm_message` to the publication and
  grants `anon, authenticated` the `references` + `select` they need; RLS is re-evaluated per row,
  so a socket cannot cross groups.
* Storage: migration `0010` creates the private buckets (`avatars`, `chat-media`, `group-media`)
  with policies bound to `app.media`. Uploads go through `functions/media`, which returns a signed
  upload URL (`<phone>/<ulid>.<ext>`), enforces per-kind size/MIME limits, and records the row.

## 7 · CI/CD

`.github/workflows/ci.yml` runs on every push/PR (schema tests, split-view check, secret scan,
Deno verify). `.github/workflows/deploy.yml` runs on pushes to `main` touching `supabase/**` and
**is inert unless `SUPABASE_PROJECT_REF` + `SUPABASE_MANAGEMENT_TOKEN` exist** — that is
deliberate: no half-configured deploy can touch your project.

## The one thing you have to do

Neither GitHub push nor Supabase deploy is possible from here: the sandbox has **no GitHub
credential with write access** and **no Supabase project reference / management token**, and the
brief forbids putting any token in the repo. So:

1. push the bundle (`git bundle` output is described in the handover notes), and
2. add these four secrets in GitHub → Settings → Secrets and variables → Actions:
   `SUPABASE_PROJECT_REF`, `SUPABASE_MANAGEMENT_TOKEN`, `SUPABASE_SERVICE_ROLE_KEY`,
   `SUPABASE_ANON_KEY` (plus the app secrets in the Supabase dashboard, §4).

Everything else — migrations, functions, policies, CI, web build — is already in place and green.
