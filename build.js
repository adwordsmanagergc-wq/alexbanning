const fs = require('fs');
const path = require('path');

const PHONE = '0434 131 903';
const PHONE_HREF = 'tel:+61434131903';
const EMAIL = 'alex.banning@rh.com.au';
const OFFICES = [
  { name: 'Lane Cove', addr: '69 Longueville Road, Lane Cove NSW 2066' },
  { name: 'Willoughby', addr: '293 Penshurst Street, Willoughby NSW 2068' },
  { name: 'Mosman', addr: '145 Middle Head Road, Mosman NSW 2088' },
  { name: 'Northbridge', addr: '79 Sailors Bay Road, Northbridge NSW 2063' },
];

const RECENT_SALES = [
  { suburb: 'Cremorne', address: '2/34 Tobruk Avenue, Cremorne', price: '$2,330,000', date: 'Nov 2025', url: 'https://www.raineandhorne.com.au/lns/properties/2-34-tobruk-avenue-cremorne-2090-new-south-wales' },
  { suburb: 'Lane Cove', address: '404B/84 Gordon Crescent, Lane Cove', price: '$1,120,000', date: 'Jun 2025', url: 'https://www.raineandhorne.com.au/lns/properties/404b-84-gordon-crescent-lane-cove-2066-new-south-wales' },
  { suburb: 'Lane Cove', address: '60/302 Burns Bay Road, Lane Cove', price: '$995,000', date: 'Aug 2024', url: 'https://www.raineandhorne.com.au/lns/properties/60-302-burns-bay-road-lane-cove-2066-new-south-wales' },
  { suburb: 'Lane Cove', address: '55/300A Burns Bay Road, Lane Cove', price: '$925,000', date: 'Aug 2025', url: 'https://www.raineandhorne.com.au/lns/properties/55-300a-burns-bay-road-lane-cove-2066-new-south-wales' },
  { suburb: 'Lane Cove', address: '219/15 Willandra Street, Lane Cove', price: '$890,000', date: 'Feb 2024', url: 'https://www.raineandhorne.com.au/lns/properties/219-15-willandra-street-lane-cove-2066-new-south-wales' },
  { suburb: 'Lane Cove', address: '406/10 Waterview Drive, Lane Cove', price: '$860,000', date: 'Nov 2024', url: 'https://www.raineandhorne.com.au/lns/properties/406-10-waterview-drive-lane-cove-2066-new-south-wales' },
  { suburb: 'Lane Cove', address: '8/38 Cope Street, Lane Cove', price: '$820,000', date: 'Dec 2025', url: 'https://www.raineandhorne.com.au/lns/properties/8-38-cope-street-lane-cove-2066-new-south-wales' },
  { suburb: 'Lane Cove', address: '7/106 Burns Bay Road, Lane Cove', price: '$765,000', date: 'Aug 2025', url: 'https://www.raineandhorne.com.au/lns/properties/7-106-burns-bay-road-lane-cove-2066-new-south-wales' },
  { suburb: 'Lane Cove', address: '59/31-39 Mindarie Street, Lane Cove', price: '$660,000', date: 'Feb 2025', url: 'https://www.raineandhorne.com.au/lns/properties/59-31-39-mindarie-street-lane-cove-2066-new-south-wales' },
];

const renderSaleCards = (sales) => sales.map(s => {
  const slug = s.address.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  return `<a class="sale-card" href="${s.url}" target="_blank" rel="noopener" aria-label="${s.address} — sold ${s.price} ${s.date}">
    <div class="sale-card-image" style="background-image: url('/assets/img/sales/${slug}.jpg');"></div>
    <div class="sale-card-body">
      <p class="eyebrow">${s.suburb}</p>
      <h3>${s.price}</h3>
      <p class="muted">${s.address.replace(', ' + s.suburb, '')}</p>
      <p class="tag">Sold · ${s.date}</p>
    </div>
  </a>`;
}).join('');

