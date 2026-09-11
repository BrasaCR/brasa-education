import { authorizeSchoolActor } from '../../_lib/auth.js';
import { failure, httpError, json, limitedJson } from '../../_lib/http.js';
export async function onRequestGet({ env, params, request }) {
  try {
    if (!env.DB) throw httpError(503, 'education_database_unavailable');
    const locale = new URL(request.url).searchParams.get('locale') || 'en';
    const result = await env.DB.prepare("SELECT id, school_id AS schoolId, slug, locale, title, summary, body_json AS bodyJson, accessibility_json AS accessibilityJson, offline_eligible AS offlineEligible, published_at AS publishedAt, updated_at AS updatedAt FROM school_lessons WHERE school_id = ? AND locale = ? AND status = 'published' ORDER BY updated_at DESC").bind(params.schoolId, locale).all();
    return json({ data: result.results.map(publicLesson) }, 200, { 'cache-control': 'public, max-age=300, stale-while-revalidate=3600' });
  } catch (error) { return failure(error); }
}
export async function onRequestPost(context) {
  try {
    const schoolId = String(context.params.schoolId), actor = await authorizeSchoolActor(context, schoolId, new Set(['school_admin', 'teacher']));
    const input = validateLesson(await limitedJson(context.request)), id = crypto.randomUUID(), now = new Date().toISOString();
    await context.env.DB.batch([
      context.env.DB.prepare('INSERT INTO school_lessons (id, school_id, slug, locale, title, summary, body_json, accessibility_json, offline_eligible, status, created_by, updated_by, published_at, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').bind(id, schoolId, input.slug, input.locale, input.title, input.summary, JSON.stringify(input.body), JSON.stringify(input.accessibility), input.offlineEligible ? 1 : 0, 'draft', actor.actorId, actor.actorId, null, now, now),
      context.env.DB.prepare('INSERT INTO school_audit_log (id, school_id, actor_brasa_id, action, resource_type, resource_id, snapshot_json, occurred_at) VALUES (?,?,?,?,?,?,?,?)').bind(crypto.randomUUID(), schoolId, actor.actorId, 'create', 'lesson', id, JSON.stringify({ ...input, body: '[stored-separately]' }), now)
    ]);
    return json({ data: { id, schoolId, status: 'draft', updatedAt: now } }, 201);
  } catch (error) { return failure(error); }
}
const publicLesson = (row) => ({ ...row, body: JSON.parse(row.bodyJson), accessibility: JSON.parse(row.accessibilityJson), offlineEligible: Boolean(row.offlineEligible), bodyJson: undefined, accessibilityJson: undefined });
function validateLesson(input) {
  const text = (value, max) => { const result = String(value || '').trim(); if (!result || result.length > max) throw httpError(400, 'invalid_lesson'); return result; };
  const slug = text(input.slug, 100).toLowerCase();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || !/^[a-z]{2,3}(?:-[A-Za-z0-9]+)*$/.test(input.locale || 'en')) throw httpError(400, 'invalid_lesson');
  if (!input.body || typeof input.body !== 'object' || Array.isArray(input.body)) throw httpError(400, 'invalid_lesson');
  return { slug, locale: input.locale || 'en', title: text(input.title, 240), summary: String(input.summary || '').trim().slice(0, 500), body: input.body, accessibility: input.accessibility && typeof input.accessibility === 'object' ? input.accessibility : {}, offlineEligible: input.offlineEligible !== false };
}
