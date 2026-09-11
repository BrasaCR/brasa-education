import { onRequestGet, onRequestPost } from '../functions/api/v1/schools/[schoolId]/lessons.js';
const lessonRoute = /^\/api\/v1\/schools\/([a-zA-Z0-9][a-zA-Z0-9_-]{0,79})\/lessons$/;
const json = (body, status, headers = {}) => Response.json(body, { status, headers: { 'cache-control': 'no-store', ...headers } });

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/health') return json({ ok: true, service: 'brasa-education', version: 1 }, 200);
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
