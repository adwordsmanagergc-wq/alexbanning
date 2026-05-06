# Website Build Prompt — Alex Banning | Luxury Real Estate, Lower North Shore Sydney

Below is a copy-ready prompt you can hand to a web designer, developer, or AI website builder (Webflow, Framer, Cursor, v0, Lovable, WordPress, etc.). It's structured so it can be used end-to-end, or sectioned out (e.g. just the suburb-page template).

## 1. Project Brief

Build a luxury, premium-feel personal brand website for Alex Banning, Partner Agent and Director at Raine & Horne Lower North Shore (Banning Enterprises Pty Ltd). The site must position Alex as the #1 / top-selling agent on Sydney's Lower North Shore, holding block, street and suburb records across the area, working in real estate since 2009, and consistently ranked among Australia's leading sales agents within the Raine & Horne network. He is also recognised as Lane Cove's most recommended agent (source: realestate.com.au).

Primary commercial goal: drive high-intent home-owner leads to request a free market appraisal / property valuation.

Secondary goals: showcase recent record sales, build trust through testimonials, and rank organically for "[suburb] real estate agent", "[suburb] property valuation", "[suburb] free market appraisal", "best real estate agent Lower North Shore".

Brand voice: confident, refined, understated luxury, data-driven, client-first. Think Knight Frank / Sotheby's tone, locally grounded, never gimmicky.

Visual direction:

- Editorial, magazine-style layouts with generous whitespace
- Muted luxury palette (deep navy or charcoal, ivory/bone, brushed gold/champagne accent — keep within Raine & Horne brand-friendly territory)
- Serif display headings (e.g. Canela, Playfair, GT Super) paired with a clean sans (Inter, Söhne, Neue Haas)
- Hero cinemagraph or slow auto-play video of premium Lower North Shore properties / harbour views
- High-end real estate photography only — no stock cliché

## 2. Site Architecture

```
/                                  → Home (Alex Banning landing)
/about                             → About Alex (bio, credentials, philosophy)
/appraisal                         → Free Market Appraisal request (lead form)
/recent-sales                      → Sold portfolio with filters by suburb
/current-listings                  → Live listings (feed from Raine & Horne / REA)
/testimonials                      → Reviews & case studies
/lower-north-shore                 → Hub page with INTERACTIVE MAP
/lower-north-shore/lane-cove       → Suburb page
/lower-north-shore/mosman          → Suburb page
/lower-north-shore/cremorne        → …
/lower-north-shore/neutral-bay
/lower-north-shore/kirribilli
/lower-north-shore/milsons-point
/lower-north-shore/lavender-bay
/lower-north-shore/mcmahons-point
/lower-north-shore/waverton
/lower-north-shore/wollstonecraft
/lower-north-shore/crows-nest
/lower-north-shore/north-sydney
/lower-north-shore/cammeray
/lower-north-shore/naremburn
/lower-north-shore/northbridge
/lower-north-shore/willoughby
/lower-north-shore/artarmon
/lower-north-shore/chatswood
/lower-north-shore/st-leonards
/lower-north-shore/greenwich
/lower-north-shore/riverview
/lower-north-shore/longueville
/lower-north-shore/linley-point
/lower-north-shore/lane-cove-north
/lower-north-shore/lane-cove-west
/lower-north-shore/castlecrag
/lower-north-shore/middle-cove
/lower-north-shore/castle-cove
/lower-north-shore/roseville
/contact
```

Each suburb URL must follow `/lower-north-shore/[suburb-slug]` for clean internal linking and topical SEO clustering.

## 3. Home / Agent Landing Page

Sections, top to bottom:

