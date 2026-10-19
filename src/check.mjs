// Build gate: every internal href/src in dist/ must resolve to a file, every page needs
// one <h1>, a unique <title> and lang/dir, and nothing may point at Cloudflare's pages
// domain, which is blocked in Iran.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const BASE = (process.env.BASE_PATH || '').replace(/\/$/, '');
const BLOCKED = new RegExp(['pages', 'dev'].join('\\.'));
const walk = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));
const pages = walk(DIST).filter((f) => f.endsWith('.html'));
const errors = [];
const titles = new Map();

for (const f of pages) {
  const html = readFileSync(f, 'utf8');
  const rel = relative(DIST, f);
  const h1 = (html.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) errors.push(`${rel}: ${h1} <h1> elements`);
  if (!/<html lang="fa" dir="rtl">/.test(html)) errors.push(`${rel}: missing lang/dir`);
  if (BLOCKED.test(html)) errors.push(`${rel}: links to a domain blocked in Iran`);
  const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1];
  if (titles.has(title)) errors.push(`${rel}: duplicate title with ${titles.get(title)}`);
  titles.set(title, rel);
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  for (const [, attr] of html.matchAll(/\s(?:href|src)="([^"]+)"/g)) {
    if (/^(https?:|tel:|sms:|mailto:|data:)/.test(attr)) continue;
    if (attr.startsWith('#')) { if (attr.length > 1 && !ids.has(attr.slice(1))) errors.push(`${rel}: dangling anchor ${attr}`); continue; }
    if (!attr.startsWith(BASE + '/')) { errors.push(`${rel}: link outside base path: ${attr}`); continue; }
    const path = attr.slice(BASE.length).split(/[?#]/)[0];
    const target = join(DIST, path);
    const ok = path.endsWith('/') ? existsSync(join(target, 'index.html')) : existsSync(target);
    if (!ok) errors.push(`${rel}: broken link ${attr}`);
  }
}
if (errors.length) { console.error(errors.join('\n')); console.error(`\n${errors.length} problem(s)`); process.exit(1); }
console.log(`check passed: ${pages.length} pages, ${titles.size} unique titles, all internal links resolve`);
