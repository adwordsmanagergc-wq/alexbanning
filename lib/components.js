const { esc, pic, firstImage, money } = require('./util');
const { SITE, ICON } = require('./layout');

const src = text => `<span class="src">${esc(text)}</span>`;

// ---------- Cards ----------
function specs(x) {
  const parts = [];
  if (x.beds) parts.push(`${x.beds} bed`);
  if (x.baths) parts.push(`${x.baths} bath`);
  if (x.cars) parts.push(`${x.cars} car`);
  if (x.pool) parts.push('pool');
  return parts.join(' · ');
}

function saleHref(s) {
  return s.caseStudy ? `/results/${s.id}/` : null;
}

function saleCard(s, { showPrice = true, sizes = '(min-width: 900px) 30vw, 80vw', ratio = '4/5' } = {}) {
  const img = firstImage(s.images);
  const href = saleHref(s);
  const price = showPrice && s.price ? s.priceLabel : (s.price ? 'Sold' : s.priceLabel || 'Sold');
  const meta = [s.type, specs(s), s.method, s.dateLabel].filter(Boolean).join(' · ');
  const body = `${pic(img || (s.images || [])[0], { sizes, ratio, alt: `${s.address}, ${s.locality || s.suburb}, sold by Alex Banning` })}
    <div class="card__body">
      <p class="label">Sold · ${esc(s.suburb)}</p>
      <p class="card__price">${esc(price)}</p>
      <h3 class="card__title">${esc(s.address)}</h3>
      ${meta ? `<p class="card__meta">${esc(meta)}</p>` : ''}
      ${s.daysOnMarket ? `<p class="card__meta">${s.daysOnMarket} days on market</p>` : ''}
    </div>`;
  return href
    ? `<a class="card" href="${href}">${body}</a>`
    : `<article class="card">${body}<a class="card__sub" href="/suburbs/${s.suburbSlug}/">${esc(s.suburb)} guide</a></article>`;
}

function listingCard(l, { sizes = '(min-width: 900px) 30vw, 80vw' } = {}) {
  const img = firstImage(l.images);
  const status = l.status === 'off-market' ? 'Off market' : 'For sale';
  return `<article class="card">
    ${pic(img || (l.images || [])[0], { sizes, ratio: '4/5', alt: `${l.address}, ${l.suburb}, ${status.toLowerCase()} with Alex Banning` })}
    <div class="card__body">
      <p class="label">${status} · ${esc(l.suburb)}</p>
      <p class="card__price">${esc(l.priceLabel)}</p>
      <h3 class="card__title">${esc(l.address)}</h3>
      ${specs(l) ? `<p class="card__meta">${esc([l.type, specs(l)].filter(Boolean).join(' · '))}</p>` : ''}
      <p class="card__cta"><a href="${SITE.phoneHref}">Enquire, ${SITE.phone}</a></p>
    </div>
  </article>`;
}

function listingSchema(l) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Offer',
    availability: 'https://schema.org/InStock',
    ...(l.price ? { price: l.price, priceCurrency: 'AUD' } : {}),
    description: l.priceLabel,
    seller: { '@id': SITE.url + '/#alex' },
    itemOffered: {
      '@type': l.type === 'Apartment' ? 'Apartment' : l.type === 'House' ? 'SingleFamilyResidence' : 'Residence',
      name: `${l.address}, ${l.suburb}`,
      address: { '@type': 'PostalAddress', streetAddress: l.address, addressLocality: l.suburb, addressRegion: 'NSW', postalCode: l.postcode, addressCountry: 'AU' },
      ...(l.beds ? { numberOfRooms: l.beds } : {}),
    },
  };
}

// ---------- Forms ----------
const endpoint = () => SITE.forms.endpoint;

function formOpen(kind, subject, extraClass = '') {
  const action = endpoint() || `mailto:${SITE.email}?subject=${encodeURIComponent(subject)}`;
  const enc = endpoint() ? '' : ' enctype="text/plain"';
  return `<form class="form ${extraClass}" action="${esc(action)}" method="POST"${enc} data-lead="${kind}" novalidate>
    <input type="hidden" name="_subject" value="${esc(subject)}">
    <input type="hidden" name="form" value="${kind}">
    <input type="hidden" name="page" value="">
    <input type="hidden" name="_next" value="${SITE.url}/thank-you/">
    <p class="hp" aria-hidden="true"><label>Leave this empty<input type="text" name="_gotcha" tabindex="-1" autocomplete="off"></label></p>`;
}

