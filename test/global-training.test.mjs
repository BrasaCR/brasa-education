import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

const html = await readFile(path.resolve(import.meta.dirname, '..', 'index.html'), 'utf8');

test('publishes twenty-five direct global training provider tiles', () => {
  assert.match(html, /Global career training · 25 direct providers/);
  assert.equal((html.match(/class="feature training-provider"/g) || []).length, 25);
  for (const provider of ['IBM SkillsBuild', 'Google Skillshop', 'AWS Skill Builder', 'Microsoft Learn', 'Cisco Skills for All', 'Salesforce Trailhead', 'Path to Pro', 'Digital Ad Expert', 'OpenLearn', 'UNICEF Agora', 'OpenWHO', 'ITCILO', 'Conecta Empleo', 'atingi', 'Huawei Talent', 'ITU Academy', 'Orange Digital Center', 'OutSystems Education', 'Technovation Girls', 'Festo Learning Experience', 'Education for Innovation', 'Generation Global', 'HP Foundation', 'WHO Academy', 'Junior Achievement Americas']) assert.match(html, new RegExp(provider));
});

test('opens external training providers safely and preserves the provider boundary', () => {
  const links = [...html.matchAll(/<a href="https:\/\/[^\"]+" class="feature training-provider"[^>]+>/g)].map(match => match[0]);
  assert.equal(links.length, 25);
  for (const link of links) assert.match(link, /target="_blank" rel="noopener noreferrer"/);
  assert.match(html, /A listing is not a BRASA partnership, endorsement, accreditation, or guarantee of employment/);
});

test('adds a resilient company logo to every training tile', () => {
  const domains = html.match(/const trainingLogoDomains = \[([\s\S]*?)\];/)?.[1]
    .match(/'[^']+'/g) || [];
  assert.equal(domains.length, 25);
  assert.match(html, /className = 'training-logo-panel'/);
  assert.match(html, /logo\.addEventListener\('error', \(\) => \{ logo\.hidden = true; \}\)/);
  assert.match(html, /panel\.append\(logo, mark\)/);
});
