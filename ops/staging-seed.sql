-- Non-production smoke fixture. Never execute against a production database.
INSERT OR IGNORE INTO school_tenants (id, slug, name, country_code, default_locale, status, public_profile, created_at, updated_at)
VALUES ('contract-test-school', 'contract-test-school', 'BRASA Staging School', 'CR', 'en', 'active', 1, '2026-09-11T00:00:00.000Z', '2026-09-11T00:00:00.000Z');

INSERT OR IGNORE INTO school_lessons (id, school_id, slug, locale, title, summary, body_json, accessibility_json, offline_eligible, status, created_by, updated_by, published_at, created_at, updated_at)
VALUES ('contract-test-lesson', 'contract-test-school', 'welcome-to-brasa', 'en', 'Welcome to BRASA', 'A non-production lesson used to verify the public staging contract.', '{"blocks":[{"type":"paragraph","text":"Staging systems are ready."}]}', '{"language":"en","plainLanguage":true}', 1, 'published', 'system:staging-seed', 'system:staging-seed', '2026-09-11T00:00:00.000Z', '2026-09-11T00:00:00.000Z', '2026-09-11T00:00:00.000Z');

INSERT OR IGNORE INTO school_memberships (id, school_id, actor_brasa_id, role, status, created_at, updated_at)
VALUES ('contract-test-membership', 'contract-test-school', 'BRA-STAGING-TEACHER', 'teacher', 'active', '2026-09-11T00:00:00.000Z', '2026-09-11T00:00:00.000Z');