const consent = () => `<div class="consent">
      <label class="check"><input type="checkbox" name="consent" value="yes" required><span>I agree to Alex Banning and Raine &amp; Horne Lower North Shore contacting me about this enquiry by phone, email or SMS, as set out in the <a href="/privacy/">privacy policy</a>.</span></label>
      <label class="check"><input type="checkbox" name="updates" value="yes"><span>Also send me occasional market updates. I can unsubscribe at any time.</span></label>
    </div>`;

const field = (label, name, type = 'text', attrs = '') =>
  `<label class="field"><span>${label}</span><input type="${type}" name="${name}" ${attrs}></label>`;

const formStatus = `<p class="form__status" role="status" aria-live="polite"></p>`;

function enquiryForm({ kind = 'enquiry', subject = 'Website enquiry', suburb = '', button = 'Start a confidential conversation', compact = false } = {}) {
  return `${formOpen(kind, subject, compact ? 'form--compact' : '')}
    <input type="hidden" name="suburb" value="${esc(suburb)}">
    <div class="form__grid">
      ${field('Name', 'name', 'text', 'required autocomplete="name"')}
      ${field('Mobile', 'phone', 'tel', 'required autocomplete="tel" inputmode="tel"')}
      ${field('Email', 'email', 'email', 'required autocomplete="email"')}
      ${field('Property address <em>(optional)</em>', 'address', 'text', 'autocomplete="street-address" data-places')}
    </div>
    ${compact ? '' : `<label class="field"><span>Anything we should know <em>(optional)</em></span><textarea name="message" rows="3"></textarea></label>`}
    ${consent()}
    <button class="btn btn--solid" type="submit">${button}</button>
    ${formStatus}
  </form>`;
}

const BUDGETS = ['Up to $2M', '$2M to $3M', '$3M to $5M', '$5M to $10M', '$10M and above'];
const REGISTER_SUBURBS = ['Chatswood West', 'Chatswood', 'Longueville', 'Northbridge', 'Castlecrag', 'Mosman', 'Cremorne', 'Hunters Hill', 'Greenwich', 'Riverview', 'Lane Cove'];

function registerForm() {
  return `${formOpen('buyer-register', 'Private buyer register')}
    <div class="form__grid">
      ${field('Name', 'name', 'text', 'required autocomplete="name"')}
      ${field('Email', 'email', 'email', 'required autocomplete="email"')}
      ${field('Mobile', 'phone', 'tel', 'required autocomplete="tel" inputmode="tel"')}
      <label class="field"><span>Budget</span><select name="budget" required><option value="">Select</option>${BUDGETS.map(b => `<option>${b}</option>`).join('')}</select></label>
    </div>
    <fieldset class="chips"><legend>Suburbs of interest</legend>
      ${REGISTER_SUBURBS.map(s => `<label><input type="checkbox" name="suburbs" value="${s}"><span>${s}</span></label>`).join('')}
    </fieldset>
    ${consent()}
    <button class="btn btn--solid" type="submit">Join the private buyer register</button>
    ${formStatus}
  </form>`;
}

function gateForm(listingId) {
  return `${formOpen('private-view', 'Private Collection viewing request', 'form--gate')}
    <input type="hidden" name="listing" value="${esc(listingId)}">
    <div class="form__grid">
      ${field('Name', 'name', 'text', 'required autocomplete="name"')}
      ${field('Mobile', 'phone', 'tel', 'required autocomplete="tel" inputmode="tel"')}
    </div>
    ${consent()}
    <button class="btn btn--solid" type="submit">View the details</button>
    ${formStatus}
  </form>`;
}

