# Powered by BRASA school platform

Each school is a tenant with its own membership boundary. GovID authenticates a person, while Education authorizes that person against an active school membership; identity claims alone never grant access. Administrators and teachers may create draft lessons only for their routed school. Only published lessons are public and offline-eligible.

`GET /api/v1/schools/:schoolId/lessons?locale=en` returns published lessons without memberships, actor IDs, audit records, drafts, or learner data. `POST` requires a GovID bearer session plus an active matching-school administrator or teacher membership and creates an append-only audit record.

Learner progress, grading, guardian consent, and retention are deliberately outside this migration until their consent and deletion policies are defined.

The manual `Deploy staging` workflow targets only `brasa-education-staging` and its dedicated D1 database, applies additive migrations, deploys, and requires a seeded `STAGING_SCHOOL_ID` for smoke testing. Its `IDENTITY` service binding targets only `brasa-identity-staging`; Education still owns the school-membership authorization decision after identity introspection. Production bindings must never be used for this check.

`ops/staging-seed.sql` is an idempotent, non-personal smoke fixture for the preview database only. The expected workflow variable is `STAGING_SCHOOL_ID=contract-test-school`.

`school-admin.html` is a low-bandwidth, keyboard-accessible preview interface. It exchanges a single-use invitation through same-origin Education routes, keeps the opaque access token only in page memory, rotates near expiry, creates tenant-bound drafts, and revokes on explicit logout. Tokens are never placed in URLs or persistent browser storage.

After opening an authorized school, administrators can manage bounded team roles and access states, view private lesson workflow data, and move lessons into review, published, or archived states. Curriculum reviewers may change lesson status but cannot manage memberships. Every membership and status mutation writes a school-scoped audit record.

Invitation creation requires a verified school administrator and crosses the Education-to-Identity service binding with a shared Worker secret. Identity compares that credential before generating the invitation, stores only its hash, and returns the raw code once. The secret is configured with Wrangler and is never committed, logged, returned to the browser, or placed in a public Worker variable.

`POST /internal/v1/schools` replaces manual database onboarding. It requires a separate platform-operator secret and atomically creates the tenant, supported-language settings, first administrator membership, and audit event before requesting a one-time first-administrator invitation from Identity. The invitation is returned once. Operator and service credentials are separate, and neither belongs in browser code or version control.

School administrators can update presentation settings through `POST /api/v1/schools/:schoolId/settings`: school name, one to twelve supported language tags, default language, six-digit brand color, optional HTTPS support URL, and public-profile visibility. Tenant status, ownership recovery, and suspension are deliberately excluded from this school-admin route and remain platform responsibilities.

Platform operators use `POST /internal/v1/schools/:schoolId/lifecycle` for suspension, reactivation, and ownership recovery. Suspension remembers which memberships were active, suspends them, and revokes their Education sessions through Identity. Reactivation restores only memberships suspended by that operation. Recovery revokes every active administrator session and membership, appoints the replacement, records an audit event, and returns a one-hour invitation once.
