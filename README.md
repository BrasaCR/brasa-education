# BRASA Education — `brasa.education`

**The First Free World School — Education surface.**
The web face of how BRASA educates and certifies citizens: a discovery layer over the world's free educational commons, plus a route into the BRASA Standard credential.

---

## What BRASA Education is

Knowledge has been free for fifteen years; the document that proves a citizen learned it has not. BRASA closes that gap from both ends.

- **Educate.** BRASA is the discovery-and-delivery layer for the world's existing free educational commons (Khan Academy, MIT OpenCourseWare, edX, Coursera, Class Central, and more). It routes each citizen to the best free provider for their need and produces native content only where no provider serves them (CR indigenous languages, CR civic and SINPE literacy, the Ortiz-Naranjo track, the BRASA operating manual). **This site is the public, browsable face of that directory.**
- **Certify.** BRASA issues its own credentials under the **BRASA Standard** — published, contestable, engineered to be twice as rigorous as any cartel equivalent: AI-augmented learning, human-controlled assessment, every credential signed and verifiable in real time on the OpenLedger.

The full architecture is documented in `BRASA_Educate_and_Certify.docx`.

---

## The site

Three self-contained, single-file pages (inline CSS + JS), Cloudflare Pages, BRASA design tokens (Fraunces + Geist, cream palette). Keep them in the same folder so relative links resolve.

| File | What it is |
|------|------------|
| `index.html` | The education front page. The Class Central Curriculum, school bands, and the two subject gateways. |
| `universities.html` | Hash-routed browser of every university, by continent. |
| `career-certificates.html` | Curated career-credential tracks. |

### `index.html` — sections, in order
1. **Marquee Schools** — headline providers: BRASA Universal School, PhET, UN Tourism, Khan Academy, Khanmigo.
2. **Featured Schools** — *currently 5 blank placeholder tiles, pending content.*
3. **Languages** — CR-priority language tracks (Spanish, Portuguese).
4. **The Class Central Curriculum** — 27 subject tiles (Mathematics → Artificial Intelligence) routing into the Class Central catalog by subject. Includes the two gateway tiles **The Universities** → `universities.html` and **Career Certificates** → `career-certificates.html`.
5. **Schools of Costa Rica** — 8 province tiles, anchoring the global catalog to the citizen's country.

### `universities.html`
Landing = 5 continent tiles (Americas, Europe, Asia, Africa, Oceania). Click one → that continent's universities grouped by country, each a logo card linking to `classcentral.com/university/{slug}`. Inventory: **1,412 universities · 63 countries · 44,520 free courses.** 112 marquee-school logos are inlined; the rest lazy-load from R2 thumbnails.

### `career-certificates.html`
7 tiles, each opening externally: Career Certificates, Free Certificates, Coursera Plus, Personal Development, Noble Desktop, Boot.dev, Computer Science.

---

## How the routing works

Same logic everywhere: **refer to the free commons; build natively only what no one else produces.** Each tile is a contextualised deep link to the exact destination (a Class Central subject/university page, a provider, or a BRASA-native page), never a generic home page. Provider status discipline:

- **FREE** → primary referral target.
- **FREEMIUM** → referred to the free tier only (never the paid upgrade).
- **PAID** → excluded unless no free alternative and the citizen opts in.
- **BRASA NATIVE** → produced by BRASA, always free, in the citizen's language.

BRASA charges nothing and accepts no referral fees or commissions.

---

## Assets (Cloudflare R2)

Images are served from R2, **not** committed to the repo:

- `assets.brasa.world/` — `Thumbnails/`, `Photos/`, `Lessons/`, `Papers/`, `Database/`
- `images.brasa.world/Photos/` — subject/feature photos

Tile background images referenced by the site (upload these to **R2 → `Thumbnails/`**):
- `world-map-regions.jpg` — the 5 continent tiles + the "The Universities" tile
- `career-certificates.jpg` — the "Career Certificates" tile + all 7 page-2 tiles

> Rule: photos, lessons, and papers already live in R2 — never re-extract or re-upload them. Watch extension case (`.jpg` vs `.jpeg` vs `.JPG`); confirm by testing.

---

## Cross-surface navigation

Every page carries the BRASA CR bar linking the four constitutional surfaces:
**Your Business** (`brasa.business`) · **Your Education** (`index.html`) · **Your Government** (`brasagovernment.net`) · **Your BRASA** (`brasa.world`).

---

## Certification (the BRASA Standard, in brief)

- **200% commitment** — twice the rigor of the cartel equivalent on every measurable dimension.
- **AI-augmented learning** — ten capabilities solving Bloom's 2-sigma problem; AI is the *learning environment*, never the assessor.
- **Four-layer assessment** — formative AI checks → process-aware verification → controlled standardized exams → external oral defense.
- **15 approved degrees**, each specified against seven required elements (mastery domains, pathways, exams, portfolio, oral defense, stacked credentials, recertification).
- **OpenLedger verification** — every credential cryptographically signed by the BRASA CR Stiftung and verifiable in real time.

---

## Deploy notes

1. Deploy `index.html`, `universities.html`, `career-certificates.html` together on Cloudflare Pages.
2. Upload tile images to R2 `Thumbnails/` (`world-map-regions.jpg`, `career-certificates.jpg`).
3. Relative links between pages and the cross-surface nav need no build step.

---

*BRASA CR Stiftung — The First Free World School.*
*Richard Ortiz, Constitutional Founder · Rebecca Naranjo, Constitutional Architect.*

