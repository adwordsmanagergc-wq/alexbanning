const { readJSON, esc, imgUrl, isPlaceholder } = require('./util');

const SITE = readJSON('data/site.json');
const env = process.env;
SITE.url = (env.SITE_URL || SITE.url).replace(/\/$/, '');
SITE.tracking = {
  vercelAnalytics: env.VERCEL_ANALYTICS ? env.VERCEL_ANALYTICS !== 'false' : SITE.tracking.vercelAnalytics,
  ga4: env.GA4_ID || SITE.tracking.ga4,
  metaPixel: env.META_PIXEL_ID || SITE.tracking.metaPixel,
  googleAds: env.GOOGLE_ADS_ID || SITE.tracking.googleAds,
  googleAdsLeadLabel: env.GOOGLE_ADS_LEAD_LABEL || SITE.tracking.googleAdsLeadLabel,
};
SITE.forms.endpoint = env.FORM_ENDPOINT || SITE.forms.endpoint;
SITE.googleMapsKey = env.GOOGLE_MAPS_KEY || SITE.googleMapsKey;

const abs = p => SITE.url + p;

const NAV = [
  ['Private Collection', '/private-collection/'],
  ['Results', '/results/'],
  ['About', '/about/'],
  ['Suburbs', '/suburbs/'],
  ['Reviews', '/reviews/'],
  ['Insights', '/insights/'],
];

const ICON = {
  phone: '<svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.9.6 2.8.7a2 2 0 0 1 1.7 2z"/></svg>',
  arrow: '<svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M4 12h15M13 6l6 6-6 6"/></svg>',
  prev: '<svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M20 12H5M11 6l-6 6 6 6"/></svg>',
  next: '<svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M4 12h15M13 6l6 6-6 6"/></svg>',
};

function tracking() {
  const t = SITE.tracking;
  let s = '';
  // Vercel Web Analytics (cookieless). Served by Vercel at /_vercel/insights; enable Analytics in the project dashboard.
  if (t.vercelAnalytics) {
    s += `<script>window.va=window.va||function(){(window.vaq=window.vaq||[]).push(arguments)};</script>
<script defer src="/_vercel/insights/script.js"></script>`;
  }
  const gtagId = t.ga4 || t.googleAds;
  if (gtagId) {
    s += `<script async src="https://www.googletagmanager.com/gtag/js?id=${esc(gtagId)}"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());${t.ga4 ? `gtag('config','${esc(t.ga4)}');` : ''}${t.googleAds ? `gtag('config','${esc(t.googleAds)}');` : ''}</script>`;
  }
  if (t.metaPixel) {
    s += `<script>!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${esc(t.metaPixel)}');fbq('track','PageView');</script>`;
  }
  // Vercel Web Analytics
  s += `<script>window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };</script>
<script defer src="/_vercel/insights/script.js"></script>`;
  return s;
}

function head({ title, description, path, ogImage, noindex, preload = '', jsonld = [] }) {
  const og = ogImage || imgUrl('hawthorne-01', 1600) || imgUrl('alex-walking', 1200);
  const cfg = {
    endpoint: SITE.forms.endpoint,
    adsSendTo: SITE.tracking.googleAds && SITE.tracking.googleAdsLeadLabel ? `${SITE.tracking.googleAds}/${SITE.tracking.googleAdsLeadLabel}` : '',
    mapsKey: SITE.googleMapsKey,
    phone: SITE.phone,
    email: SITE.email,
  };
  return `<!doctype html>
<html lang="en-AU">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${abs(path)}">
${noindex ? '<meta name="robots" content="noindex,follow">' : '<meta name="robots" content="index,follow,max-image-preview:large">'}
<meta property="og:type" content="website">
<meta property="og:site_name" content="Alex Banning">
<meta property="og:locale" content="en_AU">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${abs(path)}">
${og ? `<meta property="og:image" content="${abs(og)}">\n<meta name="twitter:image" content="${abs(og)}">` : ''}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="theme-color" content="#0F1B2D">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preload" href="/assets/fonts/cormorant-latin-wght.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/inter-latin-wght.woff2" as="font" type="font/woff2" crossorigin>
${preload}
<link rel="stylesheet" href="/assets/css/site.css?v=${BUILD_ID}">
<script>document.documentElement.className+=' js';window.AB=${JSON.stringify(cfg)};</script>
${tracking()}
${jsonld.filter(Boolean).map(j => `<script type="application/ld+json">${JSON.stringify(j)}</script>`).join('\n')}
</head>`;
}

