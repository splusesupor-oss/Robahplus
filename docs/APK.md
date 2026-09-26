# Android APK (روباه پلاس WebView shell)

## What the APK is today (verified in the shipped client)

The installed app is a WebView over the Worker URL, plus three native affordances:

| hook | evidence | meaning after cutover |
| --- | --- | --- |
| UA marker `RobahPush/1` (also `RobahNativeVoice/1`) | `navigator.userAgent` check in the client bundle | keep — this is how the backend distinguishes APK traffic and how `x-client-build` is set |
| JS bridges `window.RobahPush`, `window.RobahNativeVoice`, `window.RobahNative`, `window.Android` | referenced by the prompt-guard block | unchanged; they only touch native push/voice, never Supabase |
| internal prompt tags `__fox_push_v1__`, `__fox_voice_v1__` | `window.prompt` payloads | **currently un-filtered in browsers** because the guard block has a syntax error (docs/AUDIT.md §2.1) |
| `/manifest.webmanifest` | referenced once from the HTML, three times from the Worker | PWA install path keeps working; the Worker/`build` dir must keep serving it |

## What must change (and when)

1. **Nothing, to start.** The WebView loads whatever the host serves, so the Supabase cutover is
   invisible to installed APKs (docs/CUTOVER.md step 4).
2. **For the next release**, the only code changes are configuration:
   * base URL → `EXPO_PUBLIC_SUPABASE_URL=https://<PROJECT_REF>.supabase.co` (or keep the Worker URL
     as a thin proxy during the transition — recommended, since it preserves the current cache/UA
     behaviour and lets you roll back by redeploying the Worker);
   * `EXPO_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_…` (publishable only);
   * FCM: keep registering the device token, but POST it to `functions/notifications
     {action:register, token, platform:'android'}` instead of the Worker's endpoint.
3. **Never** bake these into the APK: `SUPABASE_SERVICE_ROLE_KEY`, `FOX_ADMIN_CODE`,
   `FOX_WALLET_ADMIN_CODE`, `AI_GATEWAY_KEY`, `FCM_SERVICE_ACCOUNT_JSON`, any Cloudflare token. The
   APK cannot hold a secret safely (it is unpackable in seconds), so anything that must stay secret
   is a **Supabase Secret** read by an edge function instead — that is the whole reason `wallet`,
   `rewards`, `ai` and `notifications` exist.

## Verifying "no secret in the client" mechanically

```bash
# on the build machine, after assembling the web dir that the APK loads:
node tools/04-check-secrets.mjs                       # repo-side
# and on the artefact itself:
unzip -p app-release.apk assets/index.html | grep -Ec 'service_role|eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9|cfut_|-----BEGIN' && echo "FAIL: secret-shaped string in the bundle"
```

The `apps/web/build/index.html` we ship today prints `0` for that grep (no JWTs, no tokens — see
docs/AUDIT.md §3), and the same check runs in CI.

## Base URL proposal

Two acceptable shapes; both keep the APK ignorant of secrets:

```
# (a) through the existing Worker (recommended during migration)
https://ai-fox.aifox-bot.workers.dev        → Worker proxies /functions/v1/* to Supabase

# (b) direct, after the Worker's API is retired
https://<PROJECT_REF>.supabase.co/functions/v1/*
```

If you later want one domain for web + APK + API, put a custom domain in front of the Supabase
project (`api.robah.app` → `<PROJECT_REF>.supabase.co`, Cloudflare-proxied) and set
`SUPABASE_URL`/`FOX_PROJECT_URL` to it. Do **not** point that domain at the project's Postgres or
use it as a static host — Supabase's own hosting limits still apply, which is why the web stays on
Cloudflare.

## Push notifications

`functions/notifications` mints a Google OAuth token with Web Crypto (RS256 over
`FCM_SERVICE_ACCOUNT_JSON`) and calls FCM v1 directly — no npm dependencies, nothing extra to
install in the APK. It only sends to tokens owned by the acting user, and `{action:unregister}`
disables a token (the row is kept for the audit trail), so a logged-out device stops receiving.
