import { onRequestGet, onRequestPost } from '../functions/api/v1/schools/[schoolId]/lessons.js';
const lessonRoute = /^\/api\/v1\/schools\/([a-zA-Z0-9][a-zA-Z0-9_-]{0,79})\/lessons$/;
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