const SUBURBS = [
  { slug: 'lane-cove', name: 'Lane Cove', postcode: '2066', tone: 'volume', neighbours: ['lane-cove-north','lane-cove-west','linley-point','longueville','riverview','greenwich'], streets: 'Longueville Road, Centennial Avenue, Mowbray Road and Burns Bay Road', specialty: 'federation homes, premium apartments and family residences', hook: 'Lane Cove’s most recommended agent on realestate.com.au and a consistent street-record holder.' },
  { slug: 'mosman', name: 'Mosman', postcode: '2088', tone: 'prestige', neighbours: ['cremorne','neutral-bay','northbridge','castlecrag','middle-cove'], streets: 'Beauty Point, Balmoral, Middle Head Road and the harbourside pockets above Chinamans Beach', specialty: 'harbour-front homes, federation residences and prestige apartments', hook: 'Discreet, record-setting representation backed by a private buyer database.' },
  { slug: 'cremorne', name: 'Cremorne', postcode: '2090', tone: 'village', neighbours: ['mosman','neutral-bay','northbridge','cammeray'], streets: 'Cremorne Point, Murdoch Street, Spofforth Street and Military Road', specialty: 'Art Deco apartments, period homes and harbour-glimpse residences', hook: 'A village market with genuine depth — done quietly and well.' },
  { slug: 'neutral-bay', name: 'Neutral Bay', postcode: '2089', tone: 'apartments', neighbours: ['cremorne','mosman','kirribilli','north-sydney','cammeray'], streets: 'Wycombe Road, Ben Boyd Road, Kurraba Road and Military Road', specialty: 'security apartment buildings, period units, terraces and family homes', hook: 'City access, ferry connection and village amenity — calibrated campaigns for a distinct buyer pool.' },
  { slug: 'kirribilli', name: 'Kirribilli', postcode: '2061', tone: 'heritage-harbour', neighbours: ['milsons-point','lavender-bay','mcmahons-point','north-sydney','neutral-bay'], streets: 'Carabella Street, Broughton Street, Holbrook Avenue and Kirribilli Avenue', specialty: 'heritage Art Deco apartments, harbour-front terraces and architectural homes', hook: 'Heritage, harbour and a buyer pool that knows what it wants.' },
  { slug: 'milsons-point', name: 'Milsons Point', postcode: '2061', tone: 'harbour-apartments', neighbours: ['kirribilli','lavender-bay','mcmahons-point','north-sydney'], streets: 'Alfred Street, Glen Street, Lavender Street and Bay View Street', specialty: 'harbour-view apartments, heritage stock and bridge-side residences', hook: 'Bridge views, ferry access and a buyer pool that arrives ready to compete.' },
  { slug: 'lavender-bay', name: 'Lavender Bay', postcode: '2060', tone: 'tightly-held', neighbours: ['milsons-point','mcmahons-point','kirribilli','north-sydney','waverton'], streets: 'Walker Street, Middlemiss Street, King George Street and Lavender Street', specialty: 'harbour-front houses and tightly held heritage apartments', hook: 'A small, tightly held market where every campaign matters.' },
  { slug: 'mcmahons-point', name: 'McMahons Point', postcode: '2060', tone: 'peninsula', neighbours: ['lavender-bay','milsons-point','kirribilli','north-sydney','waverton'], streets: 'Blues Point Road, Henry Lawson Avenue, Bank Street and Union Street', specialty: 'Victorian terraces, harbour-front apartments and peninsula houses', hook: 'One of Sydney’s most distinctive small markets.' },
  { slug: 'waverton', name: 'Waverton', postcode: '2060', tone: 'family', neighbours: ['wollstonecraft','mcmahons-point','lavender-bay','north-sydney','crows-nest'], streets: 'Bay Road, Larkin Street, Carr Street and Bayview Avenue', specialty: 'federation homes, post-war family houses and harbour-glimpse apartments', hook: 'Family streets, harbour pockets and a strong school-led buyer pool.' },
  { slug: 'wollstonecraft', name: 'Wollstonecraft', postcode: '2065', tone: 'family', neighbours: ['waverton','crows-nest','st-leonards','greenwich','naremburn'], streets: 'Shirley Road, Berry Street, Belgrave Street and Holtermann Street', specialty: 'period family homes, character apartments and modern townhouses', hook: 'Family streets, professional buyers, premium results.' },
  { slug: 'crows-nest', name: 'Crows Nest', postcode: '2065', tone: 'lifestyle', neighbours: ['st-leonards','naremburn','cammeray','north-sydney','wollstonecraft'], streets: 'Willoughby Road, Alexander Street, Ernest Street and Falcon Street', specialty: 'terraces, modern apartments and village townhouses', hook: 'A village that punches well above its weight — now reshaped by metro.' },
  { slug: 'north-sydney', name: 'North Sydney', postcode: '2060', tone: 'apartments', neighbours: ['kirribilli','milsons-point','neutral-bay','cammeray','crows-nest','waverton'], streets: 'Walker Street, Miller Street, McLaren Street and Mount Street', specialty: 'premium apartment buildings, heritage terraces and edge-of-village houses', hook: 'One of the LNS’s most active apartment markets — building-specific judgement matters.' },
  { slug: 'cammeray', name: 'Cammeray', postcode: '2062', tone: 'family', neighbours: ['naremburn','crows-nest','northbridge','north-sydney','cremorne'], streets: 'Amherst Street, Park Avenue, Palmer Street and Warringah Road', specialty: 'federation homes, family houses, period apartments and townhouses', hook: 'Family streets, golf-course pockets and a buyer pool that knows what it wants.' },
  { slug: 'naremburn', name: 'Naremburn', postcode: '2065', tone: 'federation', neighbours: ['cammeray','crows-nest','willoughby','artarmon','northbridge'], streets: 'Slade Street, Central Street, Park Road and Smith Street', specialty: 'worker’s cottages, federation homes and modern infill', hook: 'A village pocket with rare turnover and high vendor expectations.' },
  { slug: 'northbridge', name: 'Northbridge', postcode: '2063', tone: 'family-architectural', neighbours: ['castlecrag','middle-cove','castle-cove','cammeray','willoughby'], streets: 'Sailors Bay Road, Eastern Valley Way, Strathallen Avenue and the streets above the marina', specialty: 'architectural homes, federation residences and harbour-front houses', hook: 'One of the LNS’s premier family markets — architectural homes, large blocks and waterway access.' },
  { slug: 'willoughby', name: 'Willoughby', postcode: '2068', tone: 'family-village', neighbours: ['artarmon','naremburn','northbridge','castlecrag','chatswood'], streets: 'High Street, Penshurst Street, Edinburgh Road and Mowbray Road', specialty: 'federation cottages, California bungalows, family-renovated homes and modern townhouses', hook: 'A village market with deep buyer demand and consistent capital growth.' },
  { slug: 'artarmon', name: 'Artarmon', postcode: '2064', tone: 'family-investment', neighbours: ['willoughby','chatswood','st-leonards','naremburn'], streets: 'Hampden Road, Cleveland Street, Wilkes Avenue and McMillan Road', specialty: 'federation homes, post-war family houses and apartment stock', hook: 'Strong school zones, train access and a diverse buyer pool.' },
  { slug: 'chatswood', name: 'Chatswood', postcode: '2067', tone: 'apartments-diverse', neighbours: ['artarmon','willoughby','roseville','st-leonards'], streets: 'Help Street, Anderson Street, Victoria Avenue and Archer Street', specialty: 'premium apartment buildings, family streets and townhouse developments', hook: 'One of the LNS’s largest and most active markets — deep buyer demand across stock types.' },
  { slug: 'st-leonards', name: 'St Leonards', postcode: '2065', tone: 'apartments-investment', neighbours: ['crows-nest','wollstonecraft','artarmon','naremburn'], streets: 'Pacific Highway, Atchison Street, River Road and Park Road', specialty: 'premium apartment buildings, townhouses and lifestyle properties', hook: 'A market reshaped by metro, with strong investor and downsizer demand.' },
  { slug: 'greenwich', name: 'Greenwich', postcode: '2065', tone: 'hidden-waterfront', neighbours: ['riverview','longueville','wollstonecraft','lane-cove'], streets: 'Greenwich Road, Mitchell Street, Kingslangley Road and George Street', specialty: 'waterfront houses, large family blocks and tightly held streets', hook: 'One of the LNS’s quietest premium markets.' },
  { slug: 'riverview', name: 'Riverview', postcode: '2066', tone: 'prestige-family', neighbours: ['longueville','greenwich','lane-cove','linley-point'], streets: 'Tambourine Bay Road, Stuart Street, Wharf Road and the streets above Tambourine Bay', specialty: 'prestige family homes, waterfront properties and large-block residences', hook: 'Family prestige, quietly handled — close to St Ignatius’.' },
  { slug: 'longueville', name: 'Longueville', postcode: '2066', tone: 'blue-chip-waterfront', neighbours: ['riverview','linley-point','greenwich','lane-cove'], streets: 'Stuart Street, Arabella Street, Kenneth Street and Mary Street', specialty: 'deep-water frontages and tightly held family streets', hook: 'Discretion, judgement, results — one of the LNS’s most rarefied markets.' },
  { slug: 'linley-point', name: 'Linley Point', postcode: '2066', tone: 'boutique-waterfront', neighbours: ['longueville','riverview','greenwich','lane-cove-west'], streets: 'Mary Street, Decarle Street and Hill Street', specialty: 'waterfront houses and prestige family residences', hook: 'A boutique waterfront market with rare turnover.' },
  { slug: 'lane-cove-north', name: 'Lane Cove North', postcode: '2066', tone: 'apartments-family', neighbours: ['lane-cove','lane-cove-west','artarmon','greenwich','chatswood'], streets: 'Centennial Avenue, Mowbray Road, Pacific Highway and Mindarie Street', specialty: 'modern apartment buildings, townhouses and family streets', hook: 'A high-turnover apartment and townhouse market with strong family demand.' },
  { slug: 'lane-cove-west', name: 'Lane Cove West', postcode: '2066', tone: 'family', neighbours: ['lane-cove','lane-cove-north','linley-point','riverview','longueville'], streets: 'Cullen Street, Karilla Avenue, Greenlands Road and Mars Road', specialty: 'family homes, period houses and townhouses', hook: 'Quiet family streets, large blocks and a buyer pool that values exactly that.' },
  { slug: 'castlecrag', name: 'Castlecrag', postcode: '2068', tone: 'architectural', neighbours: ['middle-cove','castle-cove','northbridge','willoughby'], streets: 'Edinburgh Road, The Bulwark, The Citadel, The Rampart and The Postern', specialty: 'Walter Burley Griffin homes, architectural houses and waterfront properties', hook: 'A market for the architecturally literate buyer.' },
  { slug: 'middle-cove', name: 'Middle Cove', postcode: '2068', tone: 'family-bushland', neighbours: ['castlecrag','castle-cove','northbridge','willoughby','roseville'], streets: 'Sugarloaf Crescent, Eastern Valley Way and Rembrandt Drive', specialty: 'large family blocks, bushland-edge houses and architectural homes', hook: 'A quiet family market with sustained demand for space and privacy.' },
  { slug: 'castle-cove', name: 'Castle Cove', postcode: '2069', tone: 'family-waterfront', neighbours: ['middle-cove','castlecrag','roseville','northbridge'], streets: 'Deepwater Road, Mooramie Avenue, Babbage Road and Eastern Valley Way', specialty: 'family homes and waterfront residences in tightly held pockets', hook: 'Bushland-edge homes, waterfront pockets and a discerning family buyer pool.' },
  { slug: 'roseville', name: 'Roseville', postcode: '2069', tone: 'federation-family', neighbours: ['castle-cove','chatswood','middle-cove','willoughby'], streets: 'Archbold Road, Boundary Street, Lord Street and Bancroft Avenue', specialty: 'federation homes, post-war family residences and prestige pockets', hook: 'Heritage federation streetscapes, school-led demand and family buyers ready to compete.' },
];

