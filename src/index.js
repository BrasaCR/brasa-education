import { onRequestGet, onRequestPost } from '../functions/api/v1/schools/[schoolId]/lessons.js';
import { issueSchoolInvitation, manageSchool, updateLessonStatus, updateMembership, updateSchoolSettings } from '../functions/api/v1/schools/[schoolId]/manage.js';
import { onboardSchool } from '../functions/api/v1/onboarding.js';
import { changeSchoolLifecycle } from '../functions/api/v1/school-lifecycle.js';
const lessonRoute = /^\/api\/v1\/schools\/([a-zA-Z0-9][a-zA-Z0-9_-]{0,79})\/lessons$/;
const manageRoute = /^\/api\/v1\/schools\/([a-zA-Z0-9][a-zA-Z0-9_-]{0,79})\/manage$/;
const membershipRoute = /^\/api\/v1\/schools\/([a-zA-Z0-9][a-zA-Z0-9_-]{0,79})\/memberships$/;
const invitationRoute = /^\/api\/v1\/schools\/([a-zA-Z0-9][a-zA-Z0-9_-]{0,79})\/invitations$/;
const settingsRoute = /^\/api\/v1\/schools\/([a-zA-Z0-9][a-zA-Z0-9_-]{0,79})\/settings$/;
const lessonStatusRoute = /^\/api\/v1\/schools\/([a-zA-Z0-9][a-zA-Z0-9_-]{0,79})\/lessons\/([0-9a-f-]{36})\/status$/;
const lifecycleRoute = /^\/internal\/v1\/schools\/([a-zA-Z0-9][a-zA-Z0-9_-]{0,79})\/lifecycle$/;
const sessionRoutes = new Set(['/api/v1/session/exchange', '/api/v1/session/renew', '/api/v1/session/logout']);
const json = (body, status, headers = {}) => Response.json(body, { status, headers: { 'cache-control': 'no-store', ...headers } });

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/health') return json({ ok: true, service: 'brasa-education', version: 1 }, 200);
    if (sessionRoutes.has(url.pathname)) {
      if (!env.IDENTITY) return json({ error: 'identity_service_unavailable' }, 503);
      const upstream = new URL(url.pathname.replace('/api/v1/', '/api/'), 'https://brasa-identity');
      const response = await env.IDENTITY.fetch(new Request(upstream, request));
      return new Response(response.body, { status: response.status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
    }
    if (url.pathname === '/internal/v1/schools' && request.method === 'POST') return onboardSchool({ request, env });
    const lifecycle = url.pathname.match(lifecycleRoute);
    if (lifecycle && request.method === 'POST') return changeSchoolLifecycle({ request, env, params: { schoolId: lifecycle[1] } });
    const manage = url.pathname.match(manageRoute);
    if (manage && request.method === 'GET') return manageSchool({ request, env, params: { schoolId: manage[1] } });
    const membership = url.pathname.match(membershipRoute);
    if (membership && request.method === 'POST') return updateMembership({ request, env, params: { schoolId: membership[1] } });
    const invitation = url.pathname.match(invitationRoute);
    if (invitation && request.method === 'POST') return issueSchoolInvitation({ request, env, params: { schoolId: invitation[1] } });
    const settings = url.pathname.match(settingsRoute);
    if (settings && request.method === 'POST') return updateSchoolSettings({ request, env, params: { schoolId: settings[1] } });
    const lessonStatus = url.pathname.match(lessonStatusRoute);
    if (lessonStatus && request.method === 'POST') return updateLessonStatus({ request, env, params: { schoolId: lessonStatus[1], lessonId: lessonStatus[2] } });
    const match = url.pathname.match(lessonRoute);
    if (match) {
      const context = { request, env, params: { schoolId: match[1] } };
      if (request.method === 'GET') return onRequestGet(context);
      if (request.method === 'HEAD') { const response = await onRequestGet(context); return new Response(null, response); }
      if (request.method === 'POST') return onRequestPost(context);
      return json({ error: 'method_not_allowed' }, 405, { allow: 'GET, HEAD, POST' });
    }
    return env.ASSETS.fetch(request);
  }
};
