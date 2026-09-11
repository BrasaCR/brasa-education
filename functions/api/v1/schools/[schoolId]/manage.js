import { authorizeSchoolActor } from '../../_lib/auth.js';
import { failure, httpError, json, limitedJson } from '../../_lib/http.js';

const ADMIN = new Set(['school_admin']);
const REVIEWERS = new Set(['school_admin', 'curriculum_reviewer']);
const MANAGED_ROLES = new Set(['teacher', 'curriculum_reviewer', 'student', 'guardian']);
const MEMBER_STATES = new Set(['active', 'suspended', 'revoked']);
const LESSON_STATES = new Set(['review', 'published', 'archived']);

export async function manageSchool(context) {
  try {
    const schoolId = String(context.params.schoolId);
    await authorizeSchoolActor(context, schoolId, ADMIN);
    const [school, memberships, lessons] = await Promise.all([
      context.env.DB.prepare('SELECT id, slug, name, country_code AS countryCode, default_locale AS defaultLocale, public_profile AS publicProfile, supported_locales_json AS supportedLocalesJson, brand_primary_color AS brandPrimaryColor, support_url AS supportUrl FROM school_tenants WHERE id = ? AND status = ?').bind(schoolId, 'active').first(),
      context.env.DB.prepare('SELECT actor_brasa_id AS actorId, role, status, updated_at AS updatedAt FROM school_memberships WHERE school_id = ? ORDER BY updated_at DESC LIMIT 200').bind(schoolId).all(),
      context.env.DB.prepare("SELECT id, slug, locale, title, summary, status, updated_at AS updatedAt FROM school_lessons WHERE school_id = ? AND status != 'archived' ORDER BY updated_at DESC LIMIT 200").bind(schoolId).all()
    ]);
    if (!school) throw httpError(404, 'school_not_found');
    return json({ data: { school: { ...school, publicProfile: Boolean(school.publicProfile), supportedLocales: JSON.parse(school.supportedLocalesJson), supportedLocalesJson: undefined }, memberships: memberships.results, lessons: lessons.results } });
  } catch (error) { return failure(error); }
}

