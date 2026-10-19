// Local preview that mirrors GitHub Pages: dist/ is served under BASE_PATH (default /khaji-pakhsh).
//   BASE_PATH=/khaji-pakhsh node build.mjs && node src/serve.mjs   → http://localhost:4417/khaji-pakhsh/
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { dirname, extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const BASE = (process.env.BASE_PATH ?? '/khaji-pakhsh').replace(/\/$/, '');
const PORT = Number(process.env.PORT || 4417);
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8' };

createServer(async (req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (BASE && !path.startsWith(BASE + '/') && path !== BASE) return send(res, 404, await readFile(join(DIST, '404.html')), '.html');
  let file = normalize(join(DIST, path.slice(BASE.length)));
  if (!file.startsWith(DIST)) return send(res, 403, 'forbidden', '.txt');
  try { if ((await stat(file)).isDirectory()) file = join(file, 'index.html'); } catch { /* fall through */ }
  try { send(res, 200, await readFile(file), extname(file)); }
  catch { send(res, 404, await readFile(join(DIST, '404.html')), '.html'); }
}).listen(PORT, () => console.log(`http://localhost:${PORT}${BASE}/`));

function send(res, code, body, ext) {
  res.writeHead(code, { 'content-type': TYPES[ext] || 'application/octet-stream', 'cache-control': 'no-store' });
  res.end(body);
}
