import assert from 'node:assert/strict';
import test from 'node:test';
import { issueSchoolInvitation, manageSchool, updateLessonStatus, updateMembership } from '../functions/api/v1/schools/[schoolId]/manage.js';

const request = (path, body) => new Request(`https://brasa.education${path}`, { method: body ? 'POST' : 'GET', headers: { authorization: 'Bearer valid' }, body: body && JSON.stringify(body) });
const identity = { fetch: async () => Response.json({ display_id: 'BRA-ADMIN-12345' }) };
function database(role = 'school_admin') {
  const calls = [];
  return { calls, prepare(sql) { return { bind(...values) { calls.push({ sql, values }); return { all: async () => ({ results: sql.includes('SELECT role') ? [{ role }] : [] }), run: async () => ({ meta: { changes: 1 } }) }; } }; }, batch: async items => items };
}

test('school administrator receives private management data', async () => {
  const DB = database(), response = await manageSchool({ request: request('/manage'), env: { DB, IDENTITY: identity }, params: { schoolId: 'school-a' } });
  assert.equal(response.status, 200); assert.equal((await response.json()).data.schoolId, 'school-a');
  assert.equal(DB.calls.filter(call => call.sql.startsWith('SELECT')).length, 3);
});

test('school administrator manages bounded roles with an audit record', async () => {
  const DB = database(), response = await updateMembership({ request: request('/memberships', { actorId: 'bra-teacher-12345', role: 'teacher', status: 'active' }), env: { DB, IDENTITY: identity }, params: { schoolId: 'school-a' } });
  assert.equal(response.status, 200); assert.equal((await response.json()).data.actorId, 'BRA-TEACHER-12345');
  assert.equal(DB.calls.some(call => call.sql.includes('school_audit_log')), true);
});

test('curriculum reviewer publishes an existing lesson', async () => {
  const DB = database('curriculum_reviewer'), lessonId = '11111111-1111-4111-8111-111111111111';
  const response = await updateLessonStatus({ request: request('/status', { status: 'published' }), env: { DB, IDENTITY: identity }, params: { schoolId: 'school-a', lessonId } });
  assert.equal(response.status, 200); assert.equal((await response.json()).data.status, 'published');
  assert.equal(DB.calls.some(call => call.values.includes(lessonId)), true);
});

test('teachers cannot manage school membership', async () => {
  const DB = database('teacher'), response = await updateMembership({ request: request('/memberships', { actorId: 'BRA-OTHER-12345', role: 'teacher', status: 'active' }), env: { DB, IDENTITY: identity }, params: { schoolId: 'school-a' } });
  assert.equal(response.status, 403);
});

test('administrator invitation crosses Identity with a private service credential', async () => {
  const DB = database(), seen = [];
  const IDENTITY = { fetch: async (input, options) => { const url = input instanceof Request ? input.url : String(input); seen.push({ url, options }); return url.includes('/school-platform') ? Response.json({ display_id: 'BRA-ADMIN-12345' }) : Response.json({ invitation_code: 'opaque-code', expires_at: '2099-01-01T00:00:00.000Z' }, { status: 201 }); } };
  const response = await issueSchoolInvitation({ request: request('/invitations', { actorId: 'BRA-TEACHER-12345', role: 'teacher' }), env: { DB, IDENTITY, EDUCATION_ISSUER_SECRET: 'private-service-secret'.repeat(3) }, params: { schoolId: 'school-a' } });
  assert.equal(response.status, 201); assert.equal((await response.json()).data.invitationCode, 'opaque-code');
  assert.equal(seen[1].options.headers['x-brasa-service-authorization'], 'private-service-secret'.repeat(3));
  assert.equal(DB.calls.some(call => call.values.includes('invitation_issue')), true);
});

test('invitation issuance fails closed when the service credential is absent', async () => {
  const response = await issueSchoolInvitation({ request: request('/invitations', { actorId: 'BRA-TEACHER-12345', role: 'teacher' }), env: { DB: database(), IDENTITY: identity }, params: { schoolId: 'school-a' } });
  assert.equal(response.status, 503);
});