const slugToName = Object.fromEntries(SUBURBS.map(s => [s.slug, s.name]));

const baseHead = (title, description, canonicalPath) => `<!doctype html>
<html lang="en-AU">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>
<meta name="description" content="${description}">
<link rel="canonical" href="https://alexbanning.com.au${canonicalPath}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:type" content="website">
<meta property="og:locale" content="en_AU">
<meta name="theme-color" content="#0F1B2D">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap">
<link rel="stylesheet" href="/assets/css/styles.css?v=7">
</head>
<body>`;

const nav = (depth = 0) => {
  const p = '/';
  return `<header class="site-header" id="siteHeader">
  <div class="container header-inner">
    <a class="brand" href="${p}"><span class="brand-mark">AB</span><span class="brand-name">Alex Banning</span></a>
    <nav class="primary-nav" aria-label="Primary">
      <a href="${p}about/">About</a>
      <a href="${p}lower-north-shore/">Suburbs</a>
      <a href="${p}recent-sales/">Recent Sales</a>
      <a href="${p}testimonials/">Testimonials</a>
      <a href="${p}contact/">Contact</a>
      <a class="nav-cta" href="${p}appraisal/">Free Appraisal</a>
    </nav>
    <button class="nav-toggle" aria-label="Open menu" aria-controls="mobileMenu" aria-expanded="false">
      <span></span><span></span><span></span>
    </button>
  </div>
  <div class="mobile-menu" id="mobileMenu" hidden>
    <a href="${p}about/">About</a>
    <a href="${p}lower-north-shore/">Suburbs</a>
    <a href="${p}recent-sales/">Recent Sales</a>
    <a href="${p}testimonials/">Testimonials</a>
    <a href="${p}contact/">Contact</a>
    <a class="nav-cta" href="${p}appraisal/">Free Appraisal</a>
    <a class="nav-tel" href="${PHONE_HREF}">Call ${PHONE}</a>
  </div>
</header>
<a class="sticky-call" href="${PHONE_HREF}" aria-label="Call Alex Banning">
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
  <span>Call Alex</span>
</a>`;
};

const footer = () => `<footer class="site-footer">
  <div class="container footer-grid">
    <div class="footer-brand">
      <div class="brand-mark big">AB</div>
      <p class="footer-tag">Partner Agent &amp; Director<br>Raine &amp; Horne Lower North Shore</p>
      <p><a href="${PHONE_HREF}">${PHONE}</a><br><a href="mailto:${EMAIL}">${EMAIL}</a></p>
    </div>
    <div class="footer-col">
      <h4>Offices</h4>
      <ul class="plain-list">
        ${OFFICES.map(o => `<li><strong>${o.name}</strong><br>${o.addr}</li>`).join('')}
      </ul>
    </div>
    <div class="footer-col">
      <h4>Explore</h4>
      <ul class="plain-list">
        <li><a href="/about/">About Alex</a></li>
        <li><a href="/lower-north-shore/">Suburb Guides</a></li>
        <li><a href="/recent-sales/">Recent Sales</a></li>
        <li><a href="/testimonials/">Testimonials</a></li>
        <li><a href="/appraisal/">Free Appraisal</a></li>
        <li><a href="/contact/">Contact</a></li>
      </ul>
    </div>
    <div class="footer-col">
      <h4>Compliance</h4>
      <p class="small">Banning Enterprises Pty Ltd, trading as Raine &amp; Horne Lower North Shore. Licensed Agent. Real Estate Licence No. [INSERT LICENCE].</p>
      <ul class="plain-list small">
        <li><a href="/privacy/">Privacy Policy</a></li>
        <li><a href="/terms/">Terms of Use</a></li>
      </ul>
    </div>
  </div>
  <div class="container footer-base">
    <p>&copy; ${new Date().getFullYear()} Alex Banning. All rights reserved.</p>
  </div>
</footer>
<script src="/assets/js/main.js" defer></script>
</body></html>`;

