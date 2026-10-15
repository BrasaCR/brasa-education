import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = path.resolve(import.meta.dirname, '..');
const htmlFiles = fs.readdirSync(root).filter(name => name.endsWith('.html'));
const failures = [];
const checked = new Set();

for (const file of htmlFiles) {
  const content = fs.readFileSync(path.join(root, file), 'utf8');
  const attributes = [...content.matchAll(/(?:href|src)\s*=\s*["']([^"']+)["']/gi)].map(match => match[1]);
  for (const raw of attributes) {
    if (!raw || /^(?:https?:|mailto:|tel:|data:|javascript:|#)/i.test(raw) || raw.includes('${')) continue;
    const clean = raw.split('#')[0].split('?')[0];
    if (!clean || clean === '/') continue;
    const relative = clean.replace(/^\//, '');
    if (!/\.(?:html|js|css|json|webmanifest|png|svg|ico)$/i.test(relative)) continue;
    const target = path.join(root, relative);
    checked.add(relative);
    if (!fs.existsSync(target)) failures.push(`${file} -> ${raw}`);
  }
}

if (failures.length) {
  console.error(`Missing ${failures.length} public route targets:\n${failures.join('\n')}`);
  process.exit(1);
}

console.log(`Route audit passed: ${htmlFiles.length} HTML pages, ${checked.size} local targets.`);
