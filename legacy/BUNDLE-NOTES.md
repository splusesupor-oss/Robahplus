# legacy/ — current production bundle (redacted)

`worker.raw.js` is the Cloudflare Worker that today serves the Robah Plus web app
(11,051,861 chars, 49,468 lines, one ES module: server + inline HTML/CSS/JS, deployed
straight through the Cloudflare API by the local `patch_vNNN_*.py` scripts — see
[`CODEMAP.md`](CODEMAP.md) for the route inventory and the verified implementation details).

It is kept here as a **read-only reference of current behaviour** while the Supabase
backend is being cut over. Nothing in this repo is built from it.

## Credentials were stripped before committing

- `<REDACTED_CFUT_TOKEN>` ← cloudflare-api-token, 3 occurrences, fingerprint `b2d2a811`
- `<REDACTED_ADMIN_PASS>` ← admin-password, 1 occurrence, fingerprint `bf1ebcce`

Placeholders are deliberately **not valid JavaScript**: the snapshot must not be runnable by
accident, and no tool in this repo rewrites it back. The un-redacted original is *not* in this repo: it stays at
`/home/user/cf/ai-fox.worker.js` (or wherever the operator keeps it) on the machine that produced
this migration; re-run
`node tools/01-extract-legacy.mjs <that path>` to regenerate this file and the findings list.

## Rules

- never paste a real token back into anything tracked by git;
- `legacy/` is documentation of the past, `supabase/` + `apps/` are the future.