const appraisalForm = (suburb = '', variant = 'inline') => {
  const action = '/thank-you/';
  const suburbValue = suburb ? ` value="${suburb}"` : '';
  return `<form class="appraisal-form ${variant}" method="POST" action="${action}" data-form="appraisal">
  <input type="hidden" name="suburb" id="formSuburb"${suburbValue}>
  <div class="grid-2">
    <label>Property address<input type="text" name="address" required autocomplete="street-address" placeholder="e.g. 12 Mowbray Road, Lane Cove"></label>
    <label>Full name<input type="text" name="name" required autocomplete="name"></label>
    <label>Mobile<input type="tel" name="phone" required autocomplete="tel" pattern="[0-9 +()-]{8,}"></label>
    <label>Email<input type="email" name="email" required autocomplete="email"></label>
  </div>
  <label class="select-label">Timeframe to sell
    <select name="timeframe">
      <option>Just curious</option><option>1–3 months</option><option>3–6 months</option><option>6–12 months</option>
    </select>
  </label>
  <label class="checkbox"><input type="checkbox" name="consent" required> I consent to Alex Banning contacting me about this appraisal.</label>
  <button type="submit" class="btn btn-primary btn-block">Request my appraisal</button>
  <p class="form-note">Confidential. Used only to prepare your appraisal.</p>
</form>`;
};

const breadcrumbs = (items) => {
  const itemList = items.map((it, i) => `{"@type":"ListItem","position":${i+1},"name":"${it.name}","item":"https://alexbanning.com.au${it.url}"}`).join(',');
  return `<script type="application/ld+json">{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[${itemList}]}<\/script>`;
};

const realEstateAgentSchema = `<script type="application/ld+json">{"@context":"https://schema.org","@type":"RealEstateAgent","name":"Alex Banning","url":"https://alexbanning.com.au","telephone":"${PHONE}","email":"${EMAIL}","jobTitle":"Partner Agent & Director","worksFor":{"@type":"RealEstateAgent","name":"Raine & Horne Lower North Shore"},"areaServed":${JSON.stringify(SUBURBS.map(s=>s.name))}}<\/script>`;

// ===== HOME =====
const homeHTML = baseHead(
  'Alex Banning | Top-Selling Real Estate Agent — Lower North Shore',
  'Alex Banning is the Lower North Shore’s most recommended agent, holding block, street and suburb records since 2009. Request your free market appraisal.',
  '/'
) + nav() + `
<main>
  <section class="hero hero-home hero-split">
    <div class="container hero-split-inner">
      <div class="hero-copy">
        <p class="eyebrow">Raine &amp; Horne Lower North Shore — Partner Agent</p>
        <h1>The Lower North Shore’s most recommended agent.</h1>
        <p class="lede">Alex Banning has been quietly setting the benchmark across Sydney’s Lower North Shore since 2009 — holding block, street and suburb records, and consistently ranked among Australia’s leading sales agents.</p>
        <div class="hero-ctas">
          <a class="btn btn-primary" href="/appraisal/">Request a free market appraisal</a>
          <a class="btn btn-ghost" href="/recent-sales/">View recent record sales</a>
        </div>
      </div>
      <div class="hero-portrait">
        <img src="/Alex-banning-hero.jpeg" alt="Alex Banning, Director — Raine &amp; Horne Lower North Shore" loading="eager" fetchpriority="high">
      </div>
    </div>
  </section>

  <section class="trust-strip">
    <div class="container trust-grid">
      <div><strong>Since 2009</strong><span>Selling on the Lower North Shore</span></div>
      <div><strong>Records held</strong><span>Block, street and suburb records</span></div>
      <div><strong>#1 in Lane Cove</strong><span>Most recommended on realestate.com.au</span></div>
      <div><strong>Top performer</strong><span>Within the Raine &amp; Horne network</span></div>
    </div>
  </section>

  <section class="section about-strip">
    <div class="container two-col">
      <div>
        <p class="eyebrow">About Alex</p>
        <h2 class="display">A different standard of representation.</h2>
      </div>
      <div class="prose">
        <p>Real estate at the top of the market is rarely about the loudest voice in the room. For Alex Banning, it’s about preparation, judgement, and a steadfast commitment to the result his clients deserve.</p>
        <p>As a Director of Raine &amp; Horne Lower North Shore, Alex has built a reputation for delivering record prices across both apartment and house markets — from harbourside homes in Mosman and Northbridge, to landmark federation residences in Lane Cove and architectural terraces in Kirribilli.</p>
        <p>His clients return to him, and refer their friends to him, because he treats every campaign as if it were his own.</p>
        <p><a class="link-arrow" href="/about/">Read more about Alex →</a></p>
      </div>
    </div>
  </section>

  <section class="section section-tinted" id="map">
    <div class="container">
      <div class="section-head">
        <p class="eyebrow">Lower North Shore</p>
        <h2 class="display">Selling on the Lower North Shore? Start with your suburb.</h2>
        <p class="lede">Every street tells a different story. Choose your suburb to see the latest median values, recent record sales, and a tailored market appraisal from Alex.</p>
      </div>
      <form class="suburb-picker" onsubmit="event.preventDefault(); var v=this.suburb.value; if(v) location.href=v;">
        <label for="suburbSelect" class="visually-hidden">Choose your suburb</label>
        <select id="suburbSelect" name="suburb" onchange="if(this.value) location.href=this.value;">
          <option value="">Choose your suburb…</option>
          ${SUBURBS.map(s => `<option value="/lower-north-shore/${s.slug}/">${s.name} · ${s.postcode}</option>`).join('')}
        </select>
        <button type="submit" class="btn btn-primary">Go</button>
      </form>
      <p class="text-center muted-link"><a href="/lower-north-shore/">Or view the full Lower North Shore guide →</a></p>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <div class="section-head">
        <p class="eyebrow">Recent record sales</p>
        <h2 class="display">Results that re-set the benchmark.</h2>
        <p class="lede">A small selection of recent campaigns. Many of Alex’s strongest results are sold off-market — speak with him directly for the full picture.</p>
      </div>
      <div class="card-grid">
        ${renderSaleCards(RECENT_SALES.slice(0, 6))}
      </div>
      <p class="text-center"><a class="btn btn-ghost" href="/recent-sales/">View all recent sales</a></p>
    </div>
  </section>

  <section class="section section-cta">
    <div class="container two-col">
      <div>
        <p class="eyebrow">Free appraisal</p>
        <h2 class="display">What is your home worth in today’s market?</h2>
        <p>Get a confidential, obligation-free market appraisal from the Lower North Shore’s most recommended agent. We’ll review recent comparable sales, current buyer demand, and the right campaign strategy for your home.</p>
        <ul class="check-list">
          <li>Confidential and obligation-free</li>
          <li>Evidence-led pricing using recent comparables</li>
          <li>A tailored go-to-market plan, public, hybrid or off-market</li>
        </ul>
      </div>
      <div class="form-card">${appraisalForm()}</div>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <div class="section-head">
        <p class="eyebrow">Testimonials</p>
        <h2 class="display">In their own words.</h2>
      </div>
      <div class="quote-grid">
        <blockquote>
          <p>“Alex was nothing short of efficient, knowledgeable and professional throughout the process of us buying an apartment in Lane Cove North. He clearly works with integrity and we appreciated his straight talking approach.”</p>
          <cite>Jenny · Buyer · Lane Cove North</cite>
        </blockquote>
        <blockquote>
          <p>“Clear advice, no inflated promises, and a result above what other agents had quoted. We couldn’t recommend Alex more highly.”</p>
          <cite>Vendor · Lane Cove</cite>
        </blockquote>
        <blockquote>
          <p>“Discreet, prepared, and thoughtful at every step. Exactly what you want when selling a family home.”</p>
          <cite>Vendor · Mosman</cite>
        </blockquote>
      </div>
      <p class="text-center"><a class="btn btn-ghost" href="/testimonials/">Read more reviews</a></p>
    </div>
  </section>

  <section class="section section-tinted">
    <div class="container">
      <div class="section-head">
        <p class="eyebrow">Recognition</p>
        <h2 class="display">Consistently ranked among Australia’s best.</h2>
      </div>
      <div class="badge-grid">
        <div class="badge"><strong>Top performer</strong><span>Raine &amp; Horne national network</span></div>
        <div class="badge"><strong>Most recommended</strong><span>Lane Cove on realestate.com.au</span></div>
        <div class="badge"><strong>Multiple records</strong><span>Block, street and suburb across the LNS</span></div>
        <div class="badge"><strong>Since 2009</strong><span>Continuous representation on the LNS</span></div>
      </div>
    </div>
  </section>

  <section class="section section-final">
    <div class="container text-center">
      <p class="eyebrow">Ready when you are</p>
      <h2 class="display">Twelve months out, or just curious.</h2>
      <p class="lede">Whether you’re weighing a sale or simply want a credible figure on your home, Alex would be glad to share his perspective.</p>
      <div class="hero-ctas center">
        <a class="btn btn-primary" href="/appraisal/">Request a free appraisal</a>
        <a class="btn btn-ghost" href="${PHONE_HREF}">Call ${PHONE}</a>
      </div>
    </div>
  </section>
</main>
${realEstateAgentSchema}
${breadcrumbs([{name:'Home',url:'/'}])}
` + footer();

