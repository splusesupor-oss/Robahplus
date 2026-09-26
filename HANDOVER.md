# Handover — getting this repo to GitHub and Supabase

Everything in this repository is committed, verified and safe to publish. The two steps that cannot
happen from the migration machine are **push** (no GitHub credential with write access) and
**deploy** (no Supabase project reference / management token) — and per the brief, no token was ever
put in the repo to make those happen automatically. Do them once, in this order.

## A · Push

```bash
cd <this directory>
git log -1 --oneline                     # HEAD is the single migration commit
git remote add origin https://github.com/splusesupor-oss/Robahplus.git
git push --force-with-lease -u origin main          # the repo is empty today; --force-with-lease is safe
```

If you received this as a bundle instead of a directory:

```bash
git clone Robahplus-main.bundle Robahplus && cd Robahplus
git remote add origin https://github.com/splusesupor-oss/Robahplus.git
git push -u origin main
```

Then fix the commit author to yourself (optional but tidy):

```bash
git config user.name "Your Name" && git config user.email "you@example.com"
git commit --amend --reset-author --no-edit && git push --force-with-lease
```

**Check the repo is public-safe before/after pushing** (it should print `clean`):

```bash
node tools/04-check-secrets.mjs
```

## B · Rotate the credentials that were live in the Worker

The old bundle carried a Cloudflare API token in **three** places (it was also the AI gateway key
fallback and the migration endpoint's `key` check) and one static `ADMIN_PASS`. Redaction protects
the repo, not the internet — rotate these first:

1. Cloudflare → My Profile → API Tokens: roll the token (`cf…`), then create a minimal-scope token
   for CI (Zone/Workers Scripts Edit + Account Read) and put it in GitHub Secrets as
   `CLOUDFLARE_API_TOKEN`.
2. AI provider: issue a new key, scoped to the models the app uses, with a hard spend cap.
3. Firebase: replace the service account used for FCM (new key, no other roles).
4. Payment gateway: new webhook secret.

## C · Supabase project

```bash
supabase projects create robahplus --template empty          # region: EU (Frankfurt)
supabase link --project-ref <PROJECT_REF>
supabase db push                                             # applies supabase/migrations/0001…0013
supabase secrets set SUPABASE_URL=… SUPABASE_ANON_KEY=… SUPABASE_SERVICE_ROLE_KEY=… \
  FOX_ADMIN_CODE=… FOX_WALLET_ADMIN_CODE=… AI_GATEWAY_URL=… AI_GATEWAY_KEY=… \
  FCM_SERVICE_ACCOUNT_JSON=… PAYMENT_GATEWAY_WEBHOOK_SECRET=…
supabase functions deploy
```

Dashboard side (5 minutes, no code): Authentication → Providers → **Phone** on, Email off; add the
Twilio Verify credentials when you have them; for each operator account set
`app_metadata = {"role":"admin"}` (that claim — not any client field — is what unlocks admin paths).
Full list with reasons: [docs/SUPABASE.md](docs/SUPABASE.md).

## D · GitHub Secrets that make the deploy workflows live

| secret | used by | without it |
| --- | --- | --- |
| `SUPABASE_PROJECT_REF` | `deploy-supabase.yml` | workflow refuses and deploys nothing (by design) |
| `SUPABASE_MANAGEMENT_TOKEN` | `deploy-supabase.yml` | idem |
| `SUPABASE_ANON_KEY` | (web build, if you build in CI) | preview builds can't reach the API |
| `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` | `deploy-web.yml` (manual only) | the manual publish step refuses |

`ci.yml` needs **no** secrets, so every push and PR is already validated.

## E · Data import + client flip

Order of operations, rollback matrix and the exact one-line client changes:
[docs/CUTOVER.md](docs/CUTOVER.md) (steps 0–7). Short version: import KV → Postgres behind the
existing API, shadow-read for a week, then enable `apps/web/overrides.json`, rebuild and publish the
Worker. The APK needs no rebuild to start.

## F · Re-running the verification yourself

```bash
npm test                          # split views + 84 security assertions on Postgres + secret scan
deno task verify                  # 9 edge functions: type-check, lint, format
npm run build && npm run check:client
# → ✓ split views match apps/web/golden/index.html (45 blocks, 1.62 MiB)
# → TESTS PASSED   ·   tables 32 · policies 48 · security-definer fns 30 · rls-enforced 31
# → ✓ secret scan clean (106 file(s), 12 rule groups)
# → ✓ client check passed
```

`tools/test-db.sh` will install a Postgres server package automatically if the machine has none
(`FOX_PG_AUTOINSTALL=0` disables that), or use `DATABASE_URL=…` against any scratch database.

## G · Known open items (deliberate, not accidental)

* `docs/AUDIT.md` §2.1 — a real, pre-existing client defect (`apps/web/app/j25.js` has two regex
  literals missing backslashes, so its whole 15-line block never runs). One-character fix; scheduled
  after the cutover so the diff stays attributable. CI pins the baseline at exactly one unparsable
  block, so a *new* one fails the build.
* `apps/mobile/` is a placeholder: the shipped APK is a WebView shell whose integration points are
  documented in `docs/APK.md`. Drop the real project in when you rebuild.
* Payments: `functions/wallet {action:confirm-payment}` exists and is tested (pending → completed,
  replay-safe), but it has no live gateway wiring — point your gateway's callback at it and set
  `PAYMENT_GATEWAY_WEBHOOK_SECRET`.
* SMS: `functions/auth {action:send-code}` stores hashed codes and (by design) never returns one.
  Delivery is GoTrue/Twilio, configured in step C.
