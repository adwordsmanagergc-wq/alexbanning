#!/usr/bin/env node
/*
 * alex-banning.com static site generator. Zero runtime dependencies.
 * Reads /data, writes the finished site to /public (copied from /static first).
 * Run: npm run build
 */
const fs = require('fs');
const path = require('path');
const U = require('./lib/util');
const { esc, md, pic, firstImage, hasImage, imgUrl, preloadFor, isPlaceholder, frontmatter, splitFaq } = U;
const { SITE, ICON, abs, page, personSchema, breadcrumbSchema, breadcrumbs } = require('./lib/layout');
const C = require('./lib/components');

const OUT = path.join(U.ROOT, 'public');

// ---------- Data ----------
const stats = U.readJSON('data/stats.json');
const awards = U.readJSON('data/awards.json');
const reviews = U.readJSON('data/reviews.json');
const salesData = U.readJSON('data/sales.json');
const listingsData = U.readJSON('data/listings.json');
const caseStudies = U.readJSON('data/case-studies.json').caseStudies;

const sales = [...salesData.sales].sort((a, b) => (b.price || 0) - (a.price || 0));
const saleById = Object.fromEntries(sales.map(s => [s.id, s]));
const listings = listingsData.listings;
const privateListings = listings.filter(l => l.private);
const publicListings = listings.filter(l => !l.private);

const readDir = dir => fs.readdirSync(path.join(U.ROOT, dir)).filter(f => f.endsWith('.md')).map(f => {
  const { data, body } = frontmatter(fs.readFileSync(path.join(U.ROOT, dir, f), 'utf8'));
  return { ...data, body };
});
const suburbs = readDir('data/suburbs').sort((a, b) => Number(a.order) - Number(b.order));
const suburbBySlug = Object.fromEntries(suburbs.map(s => [s.slug, s]));
const insights = readDir('data/insights');

const hawthorne = saleById['10-hawthorne-avenue-chatswood'];
const sharland = listings.find(l => l.id === '42-sharland-avenue-chatswood');
const agentSchema = (withRating = false) => personSchema({ withRating, stats, awards: awards.awards.filter(a => !a.agency), areaServed: suburbs.map(s => s.name) });

// ---------- Output helpers ----------
const pages = [];
function write(urlPath, html, { sitemap = true, priority = '0.6' } = {}) {
  const file = urlPath.endsWith('/') ? path.join(OUT, urlPath, 'index.html') : path.join(OUT, urlPath);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
  if (sitemap) pages.push({ urlPath, priority });
}
function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const e of fs.readdirSync(from, { withFileTypes: true })) {
    const a = path.join(from, e.name), b = path.join(to, e.name);
    e.isDirectory() ? copyDir(a, b) : fs.copyFileSync(a, b);
  }
}

const statNote = text => `<p class="src">${esc(text)}</p>`;
const arrowLink = (label, href, cls = 'more') => `<a class="${cls}" href="${href}">${label} ${ICON.arrow}</a>`;

