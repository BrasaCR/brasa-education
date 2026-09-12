import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');

test('Human Capability collection presents all direct provider resources', () => {
  assert.match(html, /id="human-capability"/);
  assert.match(html, /Human capability · Education for life · 29 direct resources/);
  assert.equal((html.match(/class="feature capability-provider"/g) || []).length, 29);
});

test('Human Capability links preserve the external-provider boundary', () => {
  const links = [...html.matchAll(/<a href="https:\/\/[^\"]+" class="feature capability-provider"[^>]+>/g)].map((match) => match[0]);
  assert.equal(links.length, 29);
  for (const link of links) {
    assert.match(link, /target="_blank"/);
    assert.match(link, /rel="noopener noreferrer"/);
    assert.match(link, /data-logo-domain="[^"]+"/);
  }
  assert.match(html, /BRASA connects learners to them and does not claim their content/);
});

test('Marquee schools and Primary and Secondary Education precede Human Capability', () => {
  assert.match(html, /<div class="featured-band reveal" hidden>\s*<p class="band-eyebrow">Languages · 4 tiles<\/p>/);
  assert.match(html, /\.featured-collections > #featured-start \{ order: 1; \}/);
  assert.match(html, /\.featured-collections > #marquee-schools \{ order: 2; \}/);
  assert.match(html, /\.featured-collections > #global-primary-secondary \{ order: 3; \}/);
  assert.match(html, /\.featured-collections > #human-capability \{ order: 4; \}/);
});
