/**
 * 02 · extract-web — derive browsable apps/web/styles/*.css + apps/web/app/*.js from the
 * golden single-file app, and verify the extraction is lossless.
 *
 *   node tools/02-extract-web.mjs
 *
 * Golden file:  apps/web/golden/index.html  (byte-for-byte what the legacy worker returns)
 * The inline blocks are extracted in document order so both the CSS cascade and the
 * script execution order can be reconstructed and diffed against the golden file.
 */
import { readFile, writeFile, mkdir, rm, readdir } from 'node:fs/promises';
import { join } from 'node:path';

const WEB = join(process.cwd(), 'apps', 'web');
const GOLDEN = join(WEB, 'golden', 'index.html');

const html = await readFile(GOLDEN, 'utf8');

const blocks = [];
for (const m of html.matchAll(/<style([ \t][^>]*)?>([\s\S]*?)<\/style>/g)) {
  blocks.push({ kind: 'style', at: m.index, attrs: m[1] || '', body: m[2] });
}
for (const m of html.matchAll(/<script([ \t][^>]*)?>([\s\S]*?)<\/script>/g)) {
  blocks.push({ kind: 'script', at: m.index, attrs: m[1] || '', body: m[2] });
}
blocks.sort((a, b) => a.at - b.at);

/* ── --check mode: CI uses this to prove the derived views still match the golden file, so a
   hand-edit of apps/web/app/*.js can never silently diverge from what the web client actually
   runs.  Nothing is written. ── */
if (process.argv.includes('--check')) {
  const fail = (why) => {
    console.error(`✗ split view out of date — ${why}`);
    process.exit(1);
  };
  const bodies = new Map();
  for (const dir of ['styles', 'app']) {
    const files = await readdir(join(WEB, dir)).catch(() => []);
    if (!files.length) fail(`apps/web/${dir} is empty — run \`node tools/02-extract-web.mjs\``);
    for (const f of files.sort()) {
      bodies.set(`${dir}/${f}`, await readFile(join(WEB, dir, f), 'utf8'));
    }
  }
  let ns = 0, nj = 0, payload = 0;
  for (const b of blocks) {
    if (!b.body.trim()) continue;
    const isStyle = b.kind === 'style';
    const id = isStyle ? `s${String(++ns).padStart(2, '0')}` : `j${String(++nj).padStart(2, '0')}`;
    const rel = `${isStyle ? 'styles' : 'app'}/${id}.${isStyle ? 'css' : 'js'}`;
    if (!bodies.has(rel)) fail(`${rel} does not exist`);
    else if (bodies.get(rel) !== b.body) fail(`${rel} differs from the golden file`);
    payload += b.body.length;
  }
  if (bodies.size !== ns + nj) fail(`${bodies.size} files exist but the golden file has ${ns + nj} blocks`);
  const man = JSON.parse(await readFile(join(WEB, 'split-manifest.json'), 'utf8'));
  if (man.styles.length + man.scripts.length !== ns + nj) {
    fail(`split-manifest.json lists ${man.styles.length + man.scripts.length} blocks, the golden file has ${ns + nj}`);
  }
  if (man.goldenBytes !== html.length) fail(`split-manifest.json was generated from a different golden file (${man.goldenBytes} vs ${html.length} chars)`);
  console.log(`✓ split views match apps/web/golden/index.html (${ns + nj} blocks, ${(payload / 1048576).toFixed(2)} MiB)`);
  process.exit(0);
}

await rm(join(WEB, 'styles'), { recursive: true, force: true });
await rm(join(WEB, 'app'), { recursive: true, force: true });
await mkdir(join(WEB, 'styles'), { recursive: true });
await mkdir(join(WEB, 'app'), { recursive: true });

const manifest = { styles: [], scripts: [] };
let ns = 0;
let nj = 0;
for (const b of blocks) {
  if (!b.body.trim()) continue;
  const isStyle = b.kind === 'style';
  const id = isStyle ? `s${String(++ns).padStart(2, '0')}` : `j${String(++nj).padStart(2, '0')}`;
  const rel = join(isStyle ? 'styles' : 'app', `${id}.${isStyle ? 'css' : 'js'}`);
  await writeFile(join(WEB, rel), b.body, 'utf8');
  const rec = { id, file: rel, at: b.at, line: html.slice(0, b.at).split('\n').length, bytes: b.body.length, attrs: b.attrs.trim() };
  (isStyle ? manifest.styles : manifest.scripts).push(rec);
}

const payload = manifest.styles.concat(manifest.scripts).reduce((n, x) => n + x.bytes, 0);
// lossless check: removing the inline blocks from the golden file must leave only the tags
const stripped = blocks.reduceRight((acc, b) => acc.slice(0, b.at) + acc.slice(b.at + b.body.length), html);
const expected = blocks.reduce((n, b) => n + b.body.length, 0);
const removed = html.length - stripped.length;
if (removed !== expected) {
  console.error(`✗ extraction is lossy: removed ${removed} B but blocks total ${expected} B`);
  process.exit(1);
}

await writeFile(
  join(WEB, 'split-manifest.json'),
  JSON.stringify(
    {
      golden: 'apps/web/golden/index.html',
      generatedBy: 'tools/02-extract-web.mjs',
      goldenBytes: html.length,
      extractedBytes: payload,
      note:
        'Derived views for reading, diffing and linting. The golden file stays authoritative until the Supabase cutover; ' +
        'edit apps/web/golden/index.html (or the legacy patch_*.py pipeline) and re-run this tool.',
      ...manifest,
    },
    null,
    1
  ) + '\n',
  'utf8'
);

console.log(`✓ ${manifest.styles.length} style block(s), ${manifest.scripts.length} script block(s), ${(payload / 1048576).toFixed(2)} MiB extracted, lossless verified`);