// =====================================================================
// HOME
// =====================================================================
function home() {
  const heroIds = hawthorne.images.filter(hasImage).slice(0, 4);
  const hasHero = heroIds.length > 0;
  const heroMedia = hasHero
    ? `<div class="hero__slides" data-slides>${heroIds.map((id, i) => `<div class="hero__slide${i === 0 ? ' is-active' : ''}">${pic(id, { eager: i === 0, sizes: '100vw', alt: i === 0 ? U.REG_BY_ID[id].alt : '' })}</div>`).join('')}</div>`
    : `<div class="hero__portrait">${pic('alex-phone', { eager: true, sizes: '(min-width: 900px) 40vw, 100vw' })}</div>`;

  const signatureImg = hawthorne.images.find(hasImage) || hawthorne.images[0];
  const sharlandImg = sharland && (sharland.images.find(hasImage) || sharland.images[0]);
  const floor = salesData.homepagePriceFloor;
  const gallerySales = ['2-34-tobruk-avenue-cremorne', 'g09-28-mindarie-street-lane-cove', '205-15-finlayson-street-lane-cove', '2-6-parklands-avenue-lane-cove', '204-76-82-gordon-crescent-lane-cove']
    .map(id => saleById[id]).filter(Boolean);
  const strip = ['chatswood-west', 'longueville', 'northbridge', 'castlecrag', 'mosman', 'cremorne', 'greenwich', 'lane-cove'].map(s => suburbBySlug[s]).filter(Boolean);

  const body = `
<section class="hero${hasHero ? ' hero--full' : ' hero--split'}" aria-labelledby="hero-h">
  ${heroMedia}
  <div class="hero__veil" aria-hidden="true"></div>
  <div class="wrap hero__content">
    <p class="label label--light">Raine &amp; Horne Lower North Shore · Partner Agent</p>
    <h1 id="hero-h" class="hero__title">The Lower North Shore's most recommended agent.</h1>
    <p class="hero__sub">Seventeen years. Street and suburb records. Now representing the area's finest homes.</p>
    <div class="hero__ctas">
      <a class="btn btn--light" href="/appraisal/">Request a private appraisal</a>
      <a class="btn btn--line-light" href="#signature">View signature sales</a>
    </div>
    ${hasHero ? `<p class="hero__caption">10 Hawthorne Avenue, Chatswood. Sold $4,025,000.</p>` : ''}
  </div>
</section>

${C.proofBand(stats)}

<section class="section signature" id="signature" aria-labelledby="sig-h">
  <div class="wrap signature__grid">
    <div class="signature__media" data-reveal>
      ${pic(signatureImg, { sizes: '(min-width: 900px) 58vw, 100vw', ratio: '4/5', alt: 'Pool and garden at 10 Hawthorne Avenue, Chatswood, sold by Alex Banning' })}
    </div>
    <div class="signature__copy" data-reveal>
      <p class="label">Signature sale · Chatswood West</p>
      <h2 id="sig-h" class="display">10 Hawthorne Avenue</h2>
      <p class="figure">$4,025,000</p>
      <p class="lede">Held by one family for four decades. A corner estate with a saltwater pool and helical staircase, taken to auction and sold.</p>
      <dl class="kv">
        <div><dt>Method</dt><dd>Auction</dd></div>
        <div><dt>Date</dt><dd>14 February 2026</dd></div>
        <div><dt>Home</dt><dd>Four bedrooms, double brick, studio</dd></div>
      </dl>
      ${arrowLink('Read the case study', '/results/10-hawthorne-avenue-chatswood/')}
    </div>
  </div>
</section>

${sharland ? `<section class="section private" aria-labelledby="pc-h">
  <div class="wrap private__grid">
    <div class="private__copy" data-reveal>
      <p class="label label--light">Private Collection</p>
      <h2 id="pc-h" class="display">42 Sharland Avenue, Chatswood</h2>
      <p class="lede">Four bedrooms, three bathrooms and a pool. Available off market to registered buyers.</p>
      <p>Some homes are better sold quietly. The Private Collection is offered first to buyers on Alex's register, before and sometimes instead of the portals.</p>
      ${arrowLink('Enter the Private Collection', '/private-collection/', 'more more--light')}
    </div>
    <div class="private__media" data-reveal>
      <div class="veiled">${pic(sharlandImg, { sizes: '(min-width: 900px) 45vw, 100vw', ratio: '4/5', alt: 'A glimpse of the pool at 42 Sharland Avenue, Chatswood, offered off market' })}</div>
    </div>
    <div class="private__form" data-reveal>
      <h3 class="h3">Join the private buyer register</h3>
      <p class="muted">Hear about Private Collection homes before they are advertised, if they are advertised at all.</p>
      ${C.registerForm()}
    </div>
  </div>
</section>` : ''}

<section class="section approach" aria-labelledby="ap-h">
  <div class="wrap">
    ${C.sectionHead({ label: 'The approach', id: 'ap-h', title: 'Preparation, judgement, and a steadfast commitment to the result.', intro: 'Real estate at the top of the market is rarely about the loudest voice in the room.' })}
    <div class="approach__grid">
      <article data-reveal><p class="num">I</p><h3 class="h3">Preparation</h3><p>Pre-market strategy set before a photograph is taken. Styling, trades and presentation managed to a timeline, so the home launches once and launches well.</p></article>
      <article data-reveal><p class="num">II</p><h3 class="h3">Judgement</h3><p>Honest pricing advice, and a clear recommendation on method: auction, private treaty or a private, off-market campaign. The right answer depends on the home, not habit.</p></article>
      <article data-reveal><p class="num">III</p><h3 class="h3">Reach</h3><p>Lane Cove's deepest buyer database, built across ${stats.rea.sold} sales a year. ${stats.domain.sold} sales and ${stats.domain.totalValue} in twelve months means active, qualified buyers already in conversation. That is what a prestige home needs.</p>${statNote(`${stats.rea.source} and ${stats.domain.source}, ${stats.rea.period}`)}</article>
    </div>
  </div>
</section>

<section class="section results-band" aria-labelledby="rs-h">
  <div class="wrap">
    ${C.sectionHead({ label: 'Results', id: 'rs-h', title: 'Recent results.', link: ['View all results', '/results/'] })}
  </div>
  ${C.carousel(gallerySales.map(s => C.saleCard(s, { showPrice: s.price >= floor })), 'Recent results')}
</section>

<section class="section reviews-band" aria-labelledby="rv-h">
  <div class="wrap reviews-band__inner">
    <h2 id="rv-h" class="label">In their words</h2>
    ${C.quoteRotator(reviews.quotes, stats)}
    ${arrowLink('Read more reviews', '/reviews/')}
  </div>
</section>

<section class="section suburbs-strip" aria-labelledby="sb-h">
  <div class="wrap">
    ${C.sectionHead({ label: 'Suburbs', id: 'sb-h', title: 'Across the Lower North Shore.', link: ['All suburb guides', '/suburbs/'] })}
    <ul class="strip" role="list">
      ${strip.map((s, i) => `<li data-reveal><a href="/suburbs/${s.slug}/"><span class="strip__n">${String(i + 1).padStart(2, '0')}</span><span class="strip__name">${esc(s.name)}</span><span class="strip__stock">${esc(s.stock)}</span></a></li>`).join('')}
    </ul>
  </div>
</section>

${C.awardsMarquee(awards)}

${C.aboutFacts(stats, awards)}

${C.closingCta()}
`;
  write('/', page({
    path: '/',
    title: 'Alex Banning | Prestige & Lower North Shore Real Estate Agent',
    description: `Record-setting Raine & Horne Partner Agent. $60M+ sold in 12 months, ${stats.reviews.ratemyagent.count} verified reviews. Request a private appraisal.`,
    overlay: true,
    preload: hasHero ? preloadFor(heroIds[0], '100vw') : preloadFor('alex-phone', '(min-width: 900px) 40vw, 100vw'),
    jsonld: [agentSchema(true), { '@context': 'https://schema.org', '@type': 'WebSite', name: 'Alex Banning', url: abs('/') }],
    body,
  }), { priority: '1.0' });
}

