// Renders tools/og.html → static/og.png and tools/icon.html → static/apple-touch-icon.png
// with the Playwright headless shell. Run only when the card design changes; the PNGs are committed.
import { execFileSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const pw = join(process.env.LOCALAPPDATA, 'ms-playwright');
const dir = readdirSync(pw).filter((d) => d.startsWith('chromium_headless_shell-')).sort().pop();
const exe = join(pw, dir, 'chrome-headless-shell-win64', 'chrome-headless-shell.exe');
for (const [src, out, size] of [['og.html', 'og.png', '1200,630'], ['icon.html', 'apple-touch-icon.png', '180,180']]) {
  execFileSync(exe, ['--headless', '--no-sandbox', '--disable-gpu', '--hide-scrollbars', '--allow-file-access-from-files',
    `--window-size=${size}`, '--virtual-time-budget=3000', `--screenshot=${join(ROOT, 'static', out)}`,
    pathToFileURL(join(ROOT, 'tools', src)).href], { stdio: 'pipe' });
  console.log('wrote static/' + out);
}
