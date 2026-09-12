import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

const html = await readFile(path.resolve(import.meta.dirname, '..', 'index.html'), 'utf8');

test('publishes twelve bounded global training provider tiles', () => {
  assert.match(html, /Global career training · 12 providers/);
  assert.equal((html.match(/class="feature training-provider"/g) || []).length, 12);
  for (const provider of ['IBM SkillsBuild', 'Google Skillshop', 'AWS Skill Builder', 'Microsoft Learn', 'Cisco Skills for All', 'Salesforce Trailhead', 'Path to Pro', 'UNESCO Global Skills Academy', 'OpenLearn', 'UNICEF Agora', 'OpenWHO', 'ITCILO']) assert.match(html, new RegExp(provider));
});

test('opens external training providers safely and preserves the provider boundary', () => {
  const links = [...html.matchAll(/<a href="https:\/\/[^\"]+" class="feature training-provider"[^>]+>/g)].map(match => match[0]);
  assert.equal(links.length, 12);
  for (const link of links) assert.match(link, /target="_blank" rel="noopener noreferrer"/);
  assert.match(html, /A listing is not a partnership, endorsement, accreditation, or guarantee of employment/);
});