// =====================================================================
// PRIVATE COLLECTION
// =====================================================================
function privateCollection() {
  const items = privateListings.map(l => {
    const lead = l.images.find(hasImage) || l.images[0];
    const gallery = l.images.filter(hasImage).slice(1, 7);
    return `<article class="pc-item" id="${l.id}" data-gated="${l.id}">
      <div class="pc-item__media">${lead || l.images.length ? `<div class="veiled">${pic(lead, { sizes: '(min-width: 900px) 55vw, 100vw', ratio: '4/5', alt: `${l.suburb} home offered off market by Alex Banning` })}</div>` : `<div class="img ph" style="aspect-ratio:4/5" role="img" aria-label="Off-market home in ${esc(l.suburb)}"><span>Details on request</span></div>`}</div>
      <div class="pc-item__copy">
        <p class="label">${esc(l.method)} · ${esc(l.suburb)}</p>
        <h2 class="display">${esc(l.suburb)} ${esc((l.type || 'home').toLowerCase())}</h2>
        <p class="lede">${esc(l.teaser || '')}</p>
        <p class="card__meta">${esc([l.type, C.specs(l)].filter(Boolean).join(' · '))}</p>
        <div class="gate" data-gate>
          <p class="muted">Leave your name and mobile to see the address, the full gallery and inspection options. Alex will call to confirm.</p>
          ${C.gateForm(l.id)}
        </div>
        <div class="gated" data-gated-content hidden>
          <p class="label">Address</p>
          <p class="h3">${esc(l.address)}, ${esc(l.suburb)}</p>
          <p>${esc(l.priceLabel)}. Private inspections by appointment with Alex on <a href="${SITE.phoneHref}">${SITE.phone}</a>.</p>
          ${gallery.length ? `<div class="gallery">${gallery.map(id => pic(id, { sizes: '(min-width: 900px) 20vw, 45vw', ratio: '1/1' })).join('')}</div>` : ''}
        </div>
      </div>
    </article>`;
  }).join('');

  const body = `
<section class="phero">
  <div class="wrap phero__inner">
    <p class="label">Private Collection</p>
    <h1 class="display display--xl">Not every home should be on a portal.</h1>
    <p class="lede">Off-market and pre-market homes, offered first to registered buyers. Discretion for the owner. First look for the buyer.</p>
  </div>
</section>
<section class="section section--tight">
  <div class="wrap prose-grid">
    <div class="prose">
      <h2 class="h2">Why sell privately</h2>
      <p>Some owners value privacy above exposure. Others want to test the market without a public price history, or need a sale on their own timeline. A private campaign puts a home in front of qualified buyers who are already in conversation, without a portal listing, signboard or open home.</p>
      <p>It is not right for every home. When broad competition will set a higher price, a public campaign or auction is usually the better path. The recommendation is made on the evidence, before anything is agreed.</p>
    </div>
    <blockquote class="pull">"Sold off-market within 1.5 weeks... exactly as promised."<cite>Verified seller, Lane Cove</cite></blockquote>
  </div>
</section>
<section class="section pc-list" aria-label="Current Private Collection">
  <div class="wrap">${items || '<p class="lede">The collection is currently being refreshed. Join the register to hear first.</p>'}</div>
</section>
<section class="section register" aria-labelledby="reg-h">
  <div class="wrap register__grid">
    <div>
      <p class="label">For buyers</p>
      <h2 id="reg-h" class="display">Join the private buyer register.</h2>
      <p class="lede">Tell Alex what you are looking for. You will hear about suitable homes before they are advertised.</p>
    </div>
    ${C.registerForm()}
  </div>
</section>
${C.closingCta({ heading: 'Considering a private sale?', sub: 'A confidential conversation about whether an off-market campaign suits your home.' })}`;
  write('/private-collection/', page({
    path: '/private-collection/',
    title: 'Private Collection: Off-Market Homes | Alex Banning',
    description: 'Off-market and pre-market homes on the Lower North Shore, offered first to registered buyers. Discreet private sales with Alex Banning, Raine & Horne.',
    jsonld: [breadcrumbSchema([['Home', '/'], ['Private Collection', '/private-collection/']])],
    body,
  }), { priority: '0.8' });
}

// =====================================================================
// RESULTS + CASE STUDIES
// =====================================================================
function results() {
  const types = ['House', 'Townhouse', 'Apartment'];
  const subs = [...new Set(sales.map(s => s.suburb))].sort();
  const years = [...new Set(sales.map(s => s.date && s.date.slice(0, 4)).filter(Boolean))].sort().reverse();
  const cards = sales.map(s => `<li data-type="${s.type || ''}" data-suburb="${esc(s.suburb)}" data-year="${s.date ? s.date.slice(0, 4) : ''}" data-price="${s.price || 0}">${C.saleCard(s)}</li>`).join('');
  const sel = (name, label, opts) => `<label class="field field--inline"><span>${label}</span><select name="${name}"><option value="">All</option>${opts.map(o => `<option>${esc(o)}</option>`).join('')}</select></label>`;
  const body = `
<section class="phero">
  <div class="wrap phero__inner">
    <p class="label">Results</p>
    <h1 class="display display--xl">Sold properties and record results.</h1>
    <p class="lede">${stats.domain.sold} sales and ${stats.domain.totalValue} in twelve months, ${stats.domain.auction} of them under the hammer. A selection of recent results follows, highest first.</p>
    ${statNote(`${stats.domain.source}, ${stats.domain.period}`)}
  </div>
</section>
<section class="section section--tight">
  <div class="wrap">
    <form class="filters" data-filters aria-label="Filter results">
      <fieldset class="seg"><legend class="sr">Property type</legend>
        <label><input type="radio" name="type" value="" checked><span>All</span></label>
        ${types.map(t => `<label><input type="radio" name="type" value="${t}"><span>${t}s</span></label>`).join('')}
      </fieldset>
      ${sel('suburb', 'Suburb', subs)}
      ${sel('year', 'Year', years)}
      <p class="filters__count" aria-live="polite"><span data-count>${sales.length}</span> results</p>
    </form>
    <ul class="grid grid--results" role="list" data-results>${cards}</ul>
    <p class="note">Prices shown where the result is public. Some results are withheld at the vendor's request. Days on market shown where recorded.</p>
  </div>
</section>
${publicListings.length ? `<section class="section section--alt" aria-labelledby="cur-h">
  <div class="wrap">
    ${C.sectionHead({ label: 'Currently offered', id: 'cur-h', title: 'For sale now.', intro: 'Listings change weekly. Call Alex for the latest, or join the private buyer register for homes that are not advertised.' })}
    <ul class="grid" role="list">${publicListings.map(l => `<li>${C.listingCard(l)}</li>`).join('')}</ul>
  </div>
</section>` : ''}
${C.closingCta()}`;
  write('/results/', page({
    path: '/results/',
    title: 'Sold Properties & Record Results | Alex Banning',
    description: `Recent sales by Alex Banning across the Lower North Shore, from $4,025,000 in Chatswood West to Lane Cove apartments. ${stats.domain.sold} sales, ${stats.domain.totalValue} in 12 months.`,
    jsonld: [breadcrumbSchema([['Home', '/'], ['Results', '/results/']]), ...publicListings.map(C.listingSchema)],
    body,
  }), { priority: '0.9' });

  for (const cs of caseStudies) {
    const s = saleById[cs.saleId];
    if (!s) continue;
    const imgs = s.images.filter(hasImage);
    const lead = imgs[0] || s.images[0];
    const sections = [['The challenge', cs.challenge], ['The strategy', cs.strategy], ['The campaign', cs.campaign], ['The result', cs.result]]
      .filter(([, v]) => !isPlaceholder(v));
    const thin = sections.length < 3;
    const url = `/results/${s.id}/`;
    const body = `
${breadcrumbs([['Home', '/'], ['Results', '/results/'], [s.address, url]])}
<section class="cs-hero">
  <div class="cs-hero__media">${pic(lead, { eager: true, sizes: '100vw', ratio: '16/9', alt: `${s.address}, ${s.locality}, sold by Alex Banning` })}</div>
  <div class="wrap cs-hero__copy">
    <p class="label">Case study · ${esc(s.suburb)}</p>
    <h1 class="display display--xl">${esc(s.address)}, ${esc(s.locality)}</h1>
    <p class="figure">${esc(s.price ? 'Sold ' + s.priceLabel : s.priceLabel)}</p>
  </div>
</section>
<section class="section section--tight">
  <div class="wrap cs-grid">
    <aside class="cs-facts">
      <dl class="kv kv--stack">
        ${[['Result', s.priceLabel], ['Method', s.method], ['Date', s.dateLabel], ['Property', [s.type, C.specs(s)].filter(Boolean).join(', ')], ['Days on market', s.daysOnMarket]]
          .filter(([, v]) => v).map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}
      </dl>
      ${arrowLink(`${s.suburb} suburb guide`, `/suburbs/${s.suburbSlug}/`)}
      ${s.url ? `<p><a class="muted" href="${s.url}" target="_blank" rel="noopener">View the campaign listing</a></p>` : ''}
    </aside>
    <div class="prose">
      ${s.summary ? `<p class="lede">${esc(s.summary)}</p>` : ''}
      ${sections.map(([h, v]) => `<h2 class="h2">${h}</h2>${md(v)}`).join('')}
      ${s.features ? `<h2 class="h2">The home</h2><ul class="ticks">${s.features.map(f => `<li>${esc(f)}</li>`).join('')}</ul>` : ''}
      ${!isPlaceholder(cs.quote) ? `<blockquote class="pull">${esc(cs.quote)}<cite>${esc(cs.quoteBy || 'Vendor')}</cite></blockquote>` : ''}
    </div>
  </div>
</section>
${imgs.length > 1 ? `<section class="section section--tight"><div class="wrap gallery gallery--wide">${imgs.slice(1).map(id => pic(id, { sizes: '(min-width: 900px) 33vw, 50vw', ratio: '4/5' })).join('')}</div></section>` : ''}
${C.closingCta({ heading: 'Selling a significant home?', sub: 'Talk to Alex about preparation, method and the buyers already looking.', suburb: s.suburb })}`;
    write(url, page({
      path: url,
      title: `${s.address}, ${s.locality}: ${s.price ? 'Sold ' + s.priceLabel : 'Sold'} | Alex Banning`,
      description: `${s.address}, ${s.locality}${s.price ? ', sold for ' + s.priceLabel : ''}${s.method ? ' at ' + s.method.toLowerCase() : ''}. ${s.summary || ''}`.slice(0, 158),
      ogImage: imgUrl(lead, 1600),
      noindex: thin,
      preload: preloadFor(lead, '100vw'),
      jsonld: [breadcrumbSchema([['Home', '/'], ['Results', '/results/'], [s.address, url]])],
      body,
    }), { sitemap: !thin, priority: '0.7' });
  }
}

