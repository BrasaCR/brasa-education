# Powered by BRASA school platform

Each school is a tenant with its own membership boundary. GovID authenticates a person, while Education authorizes that person against an active school membership; identity claims alone never grant access. Administrators and teachers may create draft lessons only for their routed school. Only published lessons are public and offline-eligible.

`GET /api/v1/schools/:schoolId/lessons?locale=en` returns published lessons without memberships, actor IDs, audit records, drafts, or learner data. `POST` requires a GovID bearer session plus an active matching-school administrator or teacher membership and creates an append-only audit record.

Learner progress, grading, guardian consent, and retention are deliberately outside this migration until their consent and deletion policies are defined.
