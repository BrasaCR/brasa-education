import assert from 'node:assert/strict';
import { access } from 'node:fs/promises';
import test from 'node:test';
import worker from '../src/index.js';

test('Worker adapter exposes health and public lessons', async () => {
  const env = { DB: { prepare: () => ({ bind: () => ({ all: async () => ({ results: [] }) }) }) }, ASSETS: { fetch: async () => new Response('asset') } };
  const health = await worker.fetch(new Request('https://brasa.education/health'), env);
  assert.deepEqual(await health.json(), { ok: true, service: 'brasa-education', version: 1 });
  const lessons = await worker.fetch(new Request('https://brasa.education/api/v1/schools/staging-school/lessons'), env);
  assert.equal(lessons.status, 200); assert.deepEqual(await lessons.json(), { data: [], meta: { page: 1, limit: 25, hasMore: false } });
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

test('session lifecycle is proxied only through the identity binding', async () => {
  let upstream; const env = { IDENTITY: { fetch: async request => { upstream = request; return Response.json({ access_token: 'opaque' }, { status: 201 }); } }, ASSETS: { fetch: async () => new Response('asset') } };
  const request = new Request('https://brasa.education/api/v1/session/exchange', { method: 'POST', body: '{"invitation_code":"code"}' });
  const response = await worker.fetch(request, env);
  assert.equal(response.status, 201); assert.equal(new URL(upstream.url).pathname, '/api/session/exchange'); assert.equal(upstream.method, 'POST'); assert.equal(response.headers.get('cache-control'), 'no-store');
});