// ===== HUB =====
const hubHTML = baseHead(
  'Lower North Shore Real Estate — Suburb Guides &amp; Free Appraisals | Alex Banning',
  'Suburb-by-suburb Lower North Shore guides from Alex Banning, the area’s most recommended agent. Median prices, recent sales and a free market appraisal in your suburb.',
  '/lower-north-shore/'
) + nav() + `
<main>
  <section class="hero hero-sub">
    <div class="container hero-inner">
      <p class="eyebrow">Lower North Shore</p>
      <h1>Suburb guides &amp; free market appraisals.</h1>
      <p class="lede">Twenty-nine suburbs, one agent. Alex Banning has sold across the Lower North Shore since 2009 — from harbour-front Mosman to federation-rich Roseville. Choose your suburb below.</p>
    </div>
  </section>
  <section class="section">
    <div class="container">
      <div class="suburb-grid large">
        ${SUBURBS.map(s => `<a class="suburb-tile" href="/lower-north-shore/${s.slug}/">
          <span class="suburb-tile-name">${s.name}</span>
          <span class="suburb-tile-meta">${s.postcode}</span>
          <span class="suburb-tile-hook">${s.hook}</span>
        </a>`).join('')}
      </div>
    </div>
  </section>
  <section class="section section-cta">
    <div class="container two-col">
      <div>
        <p class="eyebrow">Free appraisal</p>
        <h2 class="display">Not sure which suburb fits your campaign?</h2>
        <p>If your property sits on a boundary or you own across multiple LNS suburbs, Alex will provide a tailored, evidence-led view across each market.</p>
      </div>
      <div class="form-card">${appraisalForm()}</div>
    </div>
  </section>
</main>
${realEstateAgentSchema}
${breadcrumbs([{name:'Home',url:'/'},{name:'Lower North Shore',url:'/lower-north-shore/'}])}
` + footer();

// ===== ABOUT =====
const aboutHTML = baseHead(
  'About Alex Banning | Director, Raine &amp; Horne Lower North Shore',
  'Director of Raine &amp; Horne Lower North Shore, holding block, street and suburb records since 2009. The most recommended agent in Lane Cove on realestate.com.au.',
  '/about/'
) + nav() + `
<main>
  <section class="hero hero-sub">
    <div class="container hero-inner">
      <p class="eyebrow">About</p>
      <h1>Alex Banning.</h1>
      <p class="lede">Partner Agent and Director of Raine &amp; Horne Lower North Shore. Setting the benchmark across Sydney’s Lower North Shore since 2009.</p>
    </div>
  </section>
  <section class="section">
    <div class="container narrow prose">
      <p>Alex Banning has spent more than fifteen years selling Lower North Shore homes. As a Director of Raine &amp; Horne Lower North Shore — and Director of Banning Enterprises Pty Ltd — he is one of the network’s most consistent top performers and the holder of multiple block, street and suburb records.</p>
      <h2>Philosophy</h2>
      <p>The market rewards judgement, preparation and discipline — not noise. Alex’s campaigns are calibrated to the property and its likely audience, not a one-size-fits-all formula. Whether the right answer is a public auction, a private treaty or a fully off-market campaign, the recommendation is always evidence-led and unflinchingly honest.</p>
      <h2>Track record</h2>
      <ul class="check-list">
        <li>Selling on the Lower North Shore continuously since 2009</li>
        <li>Block, street and suburb records held across the area</li>
        <li>Most recommended agent in Lane Cove on realestate.com.au</li>
        <li>Consistent top performer within the Raine &amp; Horne national network</li>
      </ul>
      <h2>Coverage</h2>
      <p>Alex sells across all twenty-nine Lower North Shore suburbs, with offices at Lane Cove, Willoughby, Mosman and Northbridge. From harbour-front houses in Longueville and Mosman to Art Deco apartments in Cremorne and federation cottages in Naremburn, the work is the same: prepare thoroughly, price honestly, and present the home to the buyers most likely to compete for it.</p>
      <h2>How to engage</h2>
      <p>The most informed first step is a confidential conversation. Call <a href="${PHONE_HREF}">${PHONE}</a>, email <a href="mailto:${EMAIL}">${EMAIL}</a>, or <a href="/appraisal/">request a free market appraisal</a>.</p>
    </div>
  </section>
  <section class="section section-final">
    <div class="container text-center">
      <h2 class="display">Begin a conversation.</h2>
      <div class="hero-ctas center">
        <a class="btn btn-primary" href="/appraisal/">Request a free appraisal</a>
        <a class="btn btn-ghost" href="${PHONE_HREF}">Call ${PHONE}</a>
      </div>
    </div>
  </section>
</main>
${realEstateAgentSchema}
${breadcrumbs([{name:'Home',url:'/'},{name:'About',url:'/about/'}])}
` + footer();