1. **Hero** — full-bleed harbour or premium home photography. Headline: "Lower North Shore's Most Recommended Agent." Subhead referencing his record-setting sales since 2009. Two CTAs: "Request a Free Appraisal" (primary) + "View Recent Sales" (secondary). Sticky phone CTA on mobile (0434 131 903).
2. **Trust strip** — logos / stats bar: years in market (since 2009), block/street/suburb records held, Raine & Horne network ranking, realestate.com.au "most recommended" badge for Lane Cove.
3. **About Alex** — short editorial bio with portrait, link to full About page.
4. **Interactive Lower North Shore Map** (see Section 5).
5. **Recent record sales carousel** — pulled live from listings feed where possible.
6. **Appraisal CTA block** — "Curious what your home is worth in today's market?" with inline form (address + name + phone + email).
7. **Testimonials** — rotating, with suburb tag on each (helps suburb-page reuse).
8. **Featured in / Awards** — Raine & Horne network rankings, REB / RateMyAgent recognition, etc.
9. **Final CTA + footer** with all four R&H LNS office addresses (Lane Cove, Willoughby, Mosman, Northbridge).

## 4. Suburb Page Template (THIS IS THE SEO ENGINE)

Build one reusable template populated per suburb via CMS fields. Each suburb page must be its own indexable URL with unique copy (no duplicate content).

On-page structure:

- **H1**: `Selling in [Suburb]? Get a Free Market Appraisal from Alex Banning`
- **Meta title** (≤60 chars): `[Suburb] Real Estate Agent | Free Appraisal — Alex Banning`
- **Meta description** (≤155 chars): `Thinking of selling in [Suburb]? Alex Banning, Lower North Shore's top-selling agent, delivers record prices. Request your free property valuation today.`
- **Hero**: suburb hero image + H1 + inline appraisal form (address autocomplete).
- **Intro paragraph** (150–200 words): Alex's track record specifically in that suburb — record sales, streets covered, property types he specialises in (waterfront, federation, art deco apartments, family homes, etc.). Naturally include keywords: "[suburb] real estate agent", "property valuation [suburb]", "sell my home in [suburb]", "free market appraisal [suburb]".
- **"Why Alex" module** — 3–4 cards: Record-Setting Results, Deep Local Knowledge, 5-Star Service, Pre-Market & Off-Market Reach.
- **Suburb market snapshot** — median house price, median unit price, days on market, auction clearance rate, 12-month growth. Pull from CoreLogic / Domain / REA APIs or update via CMS quarterly. Add a disclaimer + "last updated" date.
- **Recent sales in [Suburb]** — filtered grid showing 6–9 of Alex's sold properties in that suburb with sale price (or "Contact Agent"), bed/bath/car, sale method.
- **Testimonials** filtered by suburb (where available).
- **"How a market appraisal works"** 4-step explainer — Book → On-site visit → Comparable analysis → Written report. Reinforces the conversion.
- **FAQ block** (FAQPage schema): 6–8 questions e.g. "How much is my [Suburb] home worth?", "Is the appraisal really free?", "What's the difference between a market appraisal and a bank valuation?", "How long does it take?", "What's the current median price in [Suburb]?", "How do I prepare my [Suburb] home for sale?"
- **Internal linking footer** — link to 4–6 neighbouring suburb pages + back to LNS hub + recent sales + about Alex.
- **Final CTA**: sticky-on-scroll "Request your free [Suburb] appraisal" form.

CMS fields per suburb: `suburb_name, postcode, slug, hero_image, intro_copy, market_stats{median_house, median_unit, dom, clearance, growth_12m, last_updated}, signature_streets[], property_specialties[], testimonials[], recent_sales[], faqs[], neighbouring_suburbs[]`

## 5. Interactive Lower North Shore Map (Hub Page)

On `/lower-north-shore` and embedded on the home page:

- SVG-based interactive map of the Lower North Shore (custom-drawn or styled Mapbox/Leaflet vector tiles). Each suburb is a clickable polygon.
- Hover state: suburb fills with accent gold/champagne; tooltip shows suburb name + median price + "View [Suburb] →".
- Click: navigates to `/lower-north-shore/[slug]`.
- Mobile fallback: horizontally scrolling chip list of suburbs + a tap-to-zoom static map image with image-map links.
- Accessibility: every polygon has an `aria-label`, a parallel `<ul>` of suburb links is rendered for screen readers and crawlers (also boosts SEO internal linking).
- Above the map: H1 "Lower North Shore Real Estate — Suburb Guides & Free Appraisals". Below: brief 120-word editorial intro positioning Alex across the entire LNS.

