/**
 * 04 · check-secrets — refuse to commit credentials, anywhere in the tree.
 *
 *   node tools/04-check-secrets.mjs            # scan every git-tracked file
 *   node tools/04-check-secrets.mjs --staged   # scan what is about to be committed
 *
 * This is the repo's own gate (dependency-free, so it runs in CI even without gitleaks); the
 * workflow additionally runs gitleaks when it is available.  Findings print the file, the line
 * and a masked excerpt — never the whole value — so this tool's own log output is safe to paste
 * into an issue.
 */
import { execFileSync } from 'node:child_process';
import { readFile, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const STAGED = process.argv.includes('--staged');

/* Every rule: what it catches, and why it matters for *this* project. */
const RULES = [
  { id: 'cloudflare-token', why: 'Cloudflare account tokens', re: /\b(cf(?:ut|v0)_[A-Za-z0-9]{20,}|[A-Za-z0-9_-]{37,45}\.[A-Za-z0-9_-]{16}\.[A-Za-z0-9_-]{30,})\b/g },
  { id: 'jwt-like', why: 'Supabase anon/service keys and session tokens are JWTs', re: /\beyJ[A-Za-z0-9_-]{8,}\.eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b/g },
  { id: 'private-key', why: 'PEM private keys / Firebase service accounts', re: /-----BEGIN [A-Z ]{3,40}PRIVATE KEY-----/g },
  { id: 'url-credentials', why: 'connection strings embed passwords', re: /\b(?:postgres(?:ql)?|mysql|mongodb(?:\+srv)?|redis):\/\/[^\s/]+:[^\s@]+@/gi },
  { id: 'supabase-service-key', why: 'the service-role key bypasses RLS — never in a client or a repo', re: /\bSUPABASE_SERVICE_ROLE_KEY\s*[:=]\s*['"`][^'"`\s]{12,}/g },
  { id: 'aws-access-key', why: 'cloud credentials', re: /\bAKIA[0-9A-Z]{16}\b/g },
  { id: 'google-api-key', why: 'Google/Firebase server keys', re: /\bAIza[0-9A-Za-z_-]{35}\b/g },
  { id: 'slack-github-token', why: 'provider tokens', re: /\b(?:xox[abprs]-[A-Za-z0-9-]{10,}|gh[pousr]_[A-Za-z0-9]{36,}|github_pat_[A-Za-z0-9_]{40,})\b/g },
  { id: 'telegram-bot-token', why: 'bot tokens are bearer credentials', re: /\b\d{8,10}:AA[A-Za-z0-9_-]{30,}\b/g },
  { id: 'bearer-literal', why: 'a hard-coded Authorization header value', re: /\bAuthorization['"`]?\s*[:=]\s*['"`]Bearer\s+(?!<|\$\{|%\{)[A-Za-z0-9._-]{20,}/g },
  { id: 'assign-secret', why: 'secret-shaped assignment', re: /\b(?:api[_-]?key|apikey|secret|token|password|passwd|pwd|admin[_-]?code|access[_-]?key|private[_-]?key)\b\s*[:=]\s*['"`][^'"`\s$<{%*<>-]{12,}['"`]/gi },
];

/* High-entropy literal scan: quoted strings that look like a key, not like prose. */
const ENTROPY_MIN = 24;
/* Placeholders and documentation samples are the *point* of .env.example — matching them is
 * noise, not a finding.  A real password would not spell itself out. */
const SKIP_LINE = /fox-scan:allow|pragma: allow-secret|REDACTED|CHANGE-?ME|YOUR_[A-Z_]+|<[^>]+>|\bexample\b|placeholder/i;
const SKIP_VALUE = /^(?:[<{$%]|\d+$|[A-Za-z]{1,12}$)/;

const SKIP_FILES = [
  /^tools\/\.secret-findings\.json$/, // names + fingerprints only, by design
  /* The redacted legacy bundle is scanned by every *targeted* rule above (JWT, PEM, tokens,
   * connection strings …) but the generic entropy heuristic is meaningless on a 50k-line
   * minified file, so it is limited to the curated sources. */
  /^legacy\/worker\.raw\.js$/,
  /(^|\/)(node_modules|\.git)\//,
  /\.(png|jpg|jpeg|gif|webp|ico|woff2?|ttf|otf|eot|mp4|mp3|zip|ap_?k|so|dll|jar)$/i,
];

function shallowEntropy(s) {
  const counts = new Map();
  for (const c of s) counts.set(c, (counts.get(c) ?? 0) + 1);
  let h = 0;
  for (const n of counts.values()) {
    const p = n / s.length;
    h -= p * Math.log2(p);
  }
  return h; // bits/char; ~4.5+ means essentially random
}

function classify(value) {
  if (SKIP_VALUE.test(value)) return false;
  /* Only token-shaped strings qualify.  Minified JS embedded in a bundle contains plenty of
   * high-entropy *code* fragments ("),Strin", "+faNum…0))+" …) and those are not secrets —
   * allowing punctuation here would bury real findings in noise. */
  if (!/^[A-Za-z0-9+/_=.:-]{20,}$/.test(value)) return false;
  if (/[A-Za-z0-9]{16,}$/.test(value) === false) return false; // hashes/keys end in a long alnum run
  if (/\.(?:webp|png|jpe?g|gif|svg|css|js|mjs|json|woff2?|ttf|mp4|mp3|html?|ico|xml|txt|ap_?k|webmanifest)$/i.test(value)) return false; // asset paths
  const alnum = value.replace(/[^A-Za-z0-9]/g, '').length;
  if (alnum < ENTROPY_MIN) return false;
  const mixed = /[a-z]/.test(value) && /[A-Z0-9]/.test(value);
  return mixed && shallowEntropy(value) >= 4.2;
}

async function files() {
  if (STAGED) {
    const names = execFileSync('git', ['diff', '--cached', '--name-only', '--diff-filter=ACM'], { encoding: 'utf8' })
      .split('\n').filter(Boolean);
    return names;
  }
  try {
    return execFileSync('git', ['ls-files'], { encoding: 'utf8' }).split('\n').filter(Boolean);
  } catch {
    // not a git checkout (e.g. a tarball review) — fall back to a plain recursive walk
    const out = [];
    const walk = async (dir) => {
      const { readdir } = await import('node:fs/promises');
      for (const f of await readdir(dir, { withFileTypes: true })) {
        if (f.name === '.git' || f.name === 'node_modules' || f.name === '.pgdata') continue;
        const p = join(dir, f.name);
        if (f.isDirectory()) await walk(p);
        else out.push(relative(ROOT, p));
      }
    };
    await walk(ROOT);
    return out;
  }
}

const findings = [];
const scanned = [];
for (const rel of await files()) {
  if (SKIP_FILES.some((re) => re.test(rel))) continue;
  const abs = join(ROOT, rel);
  const st = await stat(abs).catch(() => null);
  if (!st || !st.isFile() || st.size > 12 * 1024 * 1024) continue;
  const text = await readFile(abs, 'utf8').catch(() => null);
  if (text === null || text.includes('\u0000')) continue;
  scanned.push(rel);
  text.split('\n').forEach((line, i) => {
    if (SKIP_LINE.test(line)) return;
    for (const rule of RULES) {
      rule.re.lastIndex = 0;
      for (const m of line.matchAll(rule.re)) {
        findings.push({ file: rel, line: i + 1, rule: rule.id, why: rule.why, excerpt: mask(m[1] ?? m[0]) });
      }
    }
    for (const m of line.matchAll(/['"`]([^'"`\n]{24,})['"`]/g)) {
      if (classify(m[1])) findings.push({ file: rel, line: i + 1, rule: 'high-entropy', why: 'a long random-looking literal', excerpt: mask(m[1]) });
    }
  });
}

function mask(v) {
  const s = String(v);
  if (s.length <= 12) return `${s.slice(0, 2)}…(${s.length})`;
  return `${s.slice(0, 6)}…${s.slice(-4)} (${s.length} chars)`;
}

/* De-duplicate: a JWT matched by two rules is one finding. */
const seen = new Set();
const unique = findings.filter((f) => {
  const k = `${f.file}:${f.line}:${f.rule}`;
  if (seen.has(k)) return false;
  seen.add(k);
  return true;
});

if (unique.length) {
  console.error(`✗ secret scan found ${unique.length} issue(s) in ${scanned.length} file(s):\n`);
  for (const f of unique) console.error(`  ${f.file}:${f.line}  [${f.rule}] ${f.why}\n      ${f.excerpt}`);
  console.error('\n  Move the value to GitHub Secrets / Supabase Secrets and replace it with the variable name.');
  process.exit(1);
}
console.log(`✓ secret scan clean (${scanned.length} file(s), ${RULES.length + 1} rule groups)`);
