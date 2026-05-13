# Phase 5b — SEO + AEO (AI Search) Audit

Audit date: 12 May 2026. Scope: all 7 built pages + `robots.txt`, `sitemap.xml`, `llms.txt`.

## Executive summary
- Site was already strong on traditional SEO (titles, H1s, canonicals, LocalBusiness/Service/FAQPage schema on the home + PV pillar).
- Three AEO gaps closed in this pass: `llms.txt` added, AI crawlers explicitly allow-listed in `robots.txt`, schema added to the remaining 4 pages.
- The homepage title was 71 chars (above the 60-char Google truncation point) and is now 53 chars.

## Traditional SEO findings (post-fix)

| Page | Title len | H1 keyword aligned | Schema blocks |
|------|-----------|--------------------|---------------|
| index.html | 53 ✓ | Panouri fotovoltaice + instalații (root) | LocalBusiness |
| panouri-fotovoltaice.html | 60 ✓ | Sistem fotovoltaic + dosar prosumator | Service |
| casa-verde.html | 55 ✓ | 20.000 lei subvenție AFM | BreadcrumbList · Service · FAQPage |
| despre.html | 52 ✓ | 30 ani Satu Mare | BreadcrumbList · AboutPage · Organization (full credential list) |
| contact.html | 57 ✓ | Calcul pentru casa ta | BreadcrumbList · ContactPage · LocalBusiness (with openingHours + contactPoint) |
| proiecte.html | 37 ✓ | 500+ proiecte 30 ani | BreadcrumbList · CollectionPage · ItemList (5 projects) |
| 404.html | 32 ✓ | noindex | (intentionally none) |

## AEO (AI Search Optimization) findings

### llms.txt — DEPLOYED
- File: `site/llms.txt` (6.7 KB)
- Structure: brand identity → core pages → services list → authorizations → canonical FAQ answers → press/social → contact
- Referenced in `sitemap.xml` at priority 0.5

### Robots.txt — AI bots explicitly allowed
Added explicit `Allow: /` for: GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-Web, anthropic-ai, PerplexityBot, Perplexity-User, GoogleOther, Google-Extended, CCBot, Bytespider, Applebot-Extended, meta-externalagent, DuckDuckBot. (Wildcard remains for everything else.)

### Schema coverage — 100% of indexable pages
All non-404 pages now ship JSON-LD. Two layered patterns used:
- `@graph` containers on sub-pages so Breadcrumb + page-type + entity travel together.
- Separate `<script>` blocks on home (LocalBusiness, FAQPage) and PV pillar (Service) to keep the existing single-purpose blocks intact.

### Entity authority signals
- `Organization` on despre.html lists 7 `EducationalOccupationalCredential` entries (ANRE, ISCIR, ISO, AFM, …).
- `LocalBusiness` on home + contact share the same `@id` (`https://samgec.ro/#org`) so AI crawlers can resolve them as the same entity.
- `areaServed` declared on every service-bearing page (Satu Mare, Maramureș, Bihor, Cluj).

## What's still on the to-do list (not blocking)

1. **HowTo schema on the PV pillar process timeline** — would unlock "step-by-step" rich results for `cum se instaleaza panouri fotovoltaice`. ~20 min of work.
2. **DefinedTerm schema for a glossary page** — entries like `prosumator`, `racordare`, `Casa Verde`, `ANRE`, `ISCIR` boost topical authority. Requires a new `/glosar.html`.
3. **Article schema on a blog/resources section** — the current build has no blog. Adding one would let SAMGEC compete with kilowat.ro and macosolar.ro on informational queries.
4. **Submit the site to Bing Webmaster Tools** when it goes live — Bing's index powers ChatGPT and Copilot.
5. **Original research / dataset** — e.g., a Satu Mare-specific PV production calculator with `Dataset` schema. High-effort, very high payoff for AEO.

## AI Visibility test plan (post-launch)

Run these queries one week after launch in ChatGPT, Perplexity, Google AI Overviews, Claude, Copilot:

1. `firma panouri fotovoltaice Satu Mare`
2. `Casa Verde fotovoltaice instalator Satu Mare`
3. `instalator AFM Casa Verde nord-vest Romania`
4. `SAMGEC SRL` (brand recall)
5. `cum instalez panouri fotovoltaice in Satu Mare`

Score per platform: 3 = cited with link, 2 = mentioned in answer, 1 = competitor cited, 0 = absent. Baseline now → 90-day target.

## Files added/modified in this audit

| Path | Action | Purpose |
|------|--------|---------|
| `site/llms.txt` | created | AEO machine-readable site map |
| `site/robots.txt` | rewritten | Explicit AI-bot allow-list |
| `site/sitemap.xml` | edited | Added llms.txt entry |
| `site/index.html` | edited | Title shortened to 53 chars |
| `site/casa-verde.html` | edited | + Breadcrumb · Service · FAQPage schema |
| `site/despre.html` | edited | + Breadcrumb · AboutPage · Organization (credentials) |
| `site/contact.html` | edited | + Breadcrumb · ContactPage · LocalBusiness (hours, contactPoints) |
| `site/proiecte.html` | edited | + Breadcrumb · CollectionPage · ItemList |

**Audit result: site is now AEO-ready.**