// =====================================================================
// ABOUT
// =====================================================================
function about() {
  const tl = awards.awards;
  const body = `
<section class="about-hero">
  <div class="wrap about-hero__grid">
    <div class="about-hero__copy">
      <p class="label">About</p>
      <h1 class="display display--xl">Alex Banning</h1>
      <p class="lede">${esc(SITE.jobTitle)}, ${esc(SITE.agency)}. Selling on the Lower North Shore since ${stats.yearsSelling.since}.</p>
    </div>
    <div class="about-hero__media">${pic('alex-walking', { eager: true, sizes: '(min-width: 900px) 45vw, 100vw', ratio: '4/5' })}</div>
  </div>
</section>

<section class="section">
  <div class="wrap longform">
    <div class="longform__body prose">
      <p class="dropcap">Alex Banning began his career at Ray White Lane Cove in ${stats.yearsSelling.since}. The market rewarded the same things then that it does now: preparation, judgement and a steady hand in the room.</p>
      <h2 class="h2">Building an office</h2>
      <p>On 1 August 2017, Alex opened Raine &amp; Horne Lane Cove as one of three founding principals. Within two years the office had grown from three to thirteen staff and taken roughly a third of the Lane Cove and Lane Cove North market. In 2019 it was named RateMyAgent Agency of the Year for Lane Cove and Lane Cove North.</p>
      <h2 class="h2">Partner Agent and Director</h2>
      <p>Today Alex is a Partner Agent and Director of Raine &amp; Horne Lower North Shore, working from 85 Longueville Road, Lane Cove, with the network's offices in Willoughby, Mosman and Northbridge. He holds multiple block, street and suburb records.</p>
      <p>The volume matters for a reason. ${stats.rea.sold} sales a year means a buyer database that is active, current and deep. When a significant home comes to market, many of the right buyers are already known.</p>
    </div>
    <figure class="longform__aside">${pic('alex-balcony', { sizes: '(min-width: 900px) 30vw, 100vw', ratio: '4/5' })}<figcaption>Editorial portraiture to follow.</figcaption></figure>
  </div>
</section>

<section class="section section--ink" aria-labelledby="why-h">
  <div class="wrap">
    ${C.sectionHead({ label: 'Significant homes', id: 'why-h', title: 'Why vendors of significant homes choose Alex.' })}
    <div class="approach__grid approach__grid--light">
      <article data-reveal><p class="num">I</p><h3 class="h3">Discretion</h3><p>Private and off-market campaigns for owners who value privacy, run with the same discipline as a public one.</p></article>
      <article data-reveal><p class="num">II</p><h3 class="h3">Buyer depth</h3><p>${stats.domain.sold} sales and ${stats.domain.totalValue} in twelve months. The right buyer is often already in conversation.</p>${C.src(`${stats.domain.source}, ${stats.domain.period}`)}</article>
      <article data-reveal><p class="num">III</p><h3 class="h3">Auction record</h3><p>${stats.domain.auction} of ${stats.domain.sold} recent sales under the hammer. Competition, managed well, sets the price.</p>${C.src(`${stats.domain.source}, ${stats.domain.period}`)}</article>
    </div>
  </div>
</section>

<section class="section" aria-labelledby="aw-h">
  <div class="wrap">
    ${C.sectionHead({ label: 'Recognition', id: 'aw-h', title: 'Awards, 2015 to 2025.' })}
    <ol class="timeline">
      ${tl.map(a => `<li data-reveal><span class="timeline__yr">${a.year}</span><span class="timeline__t">${esc(a.title)}</span><span class="timeline__by">${esc(a.by)}${a.note ? ` · ${esc(a.note)}` : ''}</span></li>`).join('')}
      ${awards.ongoing.map(a => `<li data-reveal><span class="timeline__yr">Ongoing</span><span class="timeline__t">${esc(a.title)}</span><span class="timeline__by">${esc(a.by)}</span></li>`).join('')}
    </ol>
    ${awards.claims.map(c => `<p class="note">"${esc(c.text)}." ${esc(c.attribution)}.</p>`).join('')}
  </div>
</section>

${C.aboutFacts(stats, awards)}
${C.closingCta()}`;
  write('/about/', page({
    path: '/about/',
    title: 'About Alex Banning | Partner Agent & Director, Raine & Horne',
    description: `Alex Banning has sold on the Lower North Shore since ${stats.yearsSelling.since}. Co-founder of Raine & Horne Lane Cove, now Partner Agent & Director, Raine & Horne Lower North Shore.`,
    preload: preloadFor('alex-walking', '(min-width: 900px) 45vw, 100vw'),
    jsonld: [agentSchema(false), breadcrumbSchema([['Home', '/'], ['About', '/about/']])],
    body,
  }), { priority: '0.8' });
}