// ===== APPRAISAL =====
const appraisalHTML = baseHead(
  'Free Market Appraisal | Alex Banning — Lower North Shore',
  'Confidential, obligation-free market appraisal from the Lower North Shore’s most recommended agent. Evidence-led pricing and a tailored campaign plan.',
  '/appraisal/'
) + nav() + `
<main>
  <section class="hero hero-sub">
    <div class="container hero-inner">
      <p class="eyebrow">Free appraisal</p>
      <h1>What is your home worth in today’s market?</h1>
      <p class="lede">Confidential, obligation-free, evidence-led. Twenty–thirty minutes on site, a written appraisal within two business days.</p>
    </div>
  </section>
  <section class="section">
    <div class="container two-col">
      <div class="prose">
        <h2>How it works</h2>
        <ol class="steps">
          <li><strong>Book a time.</strong> By phone, email or the form alongside.</li>
          <li><strong>On-site visit.</strong> Alex inspects your home in person, usually within 48 hours.</li>
          <li><strong>Comparable analysis.</strong> Recent local sales, current buyer demand and likely campaign strategy.</li>
          <li><strong>Written appraisal.</strong> A confidential price guide and tailored go-to-market plan.</li>
        </ol>
        <h2>Why vendors choose Alex</h2>
        <ul class="check-list">
          <li>Records held in block, street and suburb across the LNS</li>
          <li>Active database of qualified Lower North Shore buyers</li>
          <li>Five-star reviews from vendors and buyers alike</li>
          <li>Discreet pre-market and off-market reach where required</li>
        </ul>
      </div>
      <div class="form-card sticky">${appraisalForm()}</div>
    </div>
  </section>
</main>
${realEstateAgentSchema}
${breadcrumbs([{name:'Home',url:'/'},{name:'Free Appraisal',url:'/appraisal/'}])}
` + footer();

// ===== CONTACT =====
const contactHTML = baseHead(
  'Contact Alex Banning | Raine &amp; Horne Lower North Shore',
  'Speak directly with Alex Banning. Phone, email and four office addresses across the Lower North Shore.',
  '/contact/'
) + nav() + `
<main>
  <section class="hero hero-sub">
    <div class="container hero-inner">
      <p class="eyebrow">Contact</p>
      <h1>Speak with Alex.</h1>
      <p class="lede">Direct line, direct email, and four offices across the Lower North Shore.</p>
    </div>
  </section>
  <section class="section">
    <div class="container narrow prose">
      <h2>Direct</h2>
      <p><strong>Phone:</strong> <a href="${PHONE_HREF}">${PHONE}</a><br><strong>Email:</strong> <a href="mailto:${EMAIL}">${EMAIL}</a></p>
      <h2>Offices</h2>
      <div class="office-grid">
        ${OFFICES.map(o => `<div class="office-card"><h3>${o.name}</h3><p>${o.addr}</p></div>`).join('')}
      </div>
      <p class="muted">For an obligation-free appraisal, the fastest route is the <a href="/appraisal/">appraisal request form</a>.</p>
    </div>
  </section>
</main>
${realEstateAgentSchema}
${breadcrumbs([{name:'Home',url:'/'},{name:'Contact',url:'/contact/'}])}
` + footer();

// ===== RECENT SALES =====
const salesHTML = baseHead(
  'Recent Sales | Alex Banning — Lower North Shore',
  'A selection of recent record sales by Alex Banning across the Lower North Shore. Many of the strongest results are sold off-market.',
  '/recent-sales/'
) + nav() + `
<main>
  <section class="hero hero-sub">
    <div class="container hero-inner">
      <p class="eyebrow">Recent sales</p>
      <h1>Results that re-set the benchmark.</h1>
      <p class="lede">A small selection of recent campaigns. Many of Alex’s strongest results are off-market — speak with him directly for the full picture.</p>
    </div>
  </section>
  <section class="section">
    <div class="container">
      <div class="card-grid">
        ${renderSaleCards(RECENT_SALES)}
      </div>
      <p class="text-center muted small">Selected recent campaigns. For Alex’s full sales portfolio across the Lower North Shore, see his <a href="https://www.raineandhorne.com.au/lns/team/alex-banning-residential" target="_blank" rel="noopener">Raine &amp; Horne profile</a>.</p>
    </div>
  </section>
  <section class="section section-final">
    <div class="container text-center">
      <h2 class="display">Curious about your home’s ceiling?</h2>
      <a class="btn btn-primary" href="/appraisal/">Request a free appraisal</a>
    </div>
  </section>
</main>
${breadcrumbs([{name:'Home',url:'/'},{name:'Recent Sales',url:'/recent-sales/'}])}
` + footer();

// ===== TESTIMONIALS =====
const testimonialsHTML = baseHead(
  'Testimonials | Alex Banning — Lower North Shore',
  'What vendors and buyers say about working with Alex Banning, the Lower North Shore’s most recommended agent.',
  '/testimonials/'
) + nav() + `
<main>
  <section class="hero hero-sub">
    <div class="container hero-inner">
      <p class="eyebrow">Testimonials</p>
      <h1>In their own words.</h1>
      <p class="lede">A representative selection of recent reviews. Full reviews, including ratings, are available on realestate.com.au and RateMyAgent.</p>
    </div>
  </section>
  <section class="section">
    <div class="container">
      <div class="quote-grid wide">
        ${[
          {q:'Alex was nothing short of efficient, knowledgeable and professional throughout the process of us buying an apartment in Lane Cove North. He clearly works with integrity and we appreciated his straight talking approach.', a:'Jenny · Buyer · Lane Cove North'},
          {q:'Clear advice, no inflated promises, and a result above what other agents had quoted. We couldn’t recommend Alex more highly.', a:'Vendor · Lane Cove'},
          {q:'Discreet, prepared, and thoughtful at every step. Exactly what you want when selling a family home.', a:'Vendor · Mosman'},
          {q:'A measured, calm presence through what could have been a stressful campaign. The result spoke for itself.', a:'Vendor · Northbridge'},
          {q:'Alex understood our apartment block and our buyer pool from day one. He brought the right buyers and a record price.', a:'Vendor · Cremorne'},
          {q:'Honest, hard-working and genuinely a pleasure to deal with. Highly recommend.', a:'Buyer · Willoughby'},
        ].map(t => `<blockquote><p>“${t.q}”</p><cite>${t.a}</cite></blockquote>`).join('')}
      </div>
    </div>
  </section>
</main>
${breadcrumbs([{name:'Home',url:'/'},{name:'Testimonials',url:'/testimonials/'}])}
` + footer();

