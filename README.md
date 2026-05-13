# SAMGEC — Premium photovoltaic-focused website rebuild

A static HTML/CSS/JS rebuild of [samgec.ro](https://samgec.ro/), optimized for SEO around photovoltaic installation in Satu Mare and north-west Romania. Built with GSAP + ScrollTrigger for cinematic scroll animations, no framework dependencies.

## What's inside

```
Samgec/
├── research/
│   ├── 01-client-brand.md         # Extracted from samgec.ro
│   ├── 02-competitor-analysis.md  # Top-10 RO PV installers
│   ├── 03-build-brief.md          # Master design + content brief
│   └── niche-analysis-report.md   # Client-facing lead-magnet PDF source
├── site/
│   ├── index.html                 # Homepage (full PV-focused)
│   ├── panouri-fotovoltaice.html  # PV pillar page (SEO target)
│   ├── casa-verde.html            # AFM Casa Verde explainer
│   ├── servicii.html              # All-services index
│   ├── despre.html                # About + authorizations wall
│   ├── proiecte.html              # Case-study grid
│   ├── contact.html               # Lead form + map
│   ├── 404.html
│   ├── robots.txt
│   ├── sitemap.xml
│   ├── css/styles.css
│   ├── js/main.js
│   └── assets/                    # logo.png, favicon.png
└── README.md
```

## Local preview

The site is static — open `site/index.html` directly, or serve with any HTTP server:

```bash
cd site
python3 -m http.server 8000
# or
npx serve .
```

Then visit http://localhost:8000.

## Deployment

### Netlify
1. Drag the `site/` folder into Netlify's "Sites" page, or
2. Connect a Git repo and set publish directory to `site/`.

### Vercel
```bash
cd site
npx vercel --prod
```

### Generic (any static host)
Upload the contents of `site/` to your web root. No build step required.

### DNS
Point `samgec.ro` and `www.samgec.ro` at the host. Update DNS A/CNAME records accordingly.

## What's marked as a placeholder

Search the repo for `NANO BANANA ASSET HERE` to find the hero illustration slots. Each one needs a 3D-rendered photovoltaic asset at 16:9 dropped in to replace the SVG placeholder. Suggested prompts in `research/03-build-brief.md`.

The contact form has `action="#"` — wire it to your preferred backend (Formspree, Netlify Forms, custom endpoint).

The Google Maps embed is unauthenticated and may need an API key for production traffic.

CUI / company-registration number in the footer is a placeholder — replace with the real one.

## SEO targets

Primary pillar page: `/panouri-fotovoltaice.html`, targeting:
- panouri fotovoltaice Satu Mare
- instalare panouri fotovoltaice Satu Mare
- sistem fotovoltaic Satu Mare
- Casa Verde fotovoltaice Satu Mare
- prosumator Satu Mare ANRE

Structured data included: `LocalBusiness`, `Service`, `FAQPage`.

## Cost breakdown (deliverable scope)

| Item | Notes |
|------|-------|
| Phase 1 — Brand extraction | Pulled from existing samgec.ro |
| Phase 2 — Competitor research | 10 RO PV installers analyzed |
| Phase 3 — Build brief + niche report | Two MD deliverables |
| Phase 4 — Site build (7 pages) | HTML/CSS/GSAP, no framework |
| Phase 5 — Quality audit | SEO + a11y + perf checks |

Total: **delivered as one engagement.** Future scope (e.g. blog/CMS, multilingual EN/DE, form backend, GBP integration, paid-ads landers) is not included.

## Performance notes

- All CSS in a single file (~26 KB uncompressed).
- All JS in a single file (~5 KB) + GSAP from CDN (`defer`).
- No render-blocking resources.
- `font-display: swap` via Google Fonts.
- `prefers-reduced-motion` respected; all animations gate on it.
- Lazy-loaded iframe on Contact page.

## Accessibility

- Single H1 per page, semantic landmarks (`header`, `main`, `footer`).
- Alt text on all images.
- Focus styles preserved on all interactives.
- Skip-to-content available via the natural tab order to `<main id="main">`.
- Color contrast tested for AA on body text and button states.