function appraisalForm() {
  const radios = (name, opts) => `<div class="options">${opts.map((o, i) =>
    `<label class="opt"><input type="radio" name="${name}" value="${o}"${i === 0 ? ' required' : ''}><span>${o}</span></label>`).join('')}</div>`;
  return `${formOpen('appraisal', 'Private appraisal request', 'form--steps')}
    <input type="hidden" name="suburb" value="">
    <ol class="steps__progress" aria-hidden="true"><li>Address</li><li>Property</li><li>Timing</li><li>Details</li></ol>
    <fieldset class="step" data-step="1">
      <legend><span class="label">Step 1 of 4</span>Which property would you like appraised?</legend>
      ${field('Property address', 'address', 'text', 'required autocomplete="street-address" data-places placeholder="Start typing the address"')}
    </fieldset>
    <fieldset class="step" data-step="2">
      <legend><span class="label">Step 2 of 4</span>Tell us about the home.</legend>
      ${radios('property_type', ['House', 'Townhouse', 'Apartment', 'Land or other'])}
      <label class="field field--short"><span>Bedrooms</span><select name="bedrooms"><option value="">Select</option>${['1', '2', '3', '4', '5', '6 or more'].map(b => `<option>${b}</option>`).join('')}</select></label>
    </fieldset>
    <fieldset class="step" data-step="3">
      <legend><span class="label">Step 3 of 4</span>When might you sell?</legend>
      ${radios('timeframe', ['Within 3 months', '3 to 6 months', '6 to 12 months', 'Just exploring'])}
      <label class="check"><input type="checkbox" name="off_market" value="yes"><span>I would consider a private, off-market sale.</span></label>
    </fieldset>
    <fieldset class="step" data-step="4">
      <legend><span class="label">Step 4 of 4</span>Where should Alex send the appraisal?</legend>
      <div class="form__grid">
        ${field('Name', 'name', 'text', 'required autocomplete="name"')}
        ${field('Mobile', 'phone', 'tel', 'required autocomplete="tel" inputmode="tel"')}
        ${field('Email', 'email', 'email', 'required autocomplete="email"')}
      </div>
      ${consent()}
    </fieldset>
    <div class="steps__nav">
      <button class="btn btn--ghost" type="button" data-prev hidden>Back</button>
      <button class="btn btn--solid" type="button" data-next hidden>Continue</button>
      <button class="btn btn--solid" type="submit" data-submit>Request my private appraisal</button>
    </div>
    ${formStatus}
  </form>`;
}

// ---------- Blocks ----------
function proofBand(stats, { dark = true } = {}) {
  return `<section class="proof${dark ? ' proof--dark' : ''}" aria-label="Track record">
  <div class="wrap proof__grid">
    ${stats.proofBand.map(p => `<div class="proof__item" data-reveal>
      <p class="proof__fig">${esc(p.figure)}</p>
      <p class="proof__label">${esc(p.label)}</p>
      ${src(p.source)}
    </div>`).join('')}
  </div>
</section>`;
}

function quoteRotator(quotes, stats) {
  const n = quotes.length;
  const pad = i => String(i).padStart(2, '0');
  const r = stats.reviews;
  return `<div class="rotator" data-rotator>
    <div class="rotator__track" aria-live="polite">
      ${quotes.map((q, i) => `<figure class="rotator__slide${i === 0 ? ' is-active' : ''}" data-index="${i}"${i ? ' hidden' : ''}>
        <blockquote><p>${esc(q.text)}</p></blockquote>
        <figcaption>${esc(q.who)}, ${esc(q.suburb)}${q.source ? `<span> · ${esc(q.source)}${q.date ? ', ' + esc(q.date) : ''}</span>` : ''}</figcaption>
      </figure>`).join('')}
    </div>
    <div class="rotator__ctrl">
      <button type="button" class="iconbtn" data-prev aria-label="Previous review">${ICON.prev}</button>
      <p class="rotator__count"><span data-count>01</span> / ${pad(n)}</p>
      <button type="button" class="iconbtn" data-next aria-label="Next review">${ICON.next}</button>
    </div>
    <p class="rotator__scores">
      <a href="${SITE.profiles.ratemyagent}" target="_blank" rel="noopener"><strong>${r.ratemyagent.rating}</strong> on RateMyAgent (${r.ratemyagent.count})</a>
      <span aria-hidden="true">·</span>
      <a href="${SITE.profiles.realestate}" target="_blank" rel="noopener"><strong>${r.realestate.rating.toFixed(1)}</strong> on realestate.com.au (${r.realestate.count})</a>
    </p>
    ${src(`RateMyAgent and realestate.com.au, ${r.ratemyagent.asAt}`)}
  </div>`;
}

function awardsMarquee(awards) {
  const items = awards.awards.filter(a => !a.agency).map(a => `<li><span class="yr">${a.year}</span> ${esc(a.by ? a.by + ' ' : '')}${esc(a.title)}</li>`);
  items.push(...awards.ongoing.map(a => `<li>${esc(a.by)} ${esc(a.title)}</li>`));
  const list = items.join('');
  return `<section class="marquee" aria-label="Awards">
  <div class="marquee__track">
    <ul>${list}</ul>
    <ul aria-hidden="true">${list}</ul>
  </div>
</section>`;
}

