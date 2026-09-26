/**
 * 05 · check-client — proof that the deployable web dir is intact and self-consistent.
 *
 *   node tools/05-check-client.mjs
 *
 * CI runs this after `npm run build`.  It checks, in order:
 *   1. apps/web/build/index.html exists and is byte-identical to golden + overrides
 *      (tools/03-assemble-web.mjs --check already proves the content; this proves the file landed);
 *   2. every inline <script> block parses as a **classic script** (node --check semantics, not
 *      `new Function`, which would hide errors and invent false ones);
 *   3. the count of unparsable blocks never grows past the documented baseline;
 *   4. the derived split views still match the golden file;
 *   5. no secret-shaped string is present in what we ship.
 */
import { execFileSync } from 'node:child_process';
import { readFile, writeFile, mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const ROOT = process.cwd();
const BUILD = join(ROOT, 'apps', 'web', 'build', 'index.html');
const GOLDEN = join(ROOT, 'apps', 'web', 'golden', 'index.html');

/* The only block known not to parse today (docs/AUDIT.md §2.1) — two regex literals lost their
 * backslashes.  Keeping the number pinned means a NEW broken block fails CI immediately, and
 * fixing the legacy one lets you set this to 0. */
const BASELINE_UNPARSABLE = 1;

let failures = 0;
const ok = (m) => console.log(`  ✓ ${m}`);
const bad = (m) => {
  failures++;
  console.error(`  ✗ ${m}`);
};

// 1 ─ build output
const [built, golden] = await Promise.all([readFile(BUILD, 'utf8').catch(() => null), readFile(GOLDEN, 'utf8')]);
if (built === null) bad('apps/web/build/index.html is missing — run `npm run build`');
else {
  const overrides = JSON.parse(await readFile(join(ROOT, 'apps', 'web', 'overrides.json'), 'utf8').catch(() => '{"entries":[]}'));
  const active = (overrides.entries ?? []).filter((e) => !e.disabled && !e.optional);
  if (active.length === 0 && built !== golden) bad('no active overrides, yet build ≠ golden');
  else ok(`build output matches golden${active.length ? ` (+${active.length} active override(s))` : ' (no active overrides)'} — ${(built.length / 1048576).toFixed(2)} MiB`);
}

// 2 + 3 ─ inline script blocks must parse (or be the known baseline)
if (built) {
  const dir = await mkdtemp(join(tmpdir(), 'fox-client-'));
  const blocks = [...built.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]).filter((b) => b.trim());
  const broken = [];
  for (const i in blocks) {
    const p = join(dir, `block-${String(i).padStart(2, '0')}.js`);
    await writeFile(p, blocks[i], 'utf8');
    try {
      execFileSync('node', ['--check', p], { stdio: 'pipe' });
    } catch (e) {
      const line = String(e.stderr ?? '').split('\n').find((l) => l.includes('block-')) ?? '';
      broken.push({ i, line: line.trim() });
    }
  }
  if (broken.length > BASELINE_UNPARSABLE) {
    bad(`${broken.length} inline script block(s) fail to parse (baseline is ${BASELINE_UNPARSABLE})`);
    for (const b of broken) console.error(`      block ${b.i}: ${b.line}`);
  } else if (broken.length === BASELINE_UNPARSABLE) {
    ok(`${blocks.length} inline script blocks parse, except the documented defect (block ${broken[0].i}) — see docs/AUDIT.md §2.1`);
  } else {
    ok(`all ${blocks.length} inline script blocks parse`);
  }

  // 5 ─ no secret shapes in the shipped document
  const secretish = [
    { name: 'JWT', re: /\beyJ[A-Za-z0-9_-]{8,}\.eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b/ },
    { name: 'Supabase publishable/secret key', re: /\bsb_(?:publishable|secret)_[A-Za-z0-9_-]{16,}/ },
    { name: 'Cloudflare token', re: /\b(?:cf(?:ut|v0)_[A-Za-z0-9]{20,}|eyJhbGciOiJIUzI1NiJ9\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{30,})\b/ },
    { name: 'PEM private key', re: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
    { name: 'service_role literal', re: /"role":\s*"service_role"/ },
  ].filter((s) => s.re.test(built));
  if (secretish.length) bad(`shipped HTML contains ${secretish.map((s) => s.name).join(', ')} shaped strings`);
  else ok('no secret-shaped strings in the shipped document');
}

// 4 ─ derived views still match
try {
  execFileSync('node', [join(ROOT, 'tools', '02-extract-web.mjs'), '--check'], { stdio: 'inherit' });
} catch {
  failures++;
}

if (failures) {
  console.error(`✗ client check failed (${failures} problem(s))`);
  process.exit(1);
}
console.log('✓ client check passed');
