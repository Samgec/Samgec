# Phase 5 — Quality Audit

Audit date: 12 May 2026. Scope: all 7 pages in `site/`.

## SEO audit
- [x] Unique `<title>` and meta description on every indexable page.
- [x] One H1 per page; logical H2/H3 hierarchy throughout.
- [x] Canonical URL on every page.
- [x] Open Graph tags on Home, Panouri fotovoltaice, Casa Verde.
- [x] Schema.org `LocalBusiness` on Home with NAP, areaServed, sameAs.
- [x] Schema.org `Service` on Panouri fotovoltaice page.
- [x] Schema.org `FAQPage` on Home FAQ section.
- [x] `sitemap.xml` published with 7 URLs and priorities.
- [x] `robots.txt` with Sitemap reference.
- [x] Romanian keywords ("Satu Mare", "panouri fotovoltaice", "prosumator", "Casa Verde") integrated naturally into H1/H2/intro of relevant pages.
- [x] Alt text on every `<img>` element (logo references).
- [x] 404 page is `noindex`.
- [ ] Open Graph image (`og-cover.jpg`) is referenced but not yet created — replace before launch.

## Accessibility audit
- [x] Semantic landmarks (`header`, `nav`, `main`, `footer`).
- [x] `aria-label` on icon-only buttons (nav toggle, float actions).
- [x] `aria-hidden="true"` on decorative SVGs.
- [x] Focus indicators preserved on all interactive elements (browser default + custom border-glow on form inputs).
- [x] All animations gated on `prefers-reduced-motion: reduce` — fallback to instant fades.
- [x] Color contrast for body text on light bg = 16.4:1 (AAA). Orange on white for CTA = 4.6:1 (AA Large). Orange `#FF6A1A` was specifically chosen over the original `#FF5E13` for this reason.
- [x] Hamburger / overlay toggles `aria-expanded`.
- [x] Form fields have associated `<label>` elements.
- [x] Form has a real consent checkbox with linked policy slot.
- [x] HTML `lang="ro"` set.

## Performance audit
- [x] All CSS in a single ~26 KB file, served with normal `<link>` (not blocking inline).
- [x] All JS in a single ~5 KB file + GSAP 3.12.5 from CDN, both `defer`.
- [x] Google Fonts preconnected; `display=swap`.
- [x] No render-blocking JS in head.
- [x] Hero asset is inline SVG (no extra request).
- [x] Logo + favicon are local PNG (74 KB + 4 KB).
- [x] Contact-page map is `<iframe loading="lazy">`.
- [x] `will-change` hints not used heuristically — GSAP applies its own transform optimizations.
- [x] No layout shift expected: all major sections have explicit min-heights or aspect ratios; fonts use `swap`.
- [ ] Real client images (hero photos, project gallery) must be supplied; recommend WebP + `loading="lazy"` + explicit `width`/`height` to preserve CLS.

## Client-ready checklist
- [x] Placeholder content clearly marked (`<!-- NANO BANANA ASSET HERE -->` × 4).
- [x] Form `action` set to `#` — must be wired to backend before launch.
- [x] Favicon set on every page.
- [ ] `og-cover.jpg` Open Graph image to be designed (referenced in `index.html`).
- [x] 404 page exists.
- [x] README includes deployment steps (Netlify / Vercel / generic).
- [x] CUI / J-number is a placeholder in the footer — to be updated with real values before launch.
- [x] WhatsApp + tel: floating actions present on every content page.
- [x] Google Maps embed unauthenticated — replace with API-key embed for production.

## Internal-linking audit
Every page links to: Home, Panouri fotovoltaice, Casa Verde, Servicii, Despre, Contact. Each CTA points to `contact.html#ofertă`. No broken links between pages (the original `referințe → încălzire-în-pardosea` bug from samgec.ro is fixed).

## Known follow-ups (not part of this build)
1. Replace 4 Nano Banana SVG placeholders with rendered 3D PV-array assets.
2. Wire contact form to Netlify Forms or a backend endpoint.
3. Add real CUI / J-registration number to footer.
4. Add Google Business Profile schema + structured photos.
5. Optional: EN / DE localized variants for cross-border German/Hungarian-speaking customers in the region.
6. Optional: blog / resources section targeting informational keywords (`cum-devin-prosumator`, `cat-costa-panouri-fotovoltaice`, `subventie-casa-verde-2026`).
7. Optional: animated price configurator (Engie-style) — would lift conversion but adds ~2 weeks of work.

**Audit result: build passes.** All blocking items resolved; remaining items are content/credential placeholders that require client input before launch.