export async function updateSchoolSettings(context) {
  try {
    const schoolId = String(context.params.schoolId), actor = await authorizeSchoolActor(context, schoolId, ADMIN), input = await limitedJson(context.request, 8192);
    const name = String(input.name || '').trim(), defaultLocale = String(input.defaultLocale || ''), locales = [...new Set(Array.isArray(input.supportedLocales) ? input.supportedLocales : [])];
    const color = String(input.brandPrimaryColor || '').toLowerCase(), supportUrl = String(input.supportUrl || '').trim(), publicProfile = input.publicProfile === true;
    if (!name || name.length > 160 || !locales.includes(defaultLocale) || locales.length < 1 || locales.length > 12 || locales.some(locale => !/^[a-z]{2,3}(?:-[A-Za-z0-9]+)*$/.test(locale)) || !/^#[0-9a-f]{6}$/.test(color)) throw httpError(400, 'invalid_school_settings');
    if (supportUrl) { let parsed; try { parsed = new URL(supportUrl); } catch { throw httpError(400, 'invalid_school_settings'); } if (parsed.protocol !== 'https:' || parsed.username || parsed.password || supportUrl.length > 500) throw httpError(400, 'invalid_school_settings'); }
    const now = new Date().toISOString(), result = await context.env.DB.prepare("UPDATE school_tenants SET name=?, default_locale=?, supported_locales_json=?, brand_primary_color=?, support_url=?, public_profile=?, updated_at=? WHERE id=? AND status='active'").bind(name, defaultLocale, JSON.stringify(locales), color, supportUrl || null, publicProfile ? 1 : 0, now, schoolId).run();
    if (!result.meta?.changes) throw httpError(404, 'school_not_found');
    await context.env.DB.prepare('INSERT INTO school_audit_log (id, school_id, actor_brasa_id, action, resource_type, resource_id, snapshot_json, occurred_at) VALUES (?,?,?,?,?,?,?,?)').bind(crypto.randomUUID(), schoolId, actor.actorId, 'settings_update', 'school', schoolId, JSON.stringify({ name, defaultLocale, supportedLocales: locales, brandPrimaryColor: color, supportUrl: supportUrl || null, publicProfile }), now).run();
    return json({ data: { id: schoolId, name, defaultLocale, supportedLocales: locales, brandPrimaryColor: color, supportUrl: supportUrl || null, publicProfile, updatedAt: now } });
  } catch (error) { return failure(error); }
}

export async function updateMembership(context) {
  try {
    const schoolId = String(context.params.schoolId), actor = await authorizeSchoolActor(context, schoolId, ADMIN);
    const input = await limitedJson(context.request, 4096), actorId = String(input.actorId || '').trim().toUpperCase();
    const role = String(input.role || ''), status = String(input.status || 'active');
    if (!/^BRA-[A-Z0-9-]{5,40}$/.test(actorId) || !MANAGED_ROLES.has(role) || !MEMBER_STATES.has(status)) throw httpError(400, 'invalid_membership');
    const now = new Date().toISOString(), id = crypto.randomUUID();
    await context.env.DB.batch([
      context.env.DB.prepare('INSERT INTO school_memberships (id, school_id, actor_brasa_id, role, status, created_at, updated_at) VALUES (?,?,?,?,?,?,?) ON CONFLICT(school_id, actor_brasa_id, role) DO UPDATE SET status = excluded.status, updated_at = excluded.updated_at').bind(id, schoolId, actorId, role, status, now, now),
      context.env.DB.prepare('INSERT INTO school_audit_log (id, school_id, actor_brasa_id, action, resource_type, resource_id, snapshot_json, occurred_at) VALUES (?,?,?,?,?,?,?,?)').bind(crypto.randomUUID(), schoolId, actor.actorId, 'membership_update', 'membership', actorId, JSON.stringify({ role, status }), now)
    ]);
    return json({ data: { schoolId, actorId, role, status, updatedAt: now } });
  } catch (error) { return failure(error); }
}

export async function issueSchoolInvitation(context) {
  try {
    const schoolId = String(context.params.schoolId), actor = await authorizeSchoolActor(context, schoolId, ADMIN);
    if (!context.env.EDUCATION_ISSUER_SECRET) throw httpError(503, 'invitation_service_unavailable');
    const input = await limitedJson(context.request, 4096), actorId = String(input.actorId || '').trim().toUpperCase(), role = String(input.role || '');
    if (!/^BRA-[A-Z0-9-]{5,40}$/.test(actorId) || !MANAGED_ROLES.has(role)) throw httpError(400, 'invalid_invitation');
    const now = new Date().toISOString();
    await context.env.DB.prepare('INSERT INTO school_memberships (id, school_id, actor_brasa_id, role, status, created_at, updated_at) VALUES (?,?,?,?,?,?,?) ON CONFLICT(school_id, actor_brasa_id, role) DO UPDATE SET status = excluded.status, updated_at = excluded.updated_at').bind(crypto.randomUUID(), schoolId, actorId, role, 'active', now, now).run();
    const response = await context.env.IDENTITY.fetch('https://brasa-identity/internal/education/invitations', { method: 'POST', headers: { 'content-type': 'application/json', 'x-brasa-service-authorization': context.env.EDUCATION_ISSUER_SECRET }, body: JSON.stringify({ display_id: actorId, assurance_level: 1, expires_in: 86400 }) });
    if (!response.ok) throw httpError(503, 'invitation_service_unavailable');
    const invitation = await response.json();
    await context.env.DB.prepare('INSERT INTO school_audit_log (id, school_id, actor_brasa_id, action, resource_type, resource_id, snapshot_json, occurred_at) VALUES (?,?,?,?,?,?,?,?)').bind(crypto.randomUUID(), schoolId, actor.actorId, 'invitation_issue', 'membership', actorId, JSON.stringify({ role, expiresAt: invitation.expires_at }), now).run();
    return json({ data: { actorId, role, invitationCode: invitation.invitation_code, expiresAt: invitation.expires_at } }, 201);
  } catch (error) { return failure(error); }
}

export async function updateLessonStatus(context) {
  try {
    const schoolId = String(context.params.schoolId), actor = await authorizeSchoolActor(context, schoolId, REVIEWERS);
    const input = await limitedJson(context.request, 2048), status = String(input.status || '');
    if (!LESSON_STATES.has(status)) throw httpError(400, 'invalid_lesson_status');
    const lessonId = String(context.params.lessonId), now = new Date().toISOString(), publishedAt = status === 'published' ? now : null;
    const result = await context.env.DB.prepare("UPDATE school_lessons SET status = ?, updated_by = ?, updated_at = ?, published_at = CASE WHEN ? = 'published' THEN ? ELSE published_at END WHERE id = ? AND school_id = ? AND status != 'archived'").bind(status, actor.actorId, now, status, publishedAt, lessonId, schoolId).run();
    if (!result.meta?.changes) throw httpError(404, 'lesson_not_found');
    await context.env.DB.prepare('INSERT INTO school_audit_log (id, school_id, actor_brasa_id, action, resource_type, resource_id, snapshot_json, occurred_at) VALUES (?,?,?,?,?,?,?,?)').bind(crypto.randomUUID(), schoolId, actor.actorId, 'status_update', 'lesson', lessonId, JSON.stringify({ status }), now).run();
    return json({ data: { id: lessonId, schoolId, status, updatedAt: now } });
  } catch (error) { return failure(error); }
}
