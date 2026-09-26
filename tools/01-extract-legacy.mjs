/**
 * 01 · extract-legacy — copy the production Cloudflare Worker snapshot into `legacy/`
 * with every credential replaced by a placeholder, so the repo can carry the real
 * current-behaviour reference without ever leaking a secret.
 *
 *   node tools/01-extract-legacy.mjs <path-to-raw-worker.js>
 *
 * Output:
 *   legacy/worker.raw.js        ← redacted copy (this is what gets committed)
 *   legacy/BUNDLE-NOTES.md      ← provenance + how to rehydrate the placeholders
 *   tools/.secret-findings.json ← what was found (names/counts only, never values)
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const [, , SRC] = process.argv;
if (!SRC) {
  console.error('usage: node tools/01-extract-legacy.mjs <path-to-raw-worker.js>');
  process.exit(2);
}

const fingerprint = (s) => {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
};

const src = await readFile(SRC, 'utf8');
const findings = [];
let out = src;

/** Replace every distinct literal captured by `re` with placeholder(value). Counts them. */
function redact(label, re, placeholder) {
  const values = new Map();
  out = out.replace(re, (match, g1) => {
    const value = g1 ?? match;
    if (!values.has(value)) {
      values.set(value, 0);
      findings.push({ label, value: null, fingerprint: fingerprint(value), placeholder: placeholder(value), count: 0 });
    }
    values.set(value, values.get(value) + 1);
    return match.split(value).join(placeholder(value));
  });
  for (const [value, count] of values) {
    const f = findings.find((x) => x.label === label && x.fingerprint === fingerprint(value));
    if (f) f.count = count;
  }
  return values.size;
}

// 1. Cloudflare API tokens used as the AI_TOKEN fallback and as the x-migration-key.
const nTokens = redact('cloudflare-api-token', /["'`](cf(?:ut|v0)_[A-Za-z0-9]{20,})["'`]/g, (v) => `<REDACTED_${v.slice(0, 4).toUpperCase()}_TOKEN>`);
// 2. Hardcoded admin password(s).
const nPass = redact('admin-password', /const ADMIN_PASS = "([^"]+)"/g, () => '<REDACTED_ADMIN_PASS>');
// 3. Private keys, in case a Firebase service account ever got inlined.
const nPem = redact('private-key', /["'`](-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]{0,4000}?-----END [A-Z ]*PRIVATE KEY-----)["'`]/g, () => '<REDACTED_PRIVATE_KEY>');
// 4. JWTs (Supabase anon/service keys are JWTs).
const nJwt = redact('jwt', /["'`](eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,})["'`]/g, () => '<REDACTED_JWT>');
// 5. Generic long bearer strings handed to fetch().
const nBearer = redact('bearer', /Bearer\s+([A-Za-z0-9._-]{40,})/g, () => 'Bearer <REDACTED_TOKEN>');

await mkdir(join(process.cwd(), 'legacy'), { recursive: true });
await writeFile(join(process.cwd(), 'legacy', 'worker.raw.js'), out, 'utf8');
await writeFile(
  join(process.cwd(), 'tools', '.secret-findings.json'),
  JSON.stringify({ generatedBy: 'tools/01-extract-legacy.mjs', source: SRC, findings }, null, 2) + '\n',
  'utf8'
);
await writeFile(
  join(process.cwd(), 'legacy', 'BUNDLE-NOTES.md'),
  `# legacy/ — current production bundle (redacted)

\`worker.raw.js\` is the Cloudflare Worker that today serves the Robah Plus web app
(11.1 MB, 49,467 lines, one ES module: server + inline HTML/CSS/JS, deployed straight
through the Cloudflare API by the local \`patch_vNNN_*.py\` scripts).

It is kept here as a **read-only reference of current behaviour** while the Supabase
backend is being cut over. Nothing in this repo is built from it.

## Credentials were stripped before committing

${findings.map((f) => `- \`${f.placeholder}\` ← ${f.label}, ${f.count} occurrence${f.count === 1 ? '' : 's'}, fingerprint \`${f.fingerprint}\``).join('\n') || '- none found'}

Placeholders are deliberately **not valid JavaScript**: the snapshot must not be runnable by
accident. To rehydrate it locally (git-ignored output), run \`node tools/03-rehydrate-legacy.mjs\`
with the real values exported in the environment.

## Rules

- never paste a real token back into anything tracked by git;
- \`legacy/\` is documentation of the past, \`supabase/\` + \`apps/\` are the future.
`,
  'utf8'
);

console.log(`✓ redacted: ${nTokens} api-token(s), ${nPass} admin password(s), ${nPem} private key(s), ${nJwt} jwt(s), ${nBearer} bearer(s)`);
console.log(`  → legacy/worker.raw.js (${(out.length / 1048576).toFixed(2)} MiB)`);
if (out.includes('cfut_') || out.includes('cfv0_')) {
  console.error('✗ a Cloudflare token survived redaction');
  process.exit(1);
}
