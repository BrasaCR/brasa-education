# BRASA Education completion workflow

Updated: 2026-10-14

This workflow converts the ten improvement goals into release gates. A gate is complete only when its evidence exists; a design or aspiration never counts as production completion.

## Gate 1 — Route integrity

- Country homepages render through the shared reviewed shell.
- Every relative country-page destination resolves to a root asset.
- A route manifest enumerates every public destination.
- Automated tests fail on a missing file, fragment, unsafe URL, or country-route mismatch.

Evidence: `scripts/audit-public-routes.mjs`, `test/routes.test.mjs`, Worker route tests.

## Gate 2 — Catalog truth

- Every public number has a source URL, definition, review date, and owner.
- Aggregated-provider statistics are attributed to the provider.
- Unsupported numbers are removed rather than estimated.
- A public methodology page explains what BRASA hosts and what it only indexes.

Evidence: `catalog-statistics.json`, `catalog-methodology.html`, catalog-statistics tests.

## Gate 3 — Costa Rica reference pack

- Country pack declares controlling authorities, curricula, school directories, qualification authorities, privacy/safeguarding sources, languages, review dates, and coverage gaps.
- No category can be marked complete without an official source and human reviewer.
- External resources remain supplemental and cannot silently replace official requirements.

Evidence: `costa-rica-education-pack.json`, country-pack validation tests.

## Gate 4 — End-to-end learning pathway

- Learner selects a goal and begins an assigned lesson.
- Lesson includes objectives, instruction, practice and assessment.
- Submission records source and evidence.
- Teacher review is a separate authorized decision.
- Portable evidence can be exported without overstating recognition.

Evidence: `learning-pathway.html`, pathway schema, API/database tests and export fixture.

## Gate 5 — Goal-led discovery

- Search begins with the learner's goal, not provider branding.
- Filters cover stage, subject, language, cost, provider, credential, country relevance, accessibility and offline suitability.
- Empty and no-result states explain how to adjust filters.

Evidence: `global-education-catalog.html`, `education-resource-catalog.json`, search tests.

## Gate 6 — Portable credentials and interoperability

- BRASA uses an Open Badges-compatible internal model without claiming 1EdTech certification.
- Issuer authority, achievement criteria, evidence, recipient, issue date and revocation status are explicit.
- OneRoster and LTI are documented adapter boundaries, not implied integrations.
- Certification claims remain prohibited until 1EdTech certification is complete.

Evidence: `credentials-and-interoperability.html`, `contracts/open-badge-profile.v1.json`, conformance tests.

## Gate 7 — Inclusive production quality

- Automated checks cover landmarks, labels, keyboard access, contrast tokens, reduced motion, responsive breakpoints and offline assets.
- Pages remain usable on narrow screens and degraded connections.
- A service worker caches only reviewed public learning assets; private records are never cached.

Evidence: `manifest.webmanifest`, `education-sw.js`, accessibility and offline tests.

## Gate 8 — Governed institutional pilot

- A named institution signs the pilot charter.
- Safeguarding, privacy, incident, support and withdrawal owners are named.
- Baseline and outcome measures are agreed before learner enrollment.
- Only consented participants and approved content enter the pilot.
- Results include adverse events, missing data and teacher workload—not only successes.

Evidence: `GOVERNED_PILOT_PACKET.md` plus signed external records. **External participation is required; code cannot close this gate.**

## Gate 9 — Authorizing partnerships

- Institution identity and signing authority are verified.
- Partnership scope distinguishes content, instruction, assessment, credential authorization and recognition.
- Public claims are restricted to signed scope and effective dates.

Evidence: `INSTITUTIONAL_PARTNERSHIP_PACKET.md` plus executed agreements. **External authorization is required; BRASA cannot self-authorize this gate.**

## Gate 10 — Resource transparency

- Every displayed resource exposes source, provider, review date, language, cost, credential status, curriculum relevance, accessibility and offline status.
- Stale or unreviewed records remain visibly labeled.
- Link health and material changes trigger re-review.

Evidence: governed catalog schema, rendered metadata cards, validation and link-review queue.

## Release sequence

1. Gates 1–3 establish truth and jurisdiction.
2. Gates 4–6 establish the learning and evidence model.
3. Gate 7 establishes technical readiness.
4. Gates 8–9 require real-world partners and may begin only after the earlier gates pass.
5. Gate 10 is continuous and blocks publication of incomplete resource records.

No pilot, credential, accreditation, partnership or outcome may be described as complete until its external evidence is attached and independently reviewable.
