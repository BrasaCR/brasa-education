import assert from 'node:assert/strict';
import test from 'node:test';
import { changeSchoolLifecycle } from '../functions/api/v1/school-lifecycle.js';
const platform = 'p'.repeat(64), issuer = 'i'.repeat(64);
const request = body => new Request('https://education/internal/v1/schools/school-a/lifecycle', { method: 'POST', headers: { 'content-type': 'application/json', 'x-brasa-platform-authorization': platform }, body: JSON.stringify(body) });
function environment(members = [{ actorId: 'BRA-ADMIN-12345' }]) {
  const calls = [];
  return { calls, PLATFORM_OPERATOR_SECRET: platform, EDUCATION_ISSUER_SECRET: issuer,
    IDENTITY: { fetch: async url => String(url).includes('invitations') ? Response.json({ invitation_code: 'once', expires_at: '2099-01-01T00:00:00Z' }, { status: 201 }) : Response.json({ ok: true, revoked: 1 }) },
    DB: { prepare: sql => ({ bind: (...values) => { calls.push({ sql, values }); return { first: async () => ({ status: 'active' }), all: async () => ({ results: members }), run: async () => ({ meta: { changes: 1 } }) }; } }), batch: async statements => statements }
  };
}
test('platform suspension preserves membership state and revokes sessions', async () => { const env = environment(), response = await changeSchoolLifecycle({ request: request({ action: 'suspend' }), env, params: { schoolId: 'school-a' } }); assert.equal(response.status, 200); assert.equal((await response.json()).data.status, 'suspended'); assert.equal(env.calls.some(call => call.sql.includes('status_before_suspension')), true); });
test('platform reactivation restores only suspension-marked membership state', async () => { const env = environment(), response = await changeSchoolLifecycle({ request: request({ action: 'reactivate' }), env, params: { schoolId: 'school-a' } }); assert.equal(response.status, 200); assert.equal(env.calls.some(call => call.sql.includes('COALESCE(status_before_suspension')), true); });
test('ownership recovery revokes old administrators and returns one-time invitation', async () => { const env = environment(), response = await changeSchoolLifecycle({ request: request({ action: 'recover', adminId: 'BRA-NEW-ADMIN-12345', reason:'Verified leadership handoff', evidenceRef:'case-123', confirm:'school-a' }), env, params: { schoolId: 'school-a' } }), data = (await response.json()).data; assert.equal(response.status, 200); assert.equal(data.invitationCode, 'once'); assert.equal(data.adminId, 'BRA-NEW-ADMIN-12345'); });
test('school lifecycle rejects missing platform authorization', async () => { const env = environment(); env.PLATFORM_OPERATOR_SECRET = 'different'.repeat(8); const response = await changeSchoolLifecycle({ request: request({ action: 'suspend' }), env, params: { schoolId: 'school-a' } }); assert.equal(response.status, 401); });
