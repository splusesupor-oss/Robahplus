# Docs

| file | read it when |
| --- | --- |
| [AUDIT.md](AUDIT.md) | you want to know what the project actually contained, what each subsystem became, and the two real defects found in the shipped client |
| [RLS-MODEL.md](RLS-MODEL.md) | you are reviewing security: all 48 policies, the anti-escalation pattern, and how the 84 assertions prove it |
| [EDGE-FUNCTIONS.md](EDGE-FUNCTIONS.md) | you are coding against the backend: every action, request/response shape, guard and idempotency rule |
| [SUPABASE.md](SUPABASE.md) | you are provisioning the project: link, migrate, auth config, secrets, functions, Realtime/Storage, CI/CD — and the one step only you can do |
| [CUTOVER.md](CUTOVER.md) | you are switching traffic: 7 reversible steps, data import order, rollback matrix |
| [WEB-HOSTING.md](WEB-HOSTING.md) | you are deploying the site: Cloudflare stays, Supabase never hosts static, one-domain option |
| [APK.md](APK.md) | you are rebuilding the Android shell: what changes, what must never be baked in, how to verify |

Outside this folder, two more documents carry the same weight:

* [`../apps/web/supabase/README.md`](../apps/web/supabase/README.md) — the 171-route → edge-function
  migration map, i.e. "what does each old `/api/...` call become".
* [`../legacy/CODEMAP.md`](../legacy/CODEMAP.md) + [`../legacy/BUNDLE-NOTES.md`](../legacy/BUNDLE-NOTES.md)
  — the reference bundle: route families with line numbers, and how its credentials were stripped.

## Conventions this repo follows

1. **Migrations are append-only and numbered by hand** (`20260925_00NN_topic.sql`) so review order and
   apply order are the same thing. Never edit an applied migration — add the next number.
2. **A change to the data model lands in three places at once**: the migration, the edge function that
   exposes it, and an assertion in `supabase/tests/rls_and_wallet.sql`. A security feature without a
   test is not finished here.
3. **Guard triggers return `NEW`/`OLD`, never `NULL`** (a `BEFORE` trigger returning `NULL` silently
   drops the row — the nastiest false-pass this schema could have).
4. **Money and rewards have no client write path.** If a value could be typed by a user, it is not
   trusted: prices, reward amounts, ranking prizes and AI billing all come from tables.
5. **Secrets are names in `.env.example`, values in GitHub/Supabase Secrets.** `npm run check:secrets`
   and gitleaks both run in CI.
6. **`apps/web/golden/index.html` is authoritative.** The split views under `app/` and `styles/` are
   generated; CI asserts they still match, so nobody can hand-edit a "copy" of the app.

## Local loop

```bash
npm run test:db          # migrations + 84 security assertions on a throwaway Postgres
npm test                 # + split-view check + secret scan
deno task verify         # edge functions: type-check, lint, format
npm run build && npm run check:client   # the deployable web dir, verified
supabase start && supabase db reset     # full local stack (needs Docker)
```
