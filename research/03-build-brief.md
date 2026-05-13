# SAMGEC — Website Build Brief

## Strategic Positioning
**SAMGEC is the 30-year regional authority for photovoltaic installation in north-west Romania, with the full ISCIR / ANRE credential stack that the new-entrant installers cannot match.**

The redesign positions PV first (per client brief), with the rest of the trade catalog as supporting depth. The brand voice shifts from "industrial contractor" → "trusted regional expert who saves you 90% on your electricity bill and handles every signature."

---

## Design Direction

### Color Palette (refined from client brand)
| Role | Hex | Use |
|------|-----|-----|
| Primary (deep) | `#0B1B2B` | Hero background, footer, dark sections |
| Primary navy | `#142A44` | Section dark variant |
| Brand navy | `#1F3A5F` | Cards, secondary surfaces (refined from existing #233D63) |
| Accent orange | `#FF6A1A` | CTAs, highlights, "sun" energy moments (refined from #FF5E13 for AA contrast on white) |
| Accent gold | `#FFB347` | Secondary highlight / sun gradient stop |
| Neutral 900 | `#0E1116` | Body text |
| Neutral 600 | `#5A6473` | Muted text |
| Neutral 200 | `#E7EBF0` | Dividers / hairlines |
| Background | `#F7F8FA` | Light section background |
| White | `#FFFFFF` | Cards on dark, primary surfaces |

Justification: deep navy + warm-orange + gold mirrors the energy-trust pairing used by Edvari (blue + steel) and Engie (blue) while keeping SAMGEC's heritage orange as the unique signature. None of the top 5 competitors use orange — this becomes our recognizable identity.

### Typography
- **Headings:** `Space Grotesk` (700) — modern geometric, less generic than Inter, premium feel. Fallback: `Inter`.
- **Body:** `Inter` (400/500) — 17px base, 1.65 line-height.
- **Numerics (kWp, %, €):** Space Grotesk in `font-feature-settings: "tnum"` for clean tabular figures.

Justification: Edvari uses Geist (Next.js default); Engie uses Lato; inoSOLAR uses Ubuntu. Space Grotesk + Inter is a more premium pairing than any competitor and reads as "tech-confident installer" rather than utility.

### Photography & Asset Style
- Real photos of rooftop installations (placeholders marked — client supplies).
- Drone overhead shot for hero.
- Close-up inverter/panel detail shots for hardware section.
- Avoid stock smiling-installer-with-hardhat photos. Prefer in-situ work shots.
- Hero illustration slot: **Nano Banana 2 placeholder for a 3D-rendered photovoltaic panel array at 16:9.**

### Animation Style
GSAP + ScrollTrigger only. Cinematic but **functional** — animation supports the narrative, never just decoration.

- **Hero:** word-by-word stagger reveal on H1, parallax depth on the 3D panel asset, slow gradient drift on background.
- **Section transitions:** clipPath reveal on heading, fade-up on body, hairline draw-in on dividers.
- **Process timeline:** progress line draws as user scrolls; each step "lights up" sequentially.
- **Numbers (90%, 30 years, 40+ engineers):** count-up on enter view.
- **Hardware grid:** subtle 3D tilt on hover, panel "lifts" off page.
- **Sticky horizontal scroll:** services panel that horizontal-scrolls on long sections.
- Always respect `prefers-reduced-motion` → all animations become instant fades.

### What to AVOID
- Carousels (slow, ignored — every top competitor has one and conversions don't reflect it).
- Cookie banner blocking the hero (EnergyFix mistake).
- Long Latin-name boilerplate (inoSOLAR's About).
- Generic stock solar panel imagery.
- Multi-column footer link soup.
- Yellow-on-white CTAs (low contrast — inoSOLAR fails AA).
- Auto-playing video.

---

## Site Architecture

| Page | URL | Purpose | Primary CTA |
|------|-----|---------|-------------|
| Home | `/` | Convert PV interest → quote request; surface full service range | "Solicită ofertă fotovoltaice" |
| Panouri fotovoltaice | `/panouri-fotovoltaice/` | **Primary SEO page.** Deep PV content + price simulator stub | "Calculează economiile" |
| Casa Verde AFM | `/casa-verde/` | AFM subsidy explainer + dossier service | "Verifică eligibilitatea" |
| Servicii | `/servicii/` | Index of all trades (HVAC, electrice, gaze, etc.) | "Solicită ofertă" |
| Despre | `/despre/` | 30-year story + team + authorizations | "Vorbește cu un specialist" |
| Proiecte | `/proiecte/` | Case studies (residential, institutional, industrial) | "Vrem și noi un proiect ca acesta" |
| Contact | `/contact/` | Form + map + phone/WhatsApp | (form submit) |

For v1 build I'll deliver the **Home + Panouri Fotovoltaice + Casa Verde + Despre + Contact** as full HTML, with `/servicii/` and `/proiecte/` as solid stubs to be extended later (this matches the scope of a 12K build without slipping into an agency-scale engagement).

### Navigation
Top nav (sticky, transparent on hero, solid on scroll):
`Acasă · Panouri fotovoltaice · Casa Verde · Servicii · Despre · Contact · [Solicită ofertă →]`

Mobile: hamburger → full-screen overlay nav with staggered link reveal.

### Footer
Three columns: Soluții (services), Companie (about/authorizations/projects), Contact (address, phone, email, WhatsApp, Google Maps, Facebook). Trust strip with ISO + ISCIR + ANRE + AFM badges. © 2026 Samgec SRL.

---

## Content Framework

### Homepage H1 — 3 options
1. **"Reduce factura de energie cu până la 90%. Sistem fotovoltaic instalat de SAMGEC — partener autorizat ANRE și AFM Casa Verde."** *(recommended — quantified outcome + authority anchor)*
2. **"Lumina soarelui. Convertită în independență energetică. De 30 de ani, din Satu Mare."** *(brand-narrative angle)*
3. **"Panouri fotovoltaice cu dosar ANRE inclus. Tu te bucuri de economii — noi facem toate hârtiile."** *(friction-removal angle)*

### Value Prop Structure (homepage)
1. **Hero promise:** quantified bill reduction + AFM partner.
2. **Trust strip:** 30 ani · 40+ specialiști · ISO 9001 · ANRE · ISCIR · AFM agreat.
3. **The wedge:** "Tu te bucuri de soare, noi facem dosarul prosumator." (3-card row).
4. **Hardware we use:** Longi · Canadian Solar · Jinko N-Type · Huawei · Deye · JA Solar.
5. **Process timeline:** 8 steps from consultanță → punere în funcțiune.
6. **Sistem typical examples:** 3 cards (3 kWp casă mică, 6 kWp casă medie, 10+ kWp casă mare/firmă) with annual production + economy.
7. **Beyond PV:** carousel/grid of other services SAMGEC offers.
8. **Authorizations:** the full ISCIR / ANRE / ISO / ATSI badge wall.
9. **About:** 30 years, 40+ engineers, Satu Mare anchor.
10. **Contact form / map.**

### SEO Keyword Targets
Primary cluster (high commercial intent):
- `panouri fotovoltaice Satu Mare`
- `instalare panouri fotovoltaice Satu Mare`
- `sistem fotovoltaic Satu Mare`
- `panouri solare Satu Mare`
- `firma panouri fotovoltaice Satu Mare`
- `Casa Verde fotovoltaice Satu Mare`
- `prosumator Satu Mare ANRE`

Secondary cluster (informational):
- `cât costă panouri fotovoltaice`
- `cum devin prosumator`
- `dosar prosumator ANRE`
- `subvenție Casa Verde 2026`
- `panouri fotovoltaice pentru casă`

Regional expansion:
- Repeat above for Baia Mare, Oradea, Carei, Negrești-Oaș, Cluj.

Implementation: target each via a single, well-structured page (no doorway pages); use H1 + 1×H2 + intro paragraph carrying the target keyword + LocalBusiness schema with `address.addressLocality: Satu Mare`.

---

## Conversion Playbook

- **Primary goal:** lead form submission for a PV quote.
- **Secondary goal:** phone call (tel: link) or WhatsApp tap.
- **Lead capture:** lightweight 4-field form (Nume, Telefon, Județ select, Tip interes) — no email required initially to lower friction. Full email captured in step 2 after callback.
- **Social proof plan:**
  - 3 anonymized customer quotes ("Florin, Satu Mare — 6 kWp, economie 1.400 €/an").
  - Authorization badge row (ISCIR, ANRE, AFM, ISO 9001 — all currently held).
  - "Since 1994" badge.
  - Inline trust strip near every CTA.
- **Trust signal checklist:**
  - [x] Phone visible in header (sticky)
  - [x] Address + map on contact page
  - [x] CUI / J-number in footer
  - [x] AFM Casa Verde agreed-installer badge
  - [x] ANRE + ISCIR badges
  - [x] HTTPS / valid TLS (operational, not a build deliverable)
  - [x] Google Business Profile linked in footer
