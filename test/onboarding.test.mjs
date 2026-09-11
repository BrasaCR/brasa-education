import assert from 'node:assert/strict';
import test from 'node:test';
import { onboardSchool } from '../functions/api/v1/onboarding.js';

const secret = 'platform-operator-secret'.repeat(3), issuer = 'education-issuer-secret'.repeat(3);
function database(calls) { return { prepare: sql => ({ bind: (...values) => ({ sql, values }) }), batch: async statements => calls.push(...statements) }; }
function request(value = secret, body = {}) { return new Request('https://education/internal/v1/schools', { method: 'POST', headers: { 'content-type': 'application/json', 'x-brasa-platform-authorization': value }, body: JSON.stringify(body) }); }
const valid = { id: 'school-north', slug: 'school-north', name: 'North School', countryCode: 'CR', defaultLocale: 'es', supportedLocales: ['es', 'en'], adminId: 'BRA-ADMIN-12345' };

test('platform operator creates a tenant, first administrator, audit, and invitation', async () => {
  const calls = [], identityCalls = [], env = { DB: database(calls), PLATFORM_OPERATOR_SECRET: secret, EDUCATION_ISSUER_SECRET: issuer, IDENTITY: { fetch: async (url, options) => { identityCalls.push({ url, options }); return Response.json({ invitation_code: 'shown-once', expires_at: '2099-01-01T00:00:00.000Z' }, { status: 201 }); } } };
  const response = await onboardSchool({ request: request(secret, valid), env }), data = (await response.json()).data;
  assert.equal(response.status, 201); assert.equal(data.invitationCode, 'shown-once'); assert.deepEqual(data.supportedLocales, ['es', 'en']);
  assert.equal(calls.length, 3); assert.equal(identityCalls[0].options.headers['x-brasa-service-authorization'], issuer);
});

test('school onboarding rejects callers without the platform credential', async () => {
  const response = await onboardSchool({ request: request('wrong'.repeat(16), valid), env: { DB: database([]), PLATFORM_OPERATOR_SECRET: secret, EDUCATION_ISSUER_SECRET: issuer, IDENTITY: {} } });
  assert.equal(response.status, 401); assert.deepEqual(await response.json(), { error: 'platform_authorization_required' });
});

test('school onboarding validates tenant and locale boundaries', async () => {
  const response = await onboardSchool({ request: request(secret, { ...valid, supportedLocales: ['not a locale'] }), env: { DB: database([]), PLATFORM_OPERATOR_SECRET: secret, EDUCATION_ISSUER_SECRET: issuer, IDENTITY: {} } });
  assert.equal(response.status, 400);
});
