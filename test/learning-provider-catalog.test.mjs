import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const catalog = JSON.parse(await readFile(new URL('../learning-providers.json', import.meta.url)));
const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');

test('catalog gives every training tile a unique reviewed provider record', () => {
  assert.equal(catalog.schemaVersion, 1); assert.equal(catalog.status, 'curated-discovery'); assert.equal(catalog.providers.length, 12);
  assert.equal(new Set(catalog.providers.map(({ id }) => id)).size, 12);
  assert.equal(new Set(catalog.providers.map(({ url }) => url)).size, 12);
  for (const provider of catalog.providers) {
    assert.match(provider.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/); assert.match(provider.url, /^https:\/\//);
    for (const field of ['languages', 'formats', 'credentials', 'skills', 'careers']) assert.ok(provider[field].length > 0, `${provider.id} missing ${field}`);
    assert.equal(provider.review.status, 'reviewed'); assert.ok(provider.review.nextReviewAt > provider.review.reviewedAt);
    assert.ok(html.includes(`href="${provider.url}"`), `${provider.id} has no matching tile`);
  }
});

test('catalog declares independent ownership and avoids learner data', () => {
  assert.match(catalog.disclaimer, /not a partnership, endorsement, accreditation, or employment guarantee/i);
  const serialized = JSON.stringify(catalog);
  for (const field of ['learnerId', 'studentId', 'email', 'progress', 'accountId', 'credentialId']) assert.equal(new RegExp(`"${field}"\\s*:`).test(serialized), false);
});
