import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { onRequestGet } from '../functions/api/v1/schools/[schoolId]/lessons.js';
const contract = JSON.parse(await readFile(new URL('../contracts/brasa-public-api.v1.json', import.meta.url)));

test('published lessons satisfy the BRASA v1 public contract', async () => {
  assert.equal(contract.operationId, 'listPublishedLessons'); assert.match(contract.contractVersion, /^1\./);
  const row = { id: 'lesson-1', schoolId: 'school-a', slug: 'water', locale: 'en', title: 'Water', summary: '', bodyJson: '{"blocks":[]}', accessibilityJson: '{}', offlineEligible: 1 };
  const env = { DB: { prepare: () => ({ bind: () => ({ all: async () => ({ results: [row] }) }) }) } };
  const response = await onRequestGet({ env, params: { schoolId: 'school-a' }, request: new Request('https://brasa.education/api/v1/schools/school-a/lessons?locale=en') });
  assert.equal(response.status, 200); assert.match(response.headers.get('cache-control'), /^public/);
  const body = await response.json();
  for (const field of contract.requiredRoot) assert.ok(field in body);
  for (const item of body.data) for (const field of contract.requiredItem) assert.ok(field in item, `missing ${field}`);
  const serialized = JSON.stringify(body);
  for (const field of contract.forbiddenFields) assert.equal(new RegExp(`"${field}"\\s*:`).test(serialized), false, `exposed ${field}`);
});