// =====================================================================
// SUBURBS
// =====================================================================
function suburbPages() {
  const hub = `
<section class="phero">
  <div class="wrap phero__inner">
    <p class="label">Suburbs</p>
    <h1 class="display display--xl">Suburb guides for sellers.</h1>
    <p class="lede">What each part of the Lower North Shore is made of, who buys there, and how to sell well.</p>
  </div>
</section>
<section class="section section--tight">
  <div class="wrap">
    <ul class="subgrid" role="list">
      ${suburbs.map(s => `<li><a href="/suburbs/${s.slug}/"><span class="label">${esc(s.postcode)}</span><span class="subgrid__name">${esc(s.name)}</span><span class="subgrid__line">${esc(s.headline)}</span></a></li>`).join('')}
    </ul>
  </div>
</section>
${C.closingCta()}`;
  write('/suburbs/', page({
    path: '/suburbs/',
    title: 'Lower North Shore Suburb Guides for Sellers | Alex Banning',
    description: 'Suburb guides for selling on the Lower North Shore: Chatswood West, Longueville, Northbridge, Castlecrag, Mosman, Cremorne, Lane Cove and more.',
    jsonld: [breadcrumbSchema([['Home', '/'], ['Suburbs', '/suburbs/']])],
    body: hub,
  }), { priority: '0.8' });

  for (const s of suburbs) {
    const { intro, faqs } = splitFaq(s.body);
    const url = `/suburbs/${s.slug}/`;
    const own = sales.filter(x => x.suburbSlug === s.slug);
    const nearbySlugs = (s.neighbours || '').split(',').map(x => x.trim()).filter(Boolean);
    const nearby = own.length ? [] : sales.filter(x => nearbySlugs.includes(x.suburbSlug)).slice(0, 3);
    const fallback = own.length || nearby.length ? [] : sales.filter(x => x.signature).slice(0, 3);
    const shown = own.length ? own.slice(0, 6) : nearby.length ? nearby : fallback;
    const salesTitle = own.length ? `Alex's results in ${s.name}.` : nearby.length ? 'Recent results nearby.' : 'Signature results.';
    const current = listings.filter(l => l.suburbSlug === s.slug && !l.private);
    const privateHere = listings.filter(l => l.suburbSlug === s.slug && l.private);
    const market = [['Median house price', s.medianHouse], ['Median unit price', s.medianUnit]].filter(([, v]) => !isPlaceholder(v));
    const faqSchema = faqs.length ? {
      '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: faqs.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    } : null;

    const body = `
${breadcrumbs([['Home', '/'], ['Suburbs', '/suburbs/'], [s.name, url]])}
<section class="phero phero--suburb">
  <div class="wrap phero__inner">
    <p class="label">${esc(s.eyebrow)}</p>
    <h1 class="display display--xl">Selling in ${esc(s.name)}</h1>
    <p class="lede">${esc(s.headline)}</p>
    <div class="hero__ctas"><a class="btn btn--solid" href="/appraisal/?suburb=${encodeURIComponent(s.name)}">Request a private appraisal</a><a class="btn btn--line" href="${SITE.phoneHref}">${SITE.phone}</a></div>
  </div>
</section>
<section class="section section--tight">
  <div class="wrap longform">
    <div class="longform__body prose">${md(intro)}</div>
    <aside class="longform__aside sidecard">
      <p class="label">${esc(s.name)} at a glance</p>
      <dl class="kv kv--stack">
        <div><dt>Postcode</dt><dd>${esc(s.postcode)}</dd></div>
        <div><dt>Housing stock</dt><dd>${esc(s.stock)}</dd></div>
        ${market.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}
      </dl>
      ${market.length ? statNote(s.marketSource || '') : ''}
      <a class="btn btn--solid btn--block" href="/appraisal/?suburb=${encodeURIComponent(s.name)}">What is my home worth?</a>
    </aside>
  </div>
</section>
${shown.length ? `<section class="section section--alt" aria-labelledby="own-h">
  <div class="wrap">
    ${C.sectionHead({ label: 'Results', id: 'own-h', title: salesTitle, link: ['All results', '/results/'] })}
    <ul class="grid" role="list">${shown.map(x => `<li>${C.saleCard(x)}</li>`).join('')}</ul>
  </div>
</section>` : ''}
${current.length || privateHere.length ? `<section class="section" aria-labelledby="cur-h">
  <div class="wrap">
    ${C.sectionHead({ label: 'Currently offered', id: 'cur-h', title: `For sale in ${esc(s.name)}.` })}
    <ul class="grid" role="list">${current.map(l => `<li>${C.listingCard(l)}</li>`).join('')}
    ${privateHere.length ? `<li><a class="card card--private" href="/private-collection/"><div class="card__body"><p class="label">Private Collection</p><p class="card__price">${privateHere.length} off-market ${privateHere.length > 1 ? 'homes' : 'home'}</p><p>Available to registered buyers.</p><span class="more">View privately ${ICON.arrow}</span></div></a></li>` : ''}</ul>
  </div>
</section>` : ''}
${faqs.length ? `<section class="section" aria-labelledby="faq-h">
  <div class="wrap faq">
    ${C.sectionHead({ label: 'Questions', id: 'faq-h', title: `Selling in ${esc(s.name)}: common questions.` })}
    <div class="faq__list">${faqs.map(f => `<details><summary>${esc(f.q)}</summary><div class="faq__a">${md(f.a)}</div></details>`).join('')}</div>
  </div>
</section>` : ''}
${nearbySlugs.length ? `<nav class="section section--tight nearby" aria-label="Nearby suburbs"><div class="wrap"><p class="label">Nearby</p><ul role="list">${nearbySlugs.filter(n => suburbBySlug[n]).map(n => `<li><a href="/suburbs/${n}/">${esc(suburbBySlug[n].name)}</a></li>`).join('')}</ul></div></nav>` : ''}
${C.closingCta({ heading: `Considering a sale in ${s.name}?`, sub: 'A confidential conversation, and an honest view of value, costs nothing.', suburb: s.name })}`;
    write(url, page({
      path: url,
      title: s.title,
      description: s.description,
      jsonld: [breadcrumbSchema([['Home', '/'], ['Suburbs', '/suburbs/'], [s.name, url]]), faqSchema, ...current.map(C.listingSchema)],
      body,
    }), { priority: '0.8' });
  }
}

// =====================================================================
// REVIEWS
// =====================================================================
function reviewsPage() {
  const r = stats.reviews;
  const max = Math.max(...r.realestate.tags.map(t => t.count));
  const body = `
<section class="phero">
  <div class="wrap phero__inner">
    <p class="label">Reviews</p>
    <h1 class="display display--xl">${r.ratemyagent.count} verified reviews.</h1>
    <p class="lede">Volume says more than adjectives. Read them in full where they were written.</p>
  </div>
</section>
<section class="section section--tight">
  <div class="wrap scores">
    <a class="score" href="${SITE.profiles.ratemyagent}" target="_blank" rel="noopener">
      <p class="label">RateMyAgent</p>
      <p class="score__fig">${r.ratemyagent.rating}<span>/5</span></p>
      <p>${r.ratemyagent.count} reviews, ${r.ratemyagent.fiveStar} of them five-star</p>
      <span class="more">Read on RateMyAgent ${ICON.arrow}</span>
    </a>
    <a class="score" href="${SITE.profiles.realestate}" target="_blank" rel="noopener">
      <p class="label">realestate.com.au</p>
      <p class="score__fig">${r.realestate.rating.toFixed(1)}<span>/5</span></p>
      <p>${r.realestate.count} reviews</p>
      <span class="more">Read on realestate.com.au ${ICON.arrow}</span>
    </a>
    <div class="score score--tags">
      <p class="label">What reviewers mention most</p>
      <ul class="bars" role="list">${r.realestate.tags.map(t => `<li><span class="bars__l">${esc(t.label)}</span><span class="bars__b" style="--w:${(t.count / max * 100).toFixed(1)}%"></span><span class="bars__n">${t.count}</span></li>`).join('')}</ul>
      ${C.src(`realestate.com.au review tags, ${r.realestate.asAt}`)}
    </div>
  </div>
  <div class="wrap">${C.src(`Ratings as at ${r.ratemyagent.asAt}.`)}</div>
</section>
<section class="section section--alt" aria-labelledby="q-h">
  <div class="wrap">
    <h2 id="q-h" class="label">Selected comments</h2>
    <ul class="quotes" role="list">${reviews.quotes.map(q => `<li data-reveal><blockquote><p>${esc(q.text)}</p></blockquote><p class="quotes__by">${esc(q.who)}, ${esc(q.suburb)}${q.source ? ` · ${esc(q.source)}${q.date ? ', ' + esc(q.date) : ''}` : ''}</p></li>`).join('')}</ul>
  </div>
</section>
<section class="section section--tight">
  <div class="wrap center">
    <p class="lede">Worked with Alex?</p>
    <a class="btn btn--line" href="${SITE.profiles.googleBusiness}" target="_blank" rel="noopener">Leave a Google review</a>
  </div>
</section>
${C.closingCta()}`;
  write('/reviews/', page({
    path: '/reviews/',
    title: `Reviews: ${r.ratemyagent.rating} Stars from ${r.ratemyagent.count} Sellers | Alex Banning`,
    description: `${r.ratemyagent.rating} stars from ${r.ratemyagent.count} reviews on RateMyAgent and ${r.realestate.rating.toFixed(1)} from ${r.realestate.count} on realestate.com.au. Read what Lower North Shore sellers say about Alex Banning.`,
    jsonld: [agentSchema(true), breadcrumbSchema([['Home', '/'], ['Reviews', '/reviews/']])],
    body,
  }), { priority: '0.7' });
}

// =====================================================================
// INSIGHTS
// =====================================================================
function insightsPages() {
  const published = insights.filter(i => i.status === 'published');
  const drafts = insights.filter(i => i.status !== 'published');
  const body = `
<section class="phero">
  <div class="wrap phero__inner">
    <p class="label">Insights</p>
    <h1 class="display display--xl">Notes on the Lower North Shore market.</h1>
    <p class="lede">Considered, occasional writing on pricing, method and the suburbs Alex sells in.</p>
  </div>
</section>
<section class="section section--tight">
  <div class="wrap">
    ${published.length ? `<ul class="articles" role="list">${published.map(a => `<li><a href="/insights/${a.slug}/"><span class="label">${esc(a.date || '')}</span><span class="articles__t">${esc(a.title)}</span><span class="articles__d">${esc(a.description)}</span></a></li>`).join('')}</ul>` : ''}
    ${drafts.length ? `<h2 class="label">In preparation</h2><ul class="articles articles--soon" role="list">${drafts.map(a => `<li><span class="articles__t">${esc(a.title.replace(/\s*\[[^\]]+\]/, ''))}</span><span class="articles__d">${esc(a.description)}</span></li>`).join('')}</ul>` : ''}
  </div>
</section>
${C.closingCta()}`;
  write('/insights/', page({
    path: '/insights/',
    title: 'Insights: Lower North Shore Property Market | Alex Banning',
    description: 'Market notes from Alex Banning on selling prestige homes, auction versus off-market campaigns and the Lane Cove market.',
    jsonld: [breadcrumbSchema([['Home', '/'], ['Insights', '/insights/']])],
    body,
  }), { priority: '0.5' });

  for (const a of published) {
    const url = `/insights/${a.slug}/`;
    write(url, page({
      path: url,
      title: `${a.title} | Alex Banning`,
      description: a.description,
      jsonld: [{
        '@context': 'https://schema.org', '@type': 'Article', headline: a.title, description: a.description,
        datePublished: a.date, author: { '@id': abs('/#person') }, publisher: { '@id': abs('/#alex') }, mainEntityOfPage: abs(url),
      }, breadcrumbSchema([['Home', '/'], ['Insights', '/insights/'], [a.title, url]])],
      body: `${breadcrumbs([['Home', '/'], ['Insights', '/insights/'], [a.title, url]])}
<article class="section"><div class="wrap narrow prose"><p class="label">${esc(a.date || '')}</p><h1 class="display display--xl">${esc(a.title)}</h1>${md(a.body)}</div></article>
${C.closingCta()}`,
    }), { priority: '0.5' });
  }
}

// =====================================================================
// APPRAISAL, CONTACT, LEGAL, THANK YOU, 404
// =====================================================================
function appraisal() {
  const body = `
<section class="section appraisal">
  <div class="wrap appraisal__grid">
    <div class="appraisal__copy">
      <p class="label">Private appraisal</p>
      <h1 class="display display--xl">An honest view of value.</h1>
      <p class="lede">Four short steps. Alex will prepare a considered appraisal using recent comparable sales and the buyers he is speaking with now, and call to discuss it.</p>
      <ul class="ticks">
        <li>Confidential. Nothing is shared or published.</li>
        <li>No obligation, and no cost.</li>
        <li>Advice on method: auction, private treaty or off market.</li>
      </ul>
      <p class="muted">Prefer to talk? <a href="${SITE.phoneHref}">${SITE.phone}</a></p>
    </div>
    <div class="appraisal__form">${C.appraisalForm()}</div>
  </div>
</section>
${C.proofBand(stats, { dark: false })}`;
  write('/appraisal/', page({
    path: '/appraisal/',
    title: 'Request a Private Property Appraisal | Alex Banning',
    description: 'Request a confidential appraisal of your Lower North Shore home from Alex Banning, Raine & Horne Partner Agent. Four short steps, no obligation.',
    jsonld: [breadcrumbSchema([['Home', '/'], ['Appraisal', '/appraisal/']])],
    body,
  }), { priority: '0.9' });
}

function contact() {
  const o = SITE.office;
  const q = encodeURIComponent(`${o.street}, ${o.locality} ${o.region} ${o.postcode}`);
  const body = `
<section class="phero">
  <div class="wrap phero__inner">
    <p class="label">Contact</p>
    <h1 class="display display--xl">Speak with Alex.</h1>
  </div>
</section>
<section class="section section--tight">
  <div class="wrap contact__grid">
    <div>
      <dl class="kv kv--stack kv--lg">
        <div><dt>Mobile</dt><dd><a href="${SITE.phoneHref}">${SITE.phone}</a></dd></div>
        <div><dt>Email</dt><dd><a href="mailto:${SITE.email}">${SITE.email}</a></dd></div>
        <div><dt>Office</dt><dd>${esc(o.street)}<br>${esc(o.locality)} ${o.region} ${o.postcode}</dd></div>
        ${o.hours && o.hours.length ? `<div><dt>Hours</dt><dd>${o.hours.map(h => `${esc(h.days)}: ${esc(h.time)}`).join('<br>')}</dd></div>` : ''}
      </dl>
      <p><a class="btn btn--line" href="/alex-banning.vcf" download>Save contact (vCard)</a></p>
    </div>
    <div>
      <h2 class="h3">Send a message</h2>
      ${C.enquiryForm({ kind: 'contact', subject: 'Website contact', button: 'Send message' })}
    </div>
  </div>
  <div class="wrap map" data-map="https://www.google.com/maps?q=${q}&amp;output=embed">
    <a class="map__link" href="https://www.google.com/maps/search/?api=1&amp;query=${q}" target="_blank" rel="noopener">Open ${esc(o.street)}, ${esc(o.locality)} in Google Maps</a>
  </div>
</section>`;
  write('/contact/', page({
    path: '/contact/',
    title: 'Contact Alex Banning | Raine & Horne Lower North Shore',
    description: `Contact Alex Banning on ${SITE.phone} or ${SITE.email}. Raine & Horne Lower North Shore, ${o.street}, ${o.locality}.`,
    jsonld: [agentSchema(false), breadcrumbSchema([['Home', '/'], ['Contact', '/contact/']])],
    body,
  }), { priority: '0.6' });

  const vcf = [
    'BEGIN:VCARD', 'VERSION:3.0', 'N:Banning;Alex;;;', 'FN:Alex Banning',
    `ORG:${SITE.agency}`, `TITLE:${SITE.jobTitle}`,
    `TEL;TYPE=CELL:+61434131903`, `EMAIL;TYPE=WORK:${SITE.email}`,
    `ADR;TYPE=WORK:;;${o.street};${o.locality};${o.region};${o.postcode};Australia`,
    `URL:${SITE.url}`, 'END:VCARD', '',
  ].join('\r\n');
  fs.writeFileSync(path.join(OUT, 'alex-banning.vcf'), vcf);
}

function legal() {
  const privacy = `
<section class="section"><div class="wrap narrow prose">
<h1 class="display display--xl">Privacy policy</h1>
<p>This policy explains how Alex Banning and ${esc(SITE.agency)} (${esc(SITE.entity)}) handle personal information collected through this website. We comply with the Australian Privacy Principles in the Privacy Act 1988 (Cth).</p>
<h2 class="h2">What we collect</h2>
<p>When you submit a form we collect the details you provide, such as your name, mobile, email, property address and preferences. We also collect standard analytics information about how the site is used.</p>
<h2 class="h2">How we use it</h2>
<p>We use your details to respond to your enquiry, prepare an appraisal, tell you about homes that match your brief, and, only if you ask, send market updates. We do not sell your information.</p>
<h2 class="h2">Marketing and the Spam Act</h2>
<p>We send electronic marketing only with your consent. Every message identifies us and includes a way to unsubscribe, which we honour promptly.</p>
<h2 class="h2">Service providers</h2>
<p>Form submissions are processed by a third-party form service and delivered to ${esc(SITE.email)}. We use Vercel Web Analytics, which counts visits without cookies or personal identifiers. Advertising and analytics tools (Google Analytics, Google Ads and Meta), where enabled, may set cookies to measure the site's performance.</p>
<h2 class="h2">Access and correction</h2>
<p>To access or correct your information, or to make a complaint, contact <a href="mailto:${SITE.email}">${SITE.email}</a> or call ${SITE.phone}.</p>
<p class="note">Last updated ${stats.asAt}. This policy should be reviewed against the Raine &amp; Horne network privacy policy before launch.</p>
</div></section>`;
  write('/privacy/', page({ path: '/privacy/', title: 'Privacy Policy | Alex Banning', description: 'How Alex Banning and Raine & Horne Lower North Shore collect, use and protect your personal information.', body: privacy }), { priority: '0.2' });

  const terms = `
<section class="section"><div class="wrap narrow prose">
<h1 class="display display--xl">Terms of use</h1>
<p>This website is published by Alex Banning of ${esc(SITE.agency)} (${esc(SITE.entity)}). Information on this site is general in nature and is not financial, legal or valuation advice.</p>
<h2 class="h2">Statistics and results</h2>
<p>Statistics are drawn from third-party sources, named beside each figure with the period they cover. Results shown are past results and are not a guarantee of future outcomes. Appraisals are opinions of likely selling price, not formal valuations.</p>
<h2 class="h2">Photography</h2>
<p>${esc(SITE.photoCredit)}. Images may not be reproduced without permission.</p>
<h2 class="h2">Links</h2>
<p>Links to third-party sites are provided for convenience. We are not responsible for their content.</p>
</div></section>`;
  write('/terms/', page({ path: '/terms/', title: 'Terms of Use | Alex Banning', description: 'Terms of use for alex-banning.com.', body: terms }), { priority: '0.2' });

  write('/thank-you/', page({
    path: '/thank-you/', noindex: true, title: 'Thank you | Alex Banning', description: 'Thank you for your enquiry.',
    body: `<section class="section"><div class="wrap narrow center"><p class="label">Received</p><h1 class="display display--xl">Thank you.</h1><p class="lede">Alex will be in touch shortly, usually the same business day. If it is urgent, call <a href="${SITE.phoneHref}">${SITE.phone}</a>.</p><p><a class="btn btn--line" href="/results/">View recent results</a></p></div></section>`,
  }), { sitemap: false });

  write('/404.html', page({
    path: '/404.html', noindex: true, title: 'Page not found | Alex Banning', description: 'Page not found.',
    body: `<section class="section"><div class="wrap narrow center"><p class="label">404</p><h1 class="display display--xl">This page has moved.</h1><p class="lede">Try the <a href="/results/">results</a>, the <a href="/suburbs/">suburb guides</a> or <a href="/">start again</a>.</p></div></section>`,
  }), { sitemap: false });
}

// =====================================================================
// SITEMAP, ROBOTS, LLMS.TXT
// =====================================================================
function meta() {
  const today = new Date().toISOString().slice(0, 10);
  fs.writeFileSync(path.join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(p => `  <url><loc>${abs(p.urlPath)}</loc><lastmod>${today}</lastmod><priority>${p.priority}</priority></url>`).join('\n')}
</urlset>
`);
  fs.writeFileSync(path.join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /thank-you/\n\nSitemap: ${abs('/sitemap.xml')}\n`);
  const r = stats.reviews;
  fs.writeFileSync(path.join(OUT, 'llms.txt'), `# Alex Banning

> Alex Banning is a ${SITE.jobTitle} at ${SITE.agency} (${SITE.entity}), based at ${SITE.office.street}, ${SITE.office.locality} NSW ${SITE.office.postcode}, Sydney, Australia. He has sold real estate since ${stats.yearsSelling.since}.

## Key facts (with sources)
- ${stats.domain.sold} sales worth ${stats.domain.totalValue} in the ${stats.domain.period}; ${stats.domain.auction} at auction, ${stats.domain.privateTreaty} by private treaty (${stats.domain.source}).
- ${stats.rea.sold} sales, median price ${stats.rea.medianPrice}, median ${stats.rea.medianDaysAdvertised} days advertised, ${stats.rea.period} (${stats.rea.source}).
- Reviews: ${r.ratemyagent.rating}/5 from ${r.ratemyagent.count} reviews on RateMyAgent; ${r.realestate.rating.toFixed(1)}/5 from ${r.realestate.count} on realestate.com.au (${r.ratemyagent.asAt}).
- Highest recent sale: 10 Hawthorne Avenue, Chatswood (West), sold at auction on 14 February 2026 for $4,025,000.
- Career: began at Ray White Lane Cove; one of three founding principals of Raine & Horne Lane Cove (opened 1 August 2017).
- Awards: ${awards.awards.filter(a => !a.agency).map(a => `${a.by ? a.by + ' ' : ''}${a.year} ${a.title}`).join('; ')}.
- Areas: ${suburbs.map(s => s.name).join(', ')}.
- Contact: ${SITE.phone}, ${SITE.email}.

## Pages
- [About Alex Banning](${abs('/about/')})
- [Results](${abs('/results/')})
- [Private Collection (off-market homes)](${abs('/private-collection/')})
- [Reviews](${abs('/reviews/')})
- [Request a private appraisal](${abs('/appraisal/')})
${suburbs.map(s => `- [Selling in ${s.name}](${abs('/suburbs/' + s.slug + '/')})`).join('\n')}
`);
}

// =====================================================================
// RUN
// =====================================================================
fs.rmSync(OUT, { recursive: true, force: true });
copyDir(path.join(U.ROOT, 'static'), OUT);
home();
privateCollection();
results();
about();
suburbPages();
reviewsPage();
insightsPages();
appraisal();
contact();
legal();
meta();
const missing = U.REG_BY_ID ? Object.keys(U.REG_BY_ID).filter(id => !hasImage(id)) : [];
console.log(`Built ${pages.length} indexed pages into public/.`);
if (missing.length) console.log(`${missing.length} images not yet processed (placeholders shown). Run: npm run images`);
