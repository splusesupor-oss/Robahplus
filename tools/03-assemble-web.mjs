/**
 * 03 · assemble-web — build a deployable single-file app from apps/web/golden/index.html
 * plus (optional, reviewed) cutover overrides, into apps/web/build/index.html.
 *
 *   node tools/03-assemble-web.mjs            # write apps/web/build/index.html
 *   node tools/03-assemble-web.mjs --check    # verify it is byte-identical to what we ship
 *
 * Why this exists
 * ---------------
 * The legacy client is one HTML document with inline <style>/<script> blocks, served today by a
 * Cloudflare Worker.  Keeping that shape means the web host (Cloudflare) and the APK (WebView)
 * need zero changes at cutover, and the repo can diff the whole UI.  The ONLY edits applied here
 * are the ones listed in apps/web/overrides.json — each one is a literal string replacement with
 * a written justification, so nothing silently rewrites the app.
 *
 * apps/web/app|styles/*.js|css are derived views (see tools/02-extract-web.mjs).  Editing them
 * has no effect on the build; edit apps/web/golden/index.html or an override entry instead.
 */
import { readFile, writeFile, mkdir, cp, readdir } from 'node:fs/promises';
import { join } from 'node:path';

const ROOT = process.cwd();
const WEB = join(ROOT, 'apps', 'web');
const GOLDEN = join(WEB, 'golden', 'index.html');
const OVERRIDES = join(WEB, 'overrides.json');
const OUT_DIR = join(WEB, 'build');
const OUT = join(OUT_DIR, 'index.html');
const CHECK = process.argv.includes('--check');

const html = await readFile(GOLDEN, 'utf8');

let overrides = { entries: [] };
try {
  overrides = JSON.parse(await readFile(OVERRIDES, 'utf8'));
} catch (e) {
  if (e.code !== 'ENOENT') throw new Error(`apps/web/overrides.json is not valid JSON: ${e.message}`);
}

let out = html;
const report = [];
for (const o of overrides.entries ?? []) {
  if (o.disabled) {
    report.push({ id: o.id, status: 'disabled', reason: o.reason ?? '' });
    continue;
  }
  const count = out.split(o.search).length - 1;
  if (count === 0) {
    const why = `pattern not found: ${JSON.stringify(o.search.slice(0, 60))}`;
    if (o.optional) report.push({ id: o.id, status: 'skipped', reason: why });
    else throw new Error(`override "${o.id}" — ${why}\n  The golden file changed; re-check the cutover patch list instead of shipping a half-migrated client.`);
    continue;
  }
  out = out.split(o.search).join(o.replace);
  report.push({ id: o.id, status: `applied ×${count}`, reason: o.reason ?? '' });
}

if (CHECK) {
  const shipped = await readFile(OUT, 'utf8').catch(() => null);
  if (shipped === null) {
    console.error('✗ apps/web/build/index.html is missing — run `npm run build`');
    process.exit(1);
  }
  if (shipped !== out) {
    console.error('✗ apps/web/build/index.html does not match golden + overrides — run `npm run build`');
    process.exit(1);
  }
  console.log(`✓ apps/web/build/index.html is up to date (${report.length} override(s) reviewed)`);
  process.exit(0);
}

await mkdir(OUT_DIR, { recursive: true });
await writeFile(OUT, out, 'utf8');
// static assets (icons, fonts, images) are copied verbatim so the build dir is deployable alone
for (const f of await readdir(join(WEB, 'static')).catch(() => [])) {
  await cp(join(WEB, 'static', f), join(OUT_DIR, f));
}

const delta = out.length - html.length;
console.log(`✓ built apps/web/build/index.html (${(out.length / 1048576).toFixed(2)} MiB, ${delta >= 0 ? '+' : ''}${delta} chars vs golden)`);
for (const r of report) console.log(`  · ${r.id.padEnd(26)} ${r.status}${r.reason ? ` — ${r.reason}` : ''}`);
