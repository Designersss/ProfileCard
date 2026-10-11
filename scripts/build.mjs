import { cp, mkdir, readdir, rm, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join, resolve } from 'node:path';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const out = join(root, 'dist');
const publicFiles = ['index.html', 'styles.css', 'sw.js', 'manifest.webmanifest'];
const publicDirs = ['assets', 'src'];
const maxAssetBytes = 25 * 1024 * 1024;

// Explicit public allowlist: never deploy the repository root or node_modules.
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
for (const name of publicFiles) await cp(join(root, name), join(out, name));
for (const name of publicDirs) await cp(join(root, name), join(out, name), { recursive: true });

async function walk(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(path));
    else if (entry.isFile()) {
      const { size } = await stat(path);
      if (size > maxAssetBytes) throw new Error('Asset exceeds 25 MiB: ' + path);
      files.push(path);
    } else throw new Error('Unsupported asset type: ' + path);
  }
  return files;
}
const files = await walk(out);
console.log('Built ' + files.length + ' static assets in dist/ for Cloudflare Workers.');
