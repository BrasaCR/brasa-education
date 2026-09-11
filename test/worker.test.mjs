import assert from 'node:assert/strict';
import { access } from 'node:fs/promises';
import test from 'node:test';
import worker from '../src/index.js';

test('Worker adapter exposes health and public lessons', async () => {
  const env = { DB: { prepare: () => ({ bind: () => ({ all: async () => ({ results: [] }) }) }) }, ASSETS: { fetch: async () => new Response('asset') } };
  const health = await worker.fetch(new Request('https://brasa.education/health'), env);
  assert.deepEqual(await health.json(), { ok: true, service: 'brasa-education', version: 1 });
  const lessons = await worker.fetch(new Request('https://brasa.education/api/v1/schools/staging-school/lessons'), env);
  assert.equal(lessons.status, 200); assert.deepEqual(await lessons.json(), { data: [] });
});

test('writes fail closed while the staging identity binding is absent', async () => {
  const response = await worker.fetch(new Request('https://brasa.education/api/v1/schools/staging-school/lessons', { method: 'POST', headers: { authorization: 'Bearer test' }, body: '{}' }), { DB: {} });
  assert.equal(response.status, 503); assert.deepEqual(await response.json(), { error: 'identity_service_unavailable' });
});

test('restricted Education assets exclude dependency and deployment metadata', async () => {
  await assert.doesNotReject(access(new URL('../.education-assets/index.html', import.meta.url)));
  await assert.rejects(access(new URL('../.education-assets/package-lock.json', import.meta.url)));
  await assert.rejects(access(new URL('../.education-assets/wrangler.jsonc', import.meta.url)));
});