const BUILD_ID = Date.now().toString(36);

function header(path, { overlay = false } = {}) {
  const link = ([label, href]) => `<a href="${href}"${path.startsWith(href) ? ' aria-current="page"' : ''}>${label}</a>`;
  return `<a class="skip" href="#main">Skip to content</a>
<header class="hdr${overlay ? ' hdr--overlay' : ''}" id="hdr">
  <div class="hdr__inner wrap">
    <a class="brand" href="/" aria-label="Alex Banning, home">
      <span class="brand__mark" aria-hidden="true">AB</span>
      <span class="brand__name">Alex Banning</span>
    </a>
    <nav class="hdr__nav" aria-label="Primary">
      ${NAV.map(link).join('\n      ')}
    </nav>
    <div class="hdr__actions">
      <a class="hdr__tel" href="${SITE.phoneHref}">${SITE.phone}</a>
      <a class="btn btn--sm btn--solid" href="/appraisal/">Request a Private Appraisal</a>
      <button class="hdr__toggle" type="button" aria-expanded="false" aria-controls="menu"><span class="sr">Menu</span><i></i><i></i></button>
    </div>
  </div>
  <div class="menu" id="menu" hidden>
    <nav class="wrap" aria-label="Mobile">
      ${NAV.map(link).join('\n      ')}
      <a href="/contact/">Contact</a>
      <a class="btn btn--solid" href="/appraisal/">Request a Private Appraisal</a>
      <a class="menu__tel" href="${SITE.phoneHref}">${SITE.phone}</a>
    </nav>
  </div>
</header>
<a class="callpill" href="${SITE.phoneHref}" aria-label="Call Alex Banning on ${SITE.phone}">${ICON.phone}<span>Call Alex</span></a>`;
}

function footer() {
  const p = SITE.profiles;
  const licence = SITE.licence;
  return `<footer class="ftr">
  <div class="wrap ftr__grid">
    <div class="ftr__brand">
      <span class="brand__mark brand__mark--lg" aria-hidden="true">AB</span>
      <p class="ftr__name">Alex Banning</p>
      <p>${esc(SITE.jobTitle)}<br>${esc(SITE.agency)}</p>
      <p><a href="${SITE.phoneHref}">${SITE.phone}</a><br><a href="mailto:${SITE.email}">${SITE.email}</a></p>
    </div>
    <div>
      <h2 class="ftr__h">Office</h2>
      <address>${esc(SITE.office.street)}<br>${esc(SITE.office.locality)} ${SITE.office.region} ${SITE.office.postcode}</address>
      <h2 class="ftr__h">Network offices</h2>
      <ul class="ftr__list">${SITE.networkOffices.filter(o => o.name !== 'Lane Cove').map(o => `<li>${esc(o.addr)}</li>`).join('')}</ul>
    </div>
    <div>
      <h2 class="ftr__h">Explore</h2>
      <ul class="ftr__list">
        ${NAV.map(([l, h]) => `<li><a href="${h}">${l}</a></li>`).join('')}
        <li><a href="/appraisal/">Private appraisal</a></li>
        <li><a href="/contact/">Contact</a></li>
      </ul>
    </div>
    <div>
      <h2 class="ftr__h">Profiles</h2>
      <ul class="ftr__list">
        <li><a href="${p.ratemyagent}" rel="noopener" target="_blank">RateMyAgent</a></li>
        <li><a href="${p.realestate}" rel="noopener" target="_blank">realestate.com.au</a></li>
        <li><a href="${p.domain}" rel="noopener" target="_blank">Domain</a></li>
        <li><a href="${p.raineandhorne}" rel="noopener" target="_blank">Raine &amp; Horne</a></li>
        <li><a href="${p.instagram}" rel="noopener" target="_blank">Instagram</a></li>
        <li><a href="${p.youtube}" rel="noopener" target="_blank">YouTube</a></li>
        <li><a href="${p.facebook}" rel="noopener" target="_blank">Facebook (agency)</a></li>
        <li><a href="${p.googleBusiness}" rel="noopener" target="_blank">Google reviews</a></li>
      </ul>
    </div>
  </div>
  <div class="wrap ftr__legal">
    <p>${esc(SITE.name)} is a ${esc(SITE.jobTitle)} of ${esc(SITE.agency)}, trading through ${esc(SITE.entity)}. NSW licence no. ${esc(licence)}. Statistics are shown with their source and date and are updated periodically. ${esc(SITE.photoCredit)}.</p>
    <p><a href="/privacy/">Privacy</a> <span aria-hidden="true">·</span> <a href="/terms/">Terms</a> <span aria-hidden="true">·</span> <a href="/alex-banning.vcf">Save contact</a> <span aria-hidden="true">·</span> &copy; ${new Date().getFullYear()} Alex Banning <span aria-hidden="true">·</span> Website by <a href="${SITE.credit.url}" rel="noopener" target="_blank">${esc(SITE.credit.label)}</a></p>
  </div>
</footer>
<script src="/assets/js/site.js?v=${BUILD_ID}" defer></script>`;
}

