# Launch checklist: items needing Andy's input

Run `npm run check` at any time for the live list of placeholders.

## Blocking launch
- [ ] **NSW licence number.** `data/site.json` → `licence` (currently `[LICENCE NO.]`, shown in the footer).
- [ ] **Listing photography.** Run `npm run images` from a machine with internet access. The campaign image CDN (`d3g1fm0n641hm7.cloudfront.net`) was not reachable from the build environment, so 37 images (all of Hawthorne, Sharland and the Lane Cove campaigns) are still placeholders. Commit `static/assets/img/` and `data/images.manifest.json` afterwards.
- [ ] **Hawthorne alt text and hero order.** After images are processed, open `images/contact-sheet.html`, rewrite the ten `hawthorne-*` alt texts to describe each shot, and order them pool, garden, staircase, facade.
- [x] **Photography permission.** Raine & Horne office approved use of campaign imagery (confirmed 28 Sep 2026). Footer credit stays in place.
- [x] **Form endpoint (interim).** Forms post over HTTPS to FormSubmit, delivering to adwordsmanagergc@gmail.com. The first submission sends an activation email to that inbox: click it once or nothing is delivered.
- [ ] **Form endpoint (launch).** Switch `forms.endpoint` in `data/site.json` to alex.banning@rh.com.au, or to the random alias FormSubmit issues after activation so the address is not visible in the page source.
- [ ] **Privacy policy.** Review `/privacy/` against the Raine & Horne network policy.
- [ ] **Domain.** Point alex-banning.com at the Vercel project; confirm `https://www.alex-banning.com` is the canonical host (or set `SITE_URL`).

## Tracking
- [ ] `GA4_ID`, mark `generate_lead` as a key event.
- [ ] `GOOGLE_ADS_ID` + `GOOGLE_ADS_LEAD_LABEL`.
- [ ] `META_PIXEL_ID`.
- [ ] `GOOGLE_MAPS_KEY` for address autocomplete (optional).
- [ ] Submit `https://www.alex-banning.com/sitemap.xml` in Search Console.

## Content from Alex
- [ ] **Case studies** (`data/case-studies.json`): strategy and a real, approved vendor quote for Hawthorne; challenge, strategy and campaign for 2/34 Tobruk Avenue and G09/28 Mindarie Street. Tobruk and Mindarie stay `noindex` until at least three sections exist.
- [ ] **2/34 Tobruk Avenue:** property type, beds/baths/cars, sale method. The brief calls it "harbourside suburb record-style"; the site does not claim a record until Alex confirms one.
- [ ] **Missing sale facts** in `data/sales.json`: dates and methods for Mindarie G09, Gordon 204, Mowbray 307, Mindarie 67; days on market for all (shown only when present).
- [ ] **Source for approved quotes.** Add the platform to the four quotes without one in `data/reviews.json`.
- [ ] **Office hours** (`data/site.json` → `office.hours`). Hidden until filled.
- [ ] **Suburb medians** (`medianHouse`, `medianUnit` in each `data/suburbs/*.md`) from CoreLogic or REA, with source and date (`marketSource:` line).
- [ ] **Insights.** Three outlines in `data/insights/` with `[Alex to supply]` and `[DATA PLACEHOLDER]` marks. Publish by setting `status: published` and `date:`.
- [ ] **Editorial photoshoot** (recommended, 1 hour): Alex in a prestige home, natural light, B&W and colour, walking shots, hands on keys/door. Layout slots: homepage hero fallback, About hero and aside. Replace `alex-walking`, `alex-balcony`, `alex-phone` in `data/images.json`.
- [ ] **Sales left off the new site.** The previous site listed 8/38 Cope Street ($820k), 7/106 Burns Bay Road ($765k) and 59/31-39 Mindarie Street ($660k). They were not in the verified brief, so they are omitted (their photos remain in `images/source/`). Add them back to `sales.json` if wanted.
- [ ] **Chairman's Club badge.** `images/source/chairmans-club-badge.jpeg` reads "#1 Chairman's Club Salespeople, Residential & Rural, Gold". It is not used because the brief lists only "multiple Chairman's Club awards" without a year. Confirm the year and wording to add it to `awards.json` and the About page.

## Fact review (local knowledge)
The suburb guides avoid numbers but mention local landmarks. A quick local read is worthwhile, particularly: the Northbridge suspension bridge on Strathallen Avenue, The Parapet (Castlecrag), Nutcote and Kurraba Point wharf (Neutral Bay), Mowbray Public School (Lane Cove North), Lane Cove West Public School, Chatswood Public and High Schools, Artarmon Public School.

## Suburb pages retired
The previous site had 29 suburb pages under `/lower-north-shore/`. The brief specifies 14 under `/suburbs/`. The other 15 now redirect to `/suburbs/`. Their old copy is archived in `docs/archive-website-copy.md` if any should be rewritten and restored.