// ===== THANK YOU =====
const thankyouHTML = baseHead(
  'Thank you | Alex Banning',
  'Your appraisal request has been received. Alex will be in touch shortly.',
  '/thank-you/'
) + nav() + `
<main>
  <section class="hero hero-sub">
    <div class="container hero-inner text-center">
      <p class="eyebrow">Thank you</p>
      <h1>Your request has been received.</h1>
      <p class="lede">Alex will personally be in touch within one business day to confirm a time. For anything urgent, call <a href="${PHONE_HREF}">${PHONE}</a>.</p>
      <div class="hero-ctas center">
        <a class="btn btn-primary" href="/recent-sales/">View recent sales</a>
        <a class="btn btn-ghost" href="/lower-north-shore/">Browse suburbs</a>
      </div>
    </div>
  </section>
</main>
` + footer();

// ===== PRIVACY / TERMS =====
const privacyHTML = baseHead('Privacy Policy | Alex Banning','Privacy policy for alexbanning.com.au.','/privacy/') + nav() + `
<main><section class="section"><div class="container narrow prose">
<h1>Privacy Policy</h1>
<p>This site is operated by Banning Enterprises Pty Ltd, trading as Raine &amp; Horne Lower North Shore. Personal information you provide via this website (including the appraisal request form) is collected, held and used in accordance with the Australian Privacy Principles under the Privacy Act 1988 (Cth).</p>
<h2>What we collect</h2>
<p>Name, contact details, property address and any other information you choose to provide.</p>
<h2>How we use it</h2>
<p>To prepare and deliver your market appraisal, to contact you about your enquiry, and to provide ongoing real estate services where you have requested them.</p>
<h2>Disclosure</h2>
<p>We do not sell your information. We may share it with our office network where required to deliver the service you requested.</p>
<h2>Contact</h2>
<p>For any privacy enquiry, email <a href="mailto:${EMAIL}">${EMAIL}</a>.</p>
</div></section></main>
` + footer();

const termsHTML = baseHead('Terms of Use | Alex Banning','Terms of use for alexbanning.com.au.','/terms/') + nav() + `
<main><section class="section"><div class="container narrow prose">
<h1>Terms of Use</h1>
<p>The information on this website is provided in good faith and for general information only. Market data, medians and indicative figures are sourced from third parties (including CoreLogic and Domain) and may be out of date. Nothing on this site constitutes financial, legal or investment advice.</p>
<p>For figures specific to your property, request a tailored market appraisal.</p>
</div></section></main>
` + footer();

