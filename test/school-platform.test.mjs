import assert from 'node:assert/strict';
import test from 'node:test';
import { authorizeSchoolActor } from '../functions/api/v1/_lib/auth.js';
import { onRequestGet, onRequestPost } from '../functions/api/v1/schools/[schoolId]/lessons.js';
function authContext(membership) {
  return { request: new Request('https://brasa.education/api', { headers: { authorization: 'Bearer valid' } }), env: { IDENTITY: { fetch: async () => new Response(JSON.stringify({ display_id: 'BRA-TEACHER' })) }, DB: { prepare: () => ({ bind: () => ({ all: async () => ({ results: membership ? [membership] : [] }) }) }) } } };
}
test('requires an active same-school writer membership', async () => {
  await assert.rejects(authorizeSchoolActor(authContext(null), 'school-a'), (error) => error.status === 403);
  await assert.rejects(authorizeSchoolActor(authContext({ role: 'student' }), 'school-a'), (error) => error.status === 403);
  assert.equal((await authorizeSchoolActor(authContext({ role: 'teacher' }), 'school-a')).role, 'teacher');
});
test('public listing returns published fields without author identity', async () => {
  const row = { id: 'lesson-1', schoolId: 'school-a', slug: 'water', locale: 'en', title: 'Water', summary: '', bodyJson: '{"blocks":[]}', accessibilityJson: '{}', offlineEligible: 1 };
  const env = { DB: { prepare: () => ({ bind: () => ({ all: async () => ({ results: [row] }) }) }) } };
  const response = await onRequestGet({ env, params: { schoolId: 'school-a' }, request: new Request('https://brasa.education/api/v1/schools/school-a/lessons') });
  const lesson = (await response.json()).data[0]; assert.deepEqual(lesson.body, { blocks: [] }); assert.equal('createdBy' in lesson, false); assert.equal('bodyJson' in lesson, false);
});
test('public listing validates and binds bounded filters and pagination', async () => {
  let prepared, values;
  const row = { id: 'lesson-1', schoolId: 'school-a', slug: 'water', locale: 'es', title: 'Agua', summary: '', bodyJson: '{}', accessibilityJson: '{}', offlineEligible: 1 };
  const env = { DB: { prepare: (sql) => { prepared = sql; return { bind: (...bound) => { values = bound; return { all: async () => ({ results: [row, row] }) }; } }; } } };
  const response = await onRequestGet({ env, params: { schoolId: 'school-a' }, request: new Request('https://brasa.education/api/v1/schools/school-a/lessons?locale=es&q=agua&offlineEligible=true&page=2&limit=1') });
  const body = await response.json(); assert.equal(response.status, 200); assert.equal(body.data.length, 1); assert.deepEqual(body.meta, { page: 2, limit: 1, hasMore: true }); assert.match(prepared, /title LIKE/); assert.deepEqual(values, ['school-a', 'es', '%agua%', '%agua%', 1, 2, 1]);
  const invalid = await onRequestGet({ env, params: { schoolId: 'school-a' }, request: new Request('https://brasa.education/api/v1/schools/school-a/lessons?limit=500') }); assert.equal(invalid.status, 400);
});
test('creation binds the routed school and writes an audit event', async () => {
  const batches = [];
  const env = { IDENTITY: { fetch: async () => new Response(JSON.stringify({ display_id: 'BRA-TEACHER' })) }, DB: { prepare: (sql) => ({ bind: (...values) => ({ all: async () => ({ results: [{ role: 'teacher' }] }), sql, values }) }), batch: async (items) => batches.push(items) } };
  const request = new Request('https://brasa.education/api/v1/schools/school-a/lessons', { method: 'POST', headers: { authorization: 'Bearer valid' }, body: JSON.stringify({ slug: 'water', title: 'Water', body: { blocks: [] } }) });
  const response = await onRequestPost({ env, request, params: { schoolId: 'school-a' } });
  assert.equal(response.status, 201); assert.equal((await response.json()).data.schoolId, 'school-a'); assert.equal(batches[0].length, 2); assert.equal(batches[0][0].values[1], 'school-a');
});
