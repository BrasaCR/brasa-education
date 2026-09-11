import { failure, httpError, json, limitedJson } from './_lib/http.js';
import { platformAuthorized } from './onboarding.js';

async function revoke(env, actorId) {
  const response = await env.IDENTITY.fetch('https://brasa-identity/internal/education/revoke', { method: 'POST', headers: { 'content-type': 'application/json', 'x-brasa-service-authorization': env.EDUCATION_ISSUER_SECRET }, body: JSON.stringify({ display_id: actorId }) });
  if (!response.ok) throw httpError(503, 'session_revocation_unavailable');
}
export async function changeSchoolLifecycle({ request, env, params }) {
  try {
    if (!env.DB || !env.IDENTITY || !env.EDUCATION_ISSUER_SECRET) throw httpError(503, 'lifecycle_unavailable');
    if (!(await platformAuthorized(request, env))) throw httpError(401, 'platform_authorization_required');
    const schoolId = String(params.schoolId), input = await limitedJson(request, 4096), action = String(input.action || ''), now = new Date().toISOString();
    const school = await env.DB.prepare('SELECT status FROM school_tenants WHERE id=?').bind(schoolId).first(); if (!school) throw httpError(404, 'school_not_found');
    if (action === 'suspend') {
      const members = await env.DB.prepare("SELECT actor_brasa_id AS actorId FROM school_memberships WHERE school_id=? AND status='active'").bind(schoolId).all();
      await env.DB.batch([env.DB.prepare("UPDATE school_tenants SET status='suspended',updated_at=? WHERE id=?").bind(now, schoolId), env.DB.prepare("UPDATE school_memberships SET status_before_suspension=status,status='suspended',updated_at=? WHERE school_id=? AND status='active'").bind(now, schoolId)]);
      for (const member of members.results) await revoke(env, member.actorId);
    } else if (action === 'reactivate') {
      await env.DB.batch([env.DB.prepare("UPDATE school_tenants SET status='active',updated_at=? WHERE id=? AND status='suspended'").bind(now, schoolId), env.DB.prepare("UPDATE school_memberships SET status=COALESCE(status_before_suspension,'suspended'),status_before_suspension=NULL,updated_at=? WHERE school_id=? AND status='suspended'").bind(now, schoolId)]);
    } else if (action === 'recover') {
      const adminId = String(input.adminId || '').trim().toUpperCase(); if (!/^BRA-[A-Z0-9-]{5,40}$/.test(adminId)) throw httpError(400, 'invalid_recovery');
      const admins = await env.DB.prepare("SELECT actor_brasa_id AS actorId FROM school_memberships WHERE school_id=? AND role='school_admin' AND status='active'").bind(schoolId).all();
      for (const admin of admins.results) await revoke(env, admin.actorId);
      await env.DB.batch([env.DB.prepare("UPDATE school_memberships SET status='revoked',updated_at=? WHERE school_id=? AND role='school_admin'").bind(now, schoolId), env.DB.prepare("INSERT INTO school_memberships (id,school_id,actor_brasa_id,role,status,created_at,updated_at) VALUES (?,?,?,'school_admin','active',?,?) ON CONFLICT(school_id,actor_brasa_id,role) DO UPDATE SET status='active',updated_at=excluded.updated_at").bind(crypto.randomUUID(), schoolId, adminId, now, now)]);
      const response = await env.IDENTITY.fetch('https://brasa-identity/internal/education/invitations', { method: 'POST', headers: { 'content-type': 'application/json', 'x-brasa-service-authorization': env.EDUCATION_ISSUER_SECRET }, body: JSON.stringify({ display_id: adminId, assurance_level: 2, expires_in: 3600 }) });
      if (!response.ok) throw httpError(503, 'recovery_invitation_unavailable'); const invitation = await response.json();
      await env.DB.prepare('INSERT INTO school_audit_log (id,school_id,actor_brasa_id,action,resource_type,resource_id,snapshot_json,occurred_at) VALUES (?,?,?,?,?,?,?,?)').bind(crypto.randomUUID(), schoolId, 'system:platform-operator', action, 'school', schoolId, JSON.stringify({ newAdmin: adminId }), now).run();
      return json({ data: { schoolId, status: school.status, action, adminId, invitationCode: invitation.invitation_code, expiresAt: invitation.expires_at } });
    } else throw httpError(400, 'invalid_lifecycle_action');
    await env.DB.prepare('INSERT INTO school_audit_log (id,school_id,actor_brasa_id,action,resource_type,resource_id,snapshot_json,occurred_at) VALUES (?,?,?,?,?,?,?,?)').bind(crypto.randomUUID(), schoolId, 'system:platform-operator', action, 'school', schoolId, '{}', now).run();
    return json({ data: { schoolId, status: action === 'suspend' ? 'suspended' : 'active', action } });
  } catch (error) { return failure(error); }
}
