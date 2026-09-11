import { failure, httpError, json, limitedJson } from './_lib/http.js';

async function authorized(request, env) {
  const supplied = request.headers.get('x-brasa-platform-authorization') || '', expected = env.PLATFORM_OPERATOR_SECRET || '';
  if (supplied.length < 32 || expected.length < 32 || supplied.length !== expected.length) return false;
  const encoder = new TextEncoder(), left = encoder.encode(supplied), right = encoder.encode(expected);
  if (typeof crypto.subtle.timingSafeEqual === 'function') return crypto.subtle.timingSafeEqual(left, right);
  let difference = 0; for (let index = 0; index < left.length; index += 1) difference |= left[index] ^ right[index];
  return difference === 0;
}
const text = (value, maximum) => { const result = String(value || '').trim(); if (!result || result.length > maximum) throw httpError(400, 'invalid_school'); return result; };

export async function onboardSchool({ request, env }) {
  try {
    if (!env.DB || !env.IDENTITY || !env.EDUCATION_ISSUER_SECRET) throw httpError(503, 'onboarding_unavailable');
    if (!(await authorized(request, env))) throw httpError(401, 'platform_authorization_required');
    const input = await limitedJson(request, 8192), id = text(input.id, 80).toLowerCase(), slug = text(input.slug, 80).toLowerCase();
    const name = text(input.name, 160), countryCode = text(input.countryCode, 2).toUpperCase(), adminId = text(input.adminId, 48).toUpperCase();
    const defaultLocale = String(input.defaultLocale || 'en'), locales = [...new Set(Array.isArray(input.supportedLocales) ? input.supportedLocales : [defaultLocale])];
    if (!/^[a-z0-9][a-z0-9_-]{0,79}$/.test(id) || !/^[a-z0-9][a-z0-9-]{0,79}$/.test(slug) || !/^[A-Z]{2}$/.test(countryCode) || !/^BRA-[A-Z0-9-]{5,40}$/.test(adminId) || !locales.includes(defaultLocale) || locales.length > 12 || locales.some(locale => !/^[a-z]{2,3}(?:-[A-Za-z0-9]+)*$/.test(locale))) throw httpError(400, 'invalid_school');
    const now = new Date().toISOString();
    await env.DB.batch([
      env.DB.prepare('INSERT INTO school_tenants (id, slug, name, country_code, default_locale, status, public_profile, created_at, updated_at, supported_locales_json) VALUES (?,?,?,?,?,\'active\',1,?,?,?)').bind(id, slug, name, countryCode, defaultLocale, now, now, JSON.stringify(locales)),
      env.DB.prepare("INSERT INTO school_memberships (id, school_id, actor_brasa_id, role, status, created_at, updated_at) VALUES (?,?,?,'school_admin','active',?,?)").bind(crypto.randomUUID(), id, adminId, now, now),
      env.DB.prepare('INSERT INTO school_audit_log (id, school_id, actor_brasa_id, action, resource_type, resource_id, snapshot_json, occurred_at) VALUES (?,?,?,?,?,?,?,?)').bind(crypto.randomUUID(), id, 'system:platform-operator', 'school_onboard', 'school', id, JSON.stringify({ slug, name, countryCode, defaultLocale, supportedLocales: locales, firstAdmin: adminId }), now)
    ]);
    const response = await env.IDENTITY.fetch('https://brasa-identity/internal/education/invitations', { method: 'POST', headers: { 'content-type': 'application/json', 'x-brasa-service-authorization': env.EDUCATION_ISSUER_SECRET }, body: JSON.stringify({ display_id: adminId, assurance_level: 2, expires_in: 86400 }) });
    if (!response.ok) throw httpError(503, 'onboarding_invitation_unavailable');
    const invitation = await response.json();
    return json({ data: { id, slug, name, countryCode, defaultLocale, supportedLocales: locales, firstAdmin: adminId, invitationCode: invitation.invitation_code, expiresAt: invitation.expires_at } }, 201);
  } catch (error) { return failure(error); }
}
