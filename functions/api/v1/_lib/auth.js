import { httpError } from './http.js';
const WRITER_ROLES = new Set(['school_admin', 'teacher', 'curriculum_reviewer']);
export async function identityProfile(context) {
  if (!context.env.IDENTITY) throw httpError(503, 'identity_service_unavailable');
  const authorization = context.request.headers.get('authorization') || '';
  if (!authorization.startsWith('Bearer ')) throw httpError(401, 'authentication_required');
  const response = await context.env.IDENTITY.fetch(new Request('https://brasa-identity/api/education/school-platform', { headers: { authorization } }));
  if (!response.ok) throw httpError(401, 'invalid_or_expired_session');
  const profile = await response.json(), actorId = String(profile.display_id || profile.displayId || '');
  if (!actorId) throw httpError(401, 'identity_claim_missing'); return { actorId, profile };
}
export async function authorizeSchoolActor(context, schoolId, allowedRoles = WRITER_ROLES) {
  if (!context.env.DB) throw httpError(503, 'education_database_unavailable');
  const { actorId } = await identityProfile(context);
  const memberships = await context.env.DB.prepare('SELECT role, status FROM school_memberships WHERE school_id = ? AND actor_brasa_id = ? AND status = ?').bind(schoolId, actorId, 'active').all();
  const membership = memberships.results.find((item) => allowedRoles.has(item.role));
  if (!membership) throw httpError(403, 'school_permission_required'); return { actorId, schoolId, role: membership.role };
}
