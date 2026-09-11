import { cp, mkdir, readdir, rm } from 'node:fs/promises';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..'), output = path.join(root, '.education-assets');
const publicExtensions = new Set(['.html', '.js', '.css', '.json', '.xml', '.txt', '.ico', '.png', '.svg', '.webmanifest']);
const excluded = new Set(['package.json', 'package-lock.json', 'wrangler.jsonc']);
await rm(output, { recursive: true, force: true }); await mkdir(output, { recursive: true });
let count = 0;
for (const entry of await readdir(root, { withFileTypes: true })) {
  if (!entry.isFile() || excluded.has(entry.name) || !publicExtensions.has(path.extname(entry.name).toLowerCase())) continue;
  await cp(path.join(root, entry.name), path.join(output, entry.name)); count += 1;
}
console.log(`Built ${count} reviewed Education static assets.`);