## 6. Lead-Capture Appraisal Flow

- Multi-step form (feels lighter, lifts conversion):
  1. Property address (Google Places autocomplete restricted to NSW)
  2. Property type + beds/baths/parking
  3. Timeframe to sell (Just curious / 1–3 mo / 3–6 mo / 6–12 mo)
  4. Name, mobile, email
- Submit → write to CRM (e.g. VaultRE, AgentBox, Salesforce) + send transactional email + SMS confirmation + Slack/Teams ping to Alex.
- Thank-you page with calendar embed (Calendly / Google Appointments) for booking the on-site visit. Include a recent record-sale case study to keep momentum.
- GDPR/Australian Privacy Act compliant consent checkbox; link to privacy policy.

## 7. SEO Specifications

- Schema.org JSON-LD on every page: `RealEstateAgent` (Alex), `LocalBusiness` (Raine & Horne LNS), `Person`, `BreadcrumbList`. Suburb pages add `Place` and `FAQPage`. Sales pages add `Product` / `Residence`.
- Sitemap.xml auto-generated; robots.txt allowing all suburb pages.
- Core Web Vitals: LCP < 2.0s, CLS < 0.05, INP < 200ms. Use next-gen image formats (AVIF/WebP), lazy loading, edge caching/CDN.
- Internal linking: every suburb page links to 4–6 neighbours + hub; hub links to all; home links to hub + top 6 suburbs.
- Canonical tags on every page; hreflang = en-AU.
- Open Graph + Twitter cards with bespoke share images per suburb.
- Target keyword clusters per suburb page: `[suburb] real estate agent`, `[suburb] property valuation`, `[suburb] market appraisal`, `sell house [suburb]`, `best agent [suburb]`, `house prices [suburb]`, `free home valuation [suburb] Sydney`.
- Blog / Insights hub (`/insights`) for long-tail content: market updates, suburb deep-dives, "How to prepare your [suburb] home for auction", quarterly LNS market reports — all internally linking back to suburb pages.

## 8. Tech Stack Recommendation

- **Frontend**: Next.js (App Router) + TypeScript + Tailwind, deployed on Vercel.
- **CMS**: Sanity or Payload (suburb pages, sales, testimonials, blog).
- **Map**: Mapbox GL JS with custom suburb GeoJSON, or hand-authored SVG.
- **Forms**: React Hook Form + Zod, posting to a serverless endpoint that fans out to CRM + email + SMS (Twilio).
- **Analytics**: GA4 + Microsoft Clarity + server-side conversion tracking; call-tracking numbers via CallRail or similar.
- **A/B testing**: Vercel Edge Config or VWO on hero headline + CTA copy.

## 9. Compliance & Branding

- Honour Raine & Horne brand guidelines (logo lockup, colours where required for the franchise relationship). The site is Alex's personal brand but must clearly state "Licensed Agent of Raine & Horne Lower North Shore" with licence number in the footer.
- Include all four office addresses in the footer (Lane Cove, Willoughby, Mosman, Northbridge) and Alex's direct line 0434 131 903 + email CTA.
- Privacy Policy, Terms of Use, Complaints page — link from footer.

## 10. Deliverables

1. Figma design (desktop + mobile) — home, about, hub map, suburb template, appraisal flow, recent sales, testimonials.
2. Coded site with CMS populated for at least the top 10 suburbs at launch, remainder rolled out within 30 days.
3. Interactive SVG/Mapbox LNS map with all suburb links live.
4. CRM + SMS + email integrations for the appraisal form, tested end-to-end.
5. SEO launch checklist signed off (schema, sitemap, Search Console, indexing, Core Web Vitals).
6. 90-day content plan: 12 suburb-targeted articles + quarterly LNS market report template.

**North-star KPI**: number of qualified appraisal requests per month from organic search per suburb page.
