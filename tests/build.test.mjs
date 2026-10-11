import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFile, readdir, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join, resolve } from 'node:path';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const dist = join(root, 'dist');

test('Cloudflare static deployment contains browser assets only', async () => {
  const output = execFileSync(process.execPath, ['scripts/build.mjs'], { cwd: root, encoding: 'utf8' });
  assert.match(output, /Built \d+ static assets in dist\//);
  assert.deepEqual((await readdir(dist)).sort(), ['assets', 'index.html', 'manifest.webmanifest', 'src', 'styles.css', 'sw.js']);
  assert.deepEqual((await readdir(join(dist, 'src'))).sort(), ['app.js', 'card.js', 'gif-worker.js', 'gif.js', 'utils.js']);
  const html = await readFile(join(dist, 'index.html'), 'utf8');
  const sw = await readFile(join(dist, 'sw.js'), 'utf8');
  const config = JSON.parse(await readFile(join(root, 'wrangler.jsonc'), 'utf8'));
  assert.match(html, /src\/app\.js/);
  assert.match(sw, /src\/gif-worker\.js/);
  assert.equal(config.assets.directory, './dist');
  assert.equal((await stat(join(dist, 'index.html'))).isFile(), true);
});
