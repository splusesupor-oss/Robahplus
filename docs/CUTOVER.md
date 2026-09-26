# Cutover plan — switch the existing app to Supabase without a big-bang rewrite

The whole point of keeping `apps/web/golden/index.html` untouched is that this can be done in
seven small, individually reversible steps. Nothing here deploys to Cloudflare; the Worker stays
the web host and (during the transition) the API façade.

## Step 0 — baseline (already done in this repo)

`npm run build` produces `apps/web/build/` (the golden document + `static/`), byte-identical to what
is live. Deploy that to a **preview** Worker/Custom domain and confirm the site behaves exactly as
production. `cmp apps/web/build/index.html apps/web/golden/index.html` must pass — it is the
reproducibility proof, and CI checks it.

## Step 1 — provision + verify the backend

```bash
supabase db push && npm run test:db         # schema + 84 security assertions
supabase functions deploy                   # nine functions
supabase secrets set …                      # docs/SUPABASE.md §4
```

Smoke-test the three paths that must never break: `auth {send-code,verify}`, `wallet {read}`,
`group {create}` (it charges 399 diamonds and refunds on failure).

## Step 2 — shadow reads from the Worker

Keep the Worker's own routes, but make each read *also* call the matching edge function and log a
mismatch (never fail the request). This is where KV↔Postgres divergence shows up while the old
system is still authoritative.

## Step 3 — migrate the data

Run the Worker's KV dumps into `app.*` with the service-role key, in this order (parents before
children, wallet last so the ledger is complete):

1. `identity:*`, `user:<phone>` → `app.identity`, `auth.users` (import with `phone_confirmed_at`),
   `app.profile`, `app.wallet`
2. balances → **one `app.wallet_transaction` per historical delta you still have**, then reconcile
   `app.wallet` against the sum; where a legacy record is ambiguous, insert a `profile_bonus`
   adjustment row so the ledger always explains the balance
3. `group:*` → `app.group`, `group_member`, `group_message` (keep the original timestamps)
4. `dm:*`, `block:*`, `contact:*` → the DM tables and `app.block/app.contact`
5. `game:*`, `records:*`, `prog:*` → `app.game_session` + grants (as already-claimed, so nobody can
   re-claim a reward), `app.ranking_entry`
6. `report:*`, `restriction:*` → `app.report`, `app.user_restriction`
7. avatars: reassemble the `profile:avatar:<i>` chunks and upload one object per file to Storage,
   then set `app.profile.avatar_path`

## Step 4 — flip the client (one commit, one line each)

Add the two adapter files ahead of the existing inline scripts, then re-point the API base:

```html
<script>window.__FOX_ENV__ = { FOX_PROJECT_URL: 'https://<ref>.supabase.co', FOX_ANON_KEY: 'sb_publishable_…' };</script>
<script src="/supabase/config.js"></script>
<script src="/supabase/wallet.js"></script>
```

and enable the reviewed overrides in `apps/web/overrides.json` (exact strings from the golden file),
whose only job is:

* `api()` → `foxFunction('…')` per the map in `apps/web/supabase/README.md`;
* every `JSON.parse(localStorage.getItem('fox_user'))` balance read → `foxWallet.get()`
  (the cached value is marked `stale` until the server answers, so the UI dims rather than
  mis-reports);
* the WebSocket tank/presence code → `foxRealtime('group:<id>', handler)`.

Rollback = one `git revert` of the build + redeploy of the previous Worker version; the old KV path
is still intact until step 6.

## Step 5 — move writes, keep reads dual for a week

Writes go to Supabase first (they are the ones that need the ledger and RLS); KV writes become
best-effort mirrors so a rollback to step 4 loses nothing.

## Step 6 — retire the Worker's API

Delete the route handlers, keep the Worker as a static host (or move `apps/web/build/` to Cloudflare
Pages, which needs no code at all — see `docs/WEB-HOSTING.md`). Rotate every credential that ever
lived in the bundle: the Cloudflare API token (it doubled as the AI key and as the migration
endpoint's `key`), `ADMIN_PASS`, and the Firebase service account.

## Step 7 — fix the two known defects

Apply the `j25.js` regex fix (docs/AUDIT.md §2.1) and drop `localStorage.fox_user` as a balance
source entirely. Both are one-line changes; do them after the cutover so the diff stays attributable.

## Rollback matrix

| if this breaks | do this |
| --- | --- |
| an edge function | `supabase functions rollback` / redeploy the previous version — the Worker still has its own routes until step 6 |
| RLS too strict for a client flow | fix the policy in a new migration (never by relaxing the wallet/reward tables — they have no client write policy on purpose) |
| data mismatch after step 3 | KV is still authoritative until step 5; re-run the importer for the affected prefix |
| client shows wrong balances | disable the overrides, rebuild, redeploy — the old code path returns immediately |
| push notifications fail | tokens are per-device rows; the old FCM path still works until step 6 |

## APK changes needed (short version of docs/APK.md)

No new APK build is required to *start* the cutover: the WebView loads whatever the Worker serves, so
steps 0–5 are invisible to the installed app. The APK only needs a rebuild when you want (a) the
native prompt override fixed (step 7), or (b) direct `supabase.co` calls instead of the Worker
façade — which is also the moment to move the base URL into `EXPO_PUBLIC_SUPABASE_URL` and confirm
nothing in the bundle ships a service-role key.
