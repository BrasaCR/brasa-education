BRASA Education — brasa.education

The free education gateway of the BRASA federation: the First Free World School, delivered to any
citizen on any phone, in any language, at no cost. This README documents the brasa.education surface —
its pages, how they fit together, what they depend on, and how to deploy them.


Doctrine (non-negotiable)


Education is free — $0 to the learner, now and always. It is constitutional, not commercial.
None of the education side touches money. The $99/year citizen contribution lives only on
brasa.business. Nothing on this surface charges, collects, or routes anything to the Swiss Stiftung.
Identity = phone + date of birth. Together they are the citizen's BRASA ID (stored only as a
one-way hash, never in plaintext). Display IDs look like BRA-XXXXX-XXXXX-C.
Enrollment mints an identity, nothing more. "Start my Free Education" creates the BRASA ID and
opens the catalog. There is no payment step anywhere on this surface.





1. What's in this surface

FileRoleindex.htmlThe education gateway (hero, 4-pillar federation, featured grid, subjects, full catalog, Schools of CR, search). Delivered in this output set as education-index.html — rename to index.html on deploy.how-to-begin.htmlHow to start — hero + description + the Free Education signup card.how-this-works.htmlHow this works — hero + description + a WhatsApp / USSD card.how-you-pick.htmlHow you pick what to learn — hero + description (BRASA Standard, the two degree paths, free-certificate links).how-you-earn.htmlHow you earn a degree/certificate — hero + description (summary of the Living Diploma).what-you-can-do.htmlWhat you can do with this degree/certificate — hero + description (summary of the Hiring report).why-this-is-different.htmlWhy this is different — hero + description (summary of the Why-Different report).brasa-join-config.jsShared config: sets window.BRASA_JOIN_API (the signup Worker base URL). Required at the root.

All seven HTML pages plus brasa-join-config.js deploy to the brasa.education root. Image assets
live in R2 (see §4).


2. The featured grid — six tiles

index.html contains a "How to…" featured grid. Each tile links to one page above and uses one hero image
from R2 (assets.brasa.world/Thumbnails/):

TilePageHero imageHow to starthow-to-begin.htmlrunning-track.jpgHow this workshow-this-works.htmlstart-devices.jpgHow you pick what to learnhow-you-pick.htmlchecklist-steps.jpgHow you earn a degree/certificatehow-you-earn.htmlcertificate-scroll.jpgWhat you can do with this degree/certificatewhat-you-can-do.htmlcareer-interview.jpgWhy this is differentwhy-this-is-different.htmldiamond-coal.jpg

Every page reuses the same shell as index.html (header, fonts, palette, footer) so the surface is seamless.


3. The signup flow (free enrollment)

Only how-to-begin.html is interactive. Its card collects Full Name / Phone Number / Date of Birth
and the button reads "Start my Free Education."

[Full Name] [Phone] [Date of Birth]
        │
        ▼  POST {BRASA_JOIN_API}/trial/start   { name, phone, dob }
        │
        ▼  → mints the BRASA ID (display_id), status = trial
        │
   "Welcome, citizen." + BRASA ID + "Open the catalog"


It reads window.BRASA_JOIN_API from brasa-join-config.js, falling back to
https://brasa-signup.richard-bad.workers.dev if the config file is missing.
It never calls /trial/activate, never shows SINPE, never references $99 or the Swiss split.
Education is free, so the flow ends at enrollment.
The citizen is created with status trial. Because nothing ever activates it, this is simply the
resting state of a free-education citizen — it never converts and no money moves.
JOIN_CODE exists in the config but is not used on this surface (it belongs to the business
contribution flow). Only BRASA_JOIN_API matters here.



4. Dependencies

R2 assets — assets.brasa.world


Thumbnails/ — the six hero images listed in §2, plus the thumbnails the index grid lazy-loads.
Photos/brasa-cr-logo_8.png — the wordmark and footer mark.
The index hero pulls from images.brasa.world/Photos/… (the Earth/citizens image).


Backend — the signup Worker


https://brasa-signup.richard-bad.workers.dev — only /trial/start is used by this surface.


Shared config


brasa-join-config.js must sit at the brasa.education root. Pages fall back safely if it's absent,
so the surface won't break — but upload it so the Worker URL is configured in one place.



5. Configuration — values to fill in

WherePlaceholderFill withhow-this-works.html (near bottom)WHATSAPP_NUMBER = "506XXXXXXXX"BRASA WhatsApp Business number, digits only, with country codehow-this-works.html (near bottom)USSD_CODE = "*XXX#"the provisioned Africa's Talking USSD short codeR2 Thumbnails/diamond-coal.jpgupload the supplied 2400×1200 image under exactly this name (the "Why this is different" tile + hero reference it)

Until filled, the WhatsApp button points at a placeholder number and the USSD line shows *XXX#.
(The USSD code depends on Africa's Talking provisioning, which is gated on Meta Business verification.)


6. Deploy checklist


Rename education-index.html → index.html.
Upload to the brasa.education root:
index.html, how-to-begin.html, how-this-works.html, how-you-pick.html,
how-you-earn.html, what-you-can-do.html, why-this-is-different.html, brasa-join-config.js.
Upload diamond-coal.jpg to R2 Thumbnails/.
Fill WHATSAPP_NUMBER and USSD_CODE in how-this-works.html (optional; safe to launch with placeholders).
Confirm the signup Worker /trial/start is reachable (it powers "Start my Free Education").



7. Design system

Tokens (defined in index.html, reused by every page)

TokenValueUse--brasa-black#1B1A17ink / primary text--brasa-soft#6B6862secondary text--brasa-accent#8C3A1Faccent, links, buttons--brasa-green#0D6E5Csuccess state (e.g. "enrolled")--brasa-callout#F2EDE0soft callout fills--brasa-page#FBF9F4page background--brasa-cream#F5F0E5light text on dark

Fonts — Fraunces (serif, headings) · Geist (sans, body).

Page template — every subpage follows the same simple shape:

header (nav → index.html#… ; "Become a citizen" → how-to-begin.html#join)
hero    (full-bleed Thumbnails image + identity + tagline)
section (band-eyebrow + section-h + lede-text, with optional .path-lead bold leads)
[optional single card]
footer
<script> header-scroll toggle (+ page-specific wiring)

Keep new pages to hero + brief description (plus at most one card). No extra sections, CTAs, or
buttons unless explicitly requested.


8. Related documents

Three companion Word reports back the summary pages (not deployed to the site; reference material):


BRASA_Living_Diploma.docx — the citizen-owned, QR-verifiable living credential (backs how-you-earn.html).
BRASA_Hiring_Report.docx — how companies hire and how a BRASA degree changes it (backs what-you-can-do.html).
BRASA_Why_Different.docx — how education is handled now, why, for how long, and why BRASA differs (backs why-this-is-different.html).