function page(opts) {
  const { path, body, overlay } = opts;
  return `${head(opts)}
<body class="${opts.bodyClass || ''}">
${header(path, { overlay })}
<main id="main">
${body}
</main>
${footer()}
</body>
</html>
`;
}

// ---------- Structured data ----------
function personSchema({ withRating = false, stats, awards, areaServed } = {}) {
  const p = SITE.profiles;
  const s = {
    '@context': 'https://schema.org',
    '@type': ['RealEstateAgent'],
    '@id': abs('/#alex'),
    name: SITE.name,
    url: abs('/'),
    image: imgUrl('alex-walking', 800) ? abs(imgUrl('alex-walking', 800)) : undefined,
    telephone: '+61434131903',
    email: SITE.email,
    priceRange: '$$$',
    address: {
      '@type': 'PostalAddress',
      streetAddress: SITE.office.street,
      addressLocality: SITE.office.locality,
      addressRegion: SITE.office.region,
      postalCode: SITE.office.postcode,
      addressCountry: 'AU',
    },
    parentOrganization: { '@type': 'RealEstateAgent', name: SITE.agency, url: 'https://www.raineandhorne.com.au/lns' },
    areaServed: areaServed.map(n => ({ '@type': 'Place', name: `${n}, NSW` })),
    sameAs: [p.instagram, p.youtube, p.realestate, p.domain, p.ratemyagent, p.raineandhorne],
    employee: {
      '@type': 'Person',
      '@id': abs('/#person'),
      name: SITE.name,
      jobTitle: SITE.jobTitle,
      worksFor: { '@type': 'RealEstateAgent', name: SITE.agency },
      telephone: '+61434131903',
      email: SITE.email,
      knowsAbout: ['Prestige residential sales', 'Auctions', 'Off-market sales', 'Lower North Shore real estate'],
      award: awards.map(a => `${a.by ? a.by + ' ' : ''}${a.year} ${a.title}`),
      sameAs: [p.instagram, p.youtube, p.realestate, p.domain, p.ratemyagent, p.raineandhorne],
    },
  };
  if (withRating) {
    const r = stats.reviews.ratemyagent;
    s.aggregateRating = { '@type': 'AggregateRating', ratingValue: r.rating, bestRating: 5, reviewCount: r.count };
  }
  return JSON.parse(JSON.stringify(s));
}

function breadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map(([name, url], i) => ({ '@type': 'ListItem', position: i + 1, name, item: abs(url) })),
  };
}

function breadcrumbs(items) {
  return `<nav class="crumbs wrap" aria-label="Breadcrumb"><ol>${items.map(([n, u], i) =>
    i === items.length - 1 ? `<li aria-current="page">${esc(n)}</li>` : `<li><a href="${u}">${esc(n)}</a></li>`).join('')}</ol></nav>`;
}

module.exports = { SITE, NAV, ICON, abs, page, personSchema, breadcrumbSchema, breadcrumbs };