// ===== SUBURB PAGES =====
function suburbHTML(s) {
  const isPrestige = ['mosman','kirribilli','greenwich','riverview','longueville','linley-point','castlecrag','castle-cove','lavender-bay'].includes(s.slug);
  const ctaLabel = isPrestige ? 'Request a private appraisal' : `Request my ${s.name} appraisal`;
  const heroH1 = isPrestige
    ? `Selling in ${s.name}? Request a private market appraisal.`
    : `Selling in ${s.name}? Get a free market appraisal.`;
  const intro = `<p>Alex Banning has sold throughout ${s.name} for over fifteen years — across ${s.specialty}. His campaigns work the streets you would expect: ${s.streets}. ${s.hook}</p>
  <p>In a market where buyers compete for limited stock, Alex’s curated database, off-market reach and disciplined campaign strategy have repeatedly produced record prices. If you are considering selling in ${s.name}, a confidential conversation with Alex is the most informed first step.</p>`;

  const faqs = [
    {q:`How much is my ${s.name} home worth?`, a:`The honest answer is that it depends on the street, aspect, condition and the buyer pool active for that property type. Alex provides a precise, evidence-based figure after a short on-site visit, drawing on recent comparable ${s.name} sales — including off-market transactions that don’t appear on the major portals.`},
    {q:`Is the appraisal really free?`, a:`Yes. Alex’s market appraisals are complimentary and obligation-free, whether you are twelve months from selling or simply curious about your home’s ceiling.`},
    {q:`What’s the difference between a market appraisal and a bank valuation?`, a:`A market appraisal is the price an experienced local agent expects your home to achieve in the current market. A bank valuation is a more conservative figure used by lenders for mortgage security. The two are rarely the same number, and serve different purposes.`},
    {q:`How long does an appraisal take?`, a:`The on-site visit usually takes 20–30 minutes. You’ll typically receive a written appraisal within two business days.`},
    {q:`Can my ${s.name} home be sold off-market?`, a:`Yes — and in many cases it should be. A meaningful share of ${s.name}’s strongest results are achieved through pre-market and off-market campaigns to a curated buyer database. Alex will advise honestly on whether public, hybrid or off-market is most likely to deliver your strongest result.`},
    {q:`How should I prepare my ${s.name} home for sale?`, a:`Alex provides a tailored pre-market plan covering styling, minor works, photography and timing — calibrated to your home’s likely audience and price point. There is rarely a one-size-fits-all answer.`},
  ];

  const faqSchema = `<script type="application/ld+json">${JSON.stringify({
    "@context":"https://schema.org",
    "@type":"FAQPage",
    "mainEntity":faqs.map(f=>({"@type":"Question","name":f.q,"acceptedAnswer":{"@type":"Answer","text":f.a}}))
  })}<\/script>`;

  const placeSchema = `<script type="application/ld+json">${JSON.stringify({
    "@context":"https://schema.org","@type":"Place","name":`${s.name}, NSW ${s.postcode}`,"address":{"@type":"PostalAddress","addressLocality":s.name,"postalCode":s.postcode,"addressRegion":"NSW","addressCountry":"AU"}
  })}<\/script>`;

  const metaTitle = `${s.name} Real Estate Agent | Free Appraisal — Alex Banning`;
  const metaDesc = `Selling in ${s.name}? Alex Banning, the Lower North Shore’s most recommended agent, delivers record prices. Request your free, confidential market appraisal.`;

  return baseHead(metaTitle, metaDesc, `/lower-north-shore/${s.slug}/`) + nav() + `
<main>
  <section class="hero hero-suburb">
    <div class="container hero-inner">
      <p class="eyebrow">${s.name} · ${s.postcode}</p>
      <h1>${heroH1}</h1>
      <p class="lede">${s.hook}</p>
      <div class="hero-ctas">
        <a class="btn btn-primary" href="#appraise">${ctaLabel}</a>
        <a class="btn btn-ghost" href="${PHONE_HREF}">Call ${PHONE}</a>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="container narrow prose">
      <h2 class="display">${s.name} — by reputation and by results.</h2>
      ${intro}
    </div>
  </section>

  <section class="section section-tinted">
    <div class="container">
      <div class="section-head"><p class="eyebrow">Why Alex</p><h2 class="display">A measured approach to ${s.name}.</h2></div>
      <div class="why-grid">
        <div class="why-card"><h3>Record-setting results</h3><p>Block, street and suburb records held across the Lower North Shore in both apartment and house markets.</p></div>
        <div class="why-card"><h3>Deep local knowledge</h3><p>Selling in ${s.name} since 2009 — Alex knows which buyers are active, what they will pay, and why.</p></div>
        <div class="why-card"><h3>Five-star service</h3><p>Most recommended agent in Lane Cove on realestate.com.au, with reviews from across the LNS.</p></div>
        <div class="why-card"><h3>Off-market reach</h3><p>A private database of qualified buyers, often producing strong sales before the campaign begins.</p></div>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <div class="section-head"><p class="eyebrow">Market snapshot</p><h2 class="display">${s.name} at a glance.</h2><p class="muted small">Updated quarterly. Last updated [DATE].</p></div>
      <div class="stat-grid">
        <div class="stat"><strong>$[XXX]</strong><span>Median house price</span></div>
        <div class="stat"><strong>$[XXX]</strong><span>Median unit price</span></div>
        <div class="stat"><strong>[XX]</strong><span>Median days on market</span></div>
        <div class="stat"><strong>[X.X]%</strong><span>12-month price growth</span></div>
      </div>
      <p class="muted small">Source: CoreLogic / Domain. ${s.name} values can vary substantially by aspect, condition and street — the snapshot is a general guide. Request a tailored appraisal for a precise figure.</p>
    </div>
  </section>

  <section class="section section-tinted">
    <div class="container">
      <div class="section-head"><p class="eyebrow">Recent ${s.name} campaigns</p><h2 class="display">A selection of recent results.</h2></div>
      <div class="card-grid">
        ${[1,2,3,4,5,6].map(i => `<article class="sale-card">
          <div class="sale-card-image"></div>
          <div class="sale-card-body">
            <p class="eyebrow">${s.name}</p>
            <h3>Contact agent</h3>
            <p class="muted">[Bed · Bath · Car]</p>
            <p class="tag">[Auction / Private treaty / Off-market]</p>
          </div>
        </article>`).join('')}
      </div>
      <p class="text-center"><a class="btn btn-ghost" href="/recent-sales/">View all recent sales</a></p>
    </div>
  </section>

  <section class="section">
    <div class="container narrow">
      <div class="section-head"><p class="eyebrow">Vendor &amp; buyer reviews</p><h2 class="display">In their own words.</h2></div>
      <blockquote class="big-quote">
        <p>“[Suburb-specific verbatim review to be inserted here — pulled from realestate.com.au or RateMyAgent and tagged ${s.name}.]”</p>
        <cite>[Vendor / Buyer first name] · ${s.name}</cite>
      </blockquote>
    </div>
  </section>

  <section class="section section-tinted">
    <div class="container narrow prose">
      <h2 class="display">How a ${s.name} market appraisal works.</h2>
      <ol class="steps">
        <li><strong>Book a time.</strong> By phone, email or through the form below.</li>
        <li><strong>On-site visit.</strong> Alex inspects your home in person, usually within 48 hours.</li>
        <li><strong>Comparable analysis.</strong> Recent ${s.name} sales, current buyer demand, and the right campaign strategy.</li>
        <li><strong>Written appraisal.</strong> A confidential price guide and tailored go-to-market plan.</li>
      </ol>
    </div>
  </section>

  <section class="section">
    <div class="container narrow">
      <div class="section-head"><p class="eyebrow">FAQs</p><h2 class="display">${s.name} appraisal questions.</h2></div>
      <div class="faq-list">
        ${faqs.map(f => `<details><summary>${f.q}</summary><p>${f.a}</p></details>`).join('')}
      </div>
    </div>
  </section>

  <section class="section section-cta" id="appraise">
    <div class="container two-col">
      <div>
        <p class="eyebrow">Free appraisal</p>
        <h2 class="display">${s.name} deserves ${s.name}’s leading agent.</h2>
        <p>Request your confidential, obligation-free ${s.name} market appraisal from Alex Banning.</p>
      </div>
      <div class="form-card">${appraisalForm(s.name)}</div>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <div class="section-head"><p class="eyebrow">Neighbouring suburbs</p><h2 class="display">Explore the Lower North Shore.</h2></div>
      <div class="suburb-grid">
        ${s.neighbours.map(n => `<a class="suburb-tile small" href="/lower-north-shore/${n}/"><span class="suburb-tile-name">${slugToName[n]}</span></a>`).join('')}
        <a class="suburb-tile small" href="/lower-north-shore/"><span class="suburb-tile-name">All suburbs →</span></a>
      </div>
    </div>
  </section>
</main>
${realEstateAgentSchema}
${placeSchema}
${faqSchema}
${breadcrumbs([{name:'Home',url:'/'},{name:'Lower North Shore',url:'/lower-north-shore/'},{name:s.name,url:`/lower-north-shore/${s.slug}/`}])}
` + footer();
}

// ===== WRITE FILES =====
function ensureDir(p) { fs.mkdirSync(p, { recursive: true }); }
function write(p, content) {
  ensureDir(path.dirname(p));
  fs.writeFileSync(p, content);
}

const out = path.resolve(__dirname);

write(path.join(out, 'index.html'), homeHTML);
write(path.join(out, 'about/index.html'), aboutHTML);
write(path.join(out, 'appraisal/index.html'), appraisalHTML);
write(path.join(out, 'contact/index.html'), contactHTML);
write(path.join(out, 'recent-sales/index.html'), salesHTML);
write(path.join(out, 'testimonials/index.html'), testimonialsHTML);
write(path.join(out, 'thank-you/index.html'), thankyouHTML);
write(path.join(out, 'privacy/index.html'), privacyHTML);
write(path.join(out, 'terms/index.html'), termsHTML);
write(path.join(out, 'lower-north-shore/index.html'), hubHTML);

SUBURBS.forEach(s => {
  write(path.join(out, `lower-north-shore/${s.slug}/index.html`), suburbHTML(s));
});

// sitemap
const urls = [
  '/', '/about/', '/appraisal/', '/contact/', '/recent-sales/', '/testimonials/',
  '/lower-north-shore/', '/privacy/', '/terms/',
  ...SUBURBS.map(s => `/lower-north-shore/${s.slug}/`)
];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>https://alexbanning.com.au${u}</loc><changefreq>weekly</changefreq></url>`).join('\n')}
</urlset>`;
write(path.join(out, 'sitemap.xml'), sitemap);

write(path.join(out, 'robots.txt'), `User-agent: *
Allow: /
Sitemap: https://alexbanning.com.au/sitemap.xml
`);

console.log(`Generated ${SUBURBS.length} suburb pages and ${urls.length} URLs total.`);
