import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');

test('publishes the Global Primary and Secondary Education collection', () => {
  assert.match(html, /id="global-primary-secondary"/);
  assert.match(html, /Global primary &amp; secondary education · 14 direct providers/);
  assert.equal((html.match(/class="feature school-provider"/g) || []).length, 14);
});

test('places the collection after Marquee Schools and before Human Capability', () => {
  assert.match(html, /#marquee-schools \{ order: 2; \}/);
  assert.match(html, /#global-primary-secondary \{ order: 3; \}/);
  assert.match(html, /#human-capability \{ order: 4; \}/);
});

test('labels differing access and educational models', () => {
  for (const label of ['Free · K–12', 'Free curriculum · Paid admin', 'Free · Christian', 'Free · Live tutoring']) {
    assert.match(html, new RegExp(label));
  }
  const links = [...html.matchAll(/<a href="https:\/\/[^\"]+" class="feature school-provider"[^>]+>/g)];
  assert.equal(links.length, 14);
  for (const [link] of links) assert.match(link, /target="_blank" rel="noopener noreferrer"/);
});
