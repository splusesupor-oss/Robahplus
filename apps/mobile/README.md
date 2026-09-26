# apps/mobile — Android shell (روباه پلاس)

This directory is a **placeholder for the APK project**; the shipped app today is a WebView shell
whose observable behaviour lives in the web bundle, so there is nothing here to rebuild yet.

Read [`docs/APK.md`](../../docs/APK.md) first: it lists the four verified integration points (UA marker
`RobahPush/1`, the `window.RobahPush` / `RobahNativeVoice` / `RobahNative` / `window.Android` bridges,
the `__fox_push_v1__` / `__fox_voice_v1__` prompt tags, `/manifest.webmanifest`) and states what must
change — which, for the Supabase cutover, is nothing.

When the real project is dropped in, it must satisfy these checks (CI enforces the first two):

| rule | how it is checked |
| --- | --- |
| the APK bundle carries no service-role key, no admin code, no AI/Firebase credential | `npm run check:secrets` on the repo + the `grep -Ec` recipe in docs/APK.md on the built artefact |
| the base URL is `EXPO_PUBLIC_SUPABASE_URL` (or the Worker façade), never hard-coded per build | review the diff; `apps/web/overrides.json` is the only place URLs get injected into the client |
| `FOX_SERVER_WALLET` stays true and balances come from `foxWallet.get()` | `apps/web/supabase/wallet.js` is shared by both shells |
| push registration goes to `functions/notifications` | the old Worker endpoint is removed at cutover step 6 |

Expected layout when it lands (kept out of git until then — see the ignores in the root
`.gitignore`):

```
apps/mobile/
  android/            # Gradle shell: WebView + RobahPush bridge + FCM
  app.json / package.json
  fastlane/
```
