# Web hosting — Cloudflare stays, Supabase never hosts the site

## Why nothing moves today

The site is one 1.77 MiB HTML document (inline CSS/JS) plus 187 hashed assets, currently served by a
Cloudflare Worker with no assets binding (`has_assets: false` — it renders the document from code).
Supabase does not serve static sites: its edge layer is functions + PostgREST + Storage with bucket
paths, which cannot reproduce `GET /` → HTML, the mobile white-screen guard, the theme bootstrap or
the `/manifest.webmanifest` + service-worker cache the app already ships. So:

```
  Cloudflare (Workers today, Pages if you prefer)   →  the HTML/CSS/JS + static assets + service worker
  https://<ref>.supabase.co                          →  /functions/v1/*, /rest/v1/*, /realtime/v1/*, /storage/v1/*
```

Both web and APK use the same two origins — that is the only structural requirement of the brief.

## Deploying

```bash
# from this repo, into a scratch dir (nothing is uploaded by these commands):
npm run build            # apps/web/build/index.html + static/*
node tools/05-check-client.mjs
```

Two options, in the order of least risk:

1. **Keep the Worker** (recommended during the cutover). Publish `apps/web/build/index.html` as the
   Worker's response body — that is exactly what the current production code does, so the diff is
   "new HTML", not "new hosting". `.github/workflows/deploy-web.yml` wraps this and is
   manual-trigger only; its publish step is a deliberate `exit 1` placeholder until you replace it
   with your existing `patch_vNNN_*.py` / `wrangler deploy` command, so no workflow can write to the
   account behind your back.
2. **Move to Cloudflare Pages.** `wrangler pages deploy apps/web/build --project-name robahplus`, then
   add a `_headers` file with `Cache-Control: no-cache` for `index.html` (the hashed assets in
   `static/` are immutable and can stay at `max-age=31536000, immutable`). Do not delete the Worker
   until its `/api/*` routes are gone (docs/CUTOVER.md step 6), because the shipped client still calls
   them.

Either way the *service worker* needs the same care it has always needed: bump its cache name when you
ship HTML, or the old shell sticks on Android.

## Optional: one domain for app + API

If you would rather the browser/APK only ever see `robah.app`:

```
robah.app            → Cloudflare Pages/Worker  (static + the white-screen guard, unchanged)
api.robah.app        → Cloudflare → https://<ref>.supabase.co   (proxy, no rewrites, keep the path)
```

`api.robah.app` must forward `apikey` and `Authorization` untouched and pass Realtime's websocket
upgrade (`/realtime/v1/websocket`) — with Workers that is a ~30-line passthrough handler; then set
`FOX_PROJECT_URL=https://api.robah.app` in the web/APK build env. Nothing else changes: the edge
functions and RLS do not care which hostname carried the request.

## What must not be added to the web host

* no service-role key in `_headers`, env, or the bundle (CI asserts this: `npm run check:client`);
* no KV/DO writes for balances — the ledger is Postgres-only now;
* no HTML rewrite at the edge: the client is built from `apps/web/golden/index.html` + reviewed
  `apps/web/overrides.json`, so every change to what users get is a commit in this repo.