function aboutFacts(stats, awards) {
  const r = stats.reviews;
  return `<section class="facts" aria-labelledby="facts-h">
  <div class="wrap facts__inner">
    <h2 id="facts-h" class="label">About Alex Banning, in brief</h2>
    <dl class="facts__list">
      <div><dt>Who</dt><dd>Alex Banning, ${esc(SITE.jobTitle)} at ${esc(SITE.agency)} (${esc(SITE.entity)}).</dd></div>
      <div><dt>Where</dt><dd>Based at ${esc(SITE.office.street)}, ${esc(SITE.office.locality)} NSW. Sells across Sydney's Lower North Shore, including Lane Cove, Chatswood, Chatswood West, Longueville, Northbridge, Castlecrag, Mosman and Cremorne.</dd></div>
      <div><dt>Since</dt><dd>Selling real estate since ${stats.yearsSelling.since} (${stats.yearsSelling.value} years, ${esc(stats.yearsSelling.source)}, ${esc(stats.yearsSelling.asAt)}). Began at Ray White Lane Cove; one of three founding principals of Raine &amp; Horne Lane Cove in 2017.</dd></div>
      <div><dt>Results</dt><dd>${stats.domain.sold} sales worth ${esc(stats.domain.totalValue)}, ${stats.domain.auction} at auction (${esc(stats.domain.source)}, ${esc(stats.domain.period)}). ${stats.rea.sold} sales with a median of ${stats.rea.medianDaysAdvertised} days advertised (${esc(stats.rea.source)}, ${esc(stats.rea.period)}). Highest recent sale: 10 Hawthorne Avenue, Chatswood, $4,025,000 at auction, February 2026.</dd></div>
      <div><dt>Reviews</dt><dd>${r.ratemyagent.rating} stars from ${r.ratemyagent.count} reviews on RateMyAgent; ${r.realestate.rating.toFixed(1)} stars from ${r.realestate.count} reviews on realestate.com.au (${esc(r.ratemyagent.asAt)}).</dd></div>
      <div><dt>Awards</dt><dd>${awards.awards.filter(a => !a.agency).slice(0, 5).map(a => `${esc(a.by)} ${a.year} ${esc(a.title)}`).join('; ')}.</dd></div>
      <div><dt>Contact</dt><dd><a href="${SITE.phoneHref}">${SITE.phone}</a> · <a href="mailto:${SITE.email}">${SITE.email}</a></dd></div>
    </dl>
  </div>
</section>`;
}

function closingCta({ heading = 'Considering a sale in the next twelve months?', sub = 'A confidential conversation costs nothing.', suburb = '' } = {}) {
  return `<section class="closing" aria-labelledby="closing-h">
  <div class="wrap closing__grid">
    <div class="closing__copy">
      <p class="label label--light">Private appraisal</p>
      <h2 id="closing-h" class="display">${esc(heading)}</h2>
      <p class="lede">${esc(sub)}</p>
      <p class="closing__direct">Or call Alex directly<br><a href="${SITE.phoneHref}">${SITE.phone}</a></p>
    </div>
    <div class="closing__form">
      ${enquiryForm({ kind: 'closing', subject: `Confidential conversation${suburb ? ' (' + suburb + ')' : ''}`, suburb, compact: true, button: 'Request a confidential call' })}
    </div>
  </div>
</section>`;
}

function sectionHead({ label, title, intro, id, link }) {
  return `<header class="shead">
      ${label ? `<p class="label">${label}</p>` : ''}
      <h2 class="display"${id ? ` id="${id}"` : ''}>${title}</h2>
      ${intro ? `<p class="lede">${intro}</p>` : ''}
      ${link ? `<a class="more" href="${link[1]}">${link[0]} ${ICON.arrow}</a>` : ''}
    </header>`;
}

function carousel(cards, label) {
  return `<div class="carousel" data-carousel>
    <div class="carousel__ctrl">
      <button type="button" class="iconbtn" data-prev aria-label="Scroll ${label} back">${ICON.prev}</button>
      <button type="button" class="iconbtn" data-next aria-label="Scroll ${label} forward">${ICON.next}</button>
    </div>
    <ul class="carousel__track" role="list" tabindex="0" aria-label="${label}">
      ${cards.map(c => `<li>${c}</li>`).join('')}
    </ul>
  </div>`;
}

module.exports = {
  src, specs, saleCard, listingCard, listingSchema, enquiryForm, registerForm, gateForm, appraisalForm,
  proofBand, quoteRotator, awardsMarquee, aboutFacts, closingCta, sectionHead, carousel, money,
};
