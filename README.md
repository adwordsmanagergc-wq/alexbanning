# alex-banning.com

The personal site of Alex Banning, Partner Agent & Director, Raine & Horne Lower North Shore.

It is a static site: `build.js` reads the content in `data/` and writes finished HTML to `public/`. There are no runtime dependencies. Vercel runs `npm run build` on every push and serves `public/` (see `vercel.json`).

## Quick start

```bash
npm install          # only needed for the image pipeline (sharp)
npm run build        # writes public/
npm run check        # QA: dashes, one H1 per page, broken links, alt text, lists placeholders
npm run serve        # preview on http://localhost:4173
```

## Updating content

Everything editable lives in `data/`. Edit, run `npm run build && npm run check`, commit and push.

| What | File | Notes |
|---|---|---|
| Current listings | `data/listings.json` | Update weekly. `status`: `for-sale` or `off-market`. `private: true` puts a home in the Private Collection behind the name/mobile gate. When a listing sells, delete it here and add it to `sales.json`. |
| Sold results | `data/sales.json` | `price` is a number (or `null` if withheld). Unknown fields stay `null` and are hidden, never guessed. The homepage shows prices only at or above `homepagePriceFloor` ($1.4M). The Results page sorts by price, highest first. |
| Case studies | `data/case-studies.json` | Sections left `null` are hidden. A case study with fewer than three filled sections is `noindex` and left out of the sitemap until completed. |
| Statistics | `data/stats.json` | Every figure on the site comes from here and is shown with its source and date. Update `asAt` and the figures together. |
| Awards | `data/awards.json` | Exact wording only. Do not upgrade. |
| Review quotes | `data/reviews.json` | Only quotes published on RateMyAgent, realestate.com.au or Google. No invented names. |
| Suburb guides | `data/suburbs/<slug>.md` | Frontmatter + intro + `## FAQ` with `### Question` blocks (becomes FAQPage schema). Fill `medianHouse` / `medianUnit` from CoreLogic or REA; while they read `[DATA PLACEHOLDER]` the row is hidden. |
| Insights | `data/insights/<slug>.md` | `status: draft` shows the title as "In preparation". Change to `status: published` and add `date:` to publish the article with Article schema. |
| Phone, email, licence, office, profiles | `data/site.json` | |

### Adding a sale in 60 seconds
1. Copy an entry in `data/sales.json`, set `id` (the URL slug), address, suburb, `suburbSlug` (must match a file in `data/suburbs/`), price, date.
2. Add its photos to `data/images.json` (see below), run `npm run images`.
3. `npm run build && npm run check`, commit, push.

### Pulling listings from the Raine & Horne feed (later)
`listings.json` is deliberately shaped like a simple feed. The next step is a small script (run on a schedule, or as a Vercel build step) that fetches Alex's listings from the Raine & Horne / REA XML feed (ask the office for the REAXML or API access), maps each property to the fields above, and writes `data/listings.json` before `build.js` runs. Keep `private` listings manual.

## Images

The site never hotlinks. `data/images.json` lists every image with its source (a local file in `images/source/` or a campaign URL) and its alt text. `npm run images`:

- downloads each source (cached in `images/.cache/`), applies any crop, and a subtle warm grade to apartment interiors;
- writes AVIF and WebP at 480 to 2400px into `static/assets/img/<id>/`, plus a blur placeholder;
- records it in `data/images.manifest.json` and writes `images/contact-sheet.html` for checking crops and writing alt text.

Commit the outputs. Any image not yet processed renders as a quiet "Photography to come" block, so layouts hold their shape. Full-bleed 16:9 hero slots are reserved for Hawthorne and Sharland; everything else is set at 4:5.

The homepage hero automatically becomes a slow Hawthorne slideshow once `hawthorne-*` images are processed; until then it shows Alex's portrait. Reorder `hawthorne-*` entries (pool, garden, staircase, facade first) to choose the hero sequence.

## Configuration (environment variables)

Set in Vercel, Project Settings, Environment Variables. All optional; features switch on when present.

| Variable | Purpose |
|---|---|
| `FORM_ENDPOINT` | Overrides `forms.endpoint` in `data/site.json`. Currently FormSubmit (`https://formsubmit.co/<email>`), sending to adwordsmanagergc@gmail.com for now. A Formspree URL also works. |
| `GA4_ID` | GA4 measurement ID. Form success fires `generate_lead` (mark it as a key event/conversion in GA4). |
| `GOOGLE_ADS_ID`, `GOOGLE_ADS_LEAD_LABEL` | Google Ads conversion (`AW-XXXX` and its label). |
| `META_PIXEL_ID` | Meta Pixel. Form success fires `Lead`. |
| `GOOGLE_MAPS_KEY` | Enables Google Places address autocomplete on the appraisal form (restrict the key to the domain). |
| `SITE_URL` | Canonical origin. Defaults to `https://www.alex-banning.com`. |

## Structure

```
build.js            page templates and output
lib/                util (markdown, images), layout (head, header, footer, schema), components
data/               all content
static/             copied verbatim into public/ (css, js, fonts, processed images, icons)
images/source/      original local photography
scripts/            images.js (image pipeline), check.js (QA)
docs/               brief, launch checklist, archived copy from the previous site
```

Old URLs (`/lower-north-shore/*`, `/recent-sales/`, `/testimonials/`) redirect permanently to their new equivalents (`vercel.json`).

See `docs/launch-checklist.md` for everything still needed before launch.
