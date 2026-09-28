const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const readJSON = p => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));

const esc = s => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const slugify = s => String(s).toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const PLACEHOLDER = /\[[A-Z .]*(PLACEHOLDER|TO CONFIRM|LICENCE)[A-Z .]*\]/;
const isPlaceholder = v => v == null || v === '' || PLACEHOLDER.test(String(v));

// ---------- Frontmatter + a small Markdown subset ----------
function frontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { data: {}, body: text };
  const data = {};
  for (const line of m[1].split('\n')) {
    const i = line.indexOf(':');
    if (i < 1) continue;
    data[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return { data, body: m[2] };
}

function inline(s) {
  return esc(s)
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, t, u) => `<a href="${u}">${t}</a>`)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>');
}

function md(src) {
  const out = [];
  let para = [], list = null;
  const flushPara = () => { if (para.length) { out.push(`<p>${inline(para.join(' '))}</p>`); para = []; } };
  const flushList = () => { if (list) { out.push(`<ul>${list.map(li => `<li>${li}</li>`).join('')}</ul>`); list = null; } };
  for (const raw of src.split('\n')) {
    const line = raw.trimEnd();
    let m;
    if (!line.trim()) { flushPara(); flushList(); continue; }
    if ((m = line.match(/^(#{2,4})\s+(.*)$/))) {
      flushPara(); flushList();
      out.push(`<h${m[1].length}>${inline(m[2])}</h${m[1].length}>`);
    } else if ((m = line.match(/^\s*[-*]\s+(.*)$/))) {
      flushPara();
      list = list || [];
      if (/^\s{2,}/.test(line) && list.length) list[list.length - 1] += `<br><span class="sub">${inline(m[1])}</span>`;
      else list.push(inline(m[1]));
    } else {
      flushList();
      para.push(line.trim());
    }
  }
  flushPara(); flushList();
  return out.join('\n');
}

// Split "intro ... ## FAQ ### Q? A" into parts.
function splitFaq(body) {
  const [intro, faqPart = ''] = body.split(/^##\s+FAQ\s*$/m);
  const faqs = [];
  faqPart.split(/^###\s+/m).slice(1).forEach(block => {
    const [q, ...rest] = block.split('\n');
    const a = rest.join('\n').trim();
    if (q.trim() && a) faqs.push({ q: q.trim(), a });
  });
  return { intro: intro.trim(), faqs };
}

const wordCount = s => s.replace(/[#*_\[\]()]/g, ' ').split(/\s+/).filter(Boolean).length;

// ---------- Responsive images ----------
const REG = readJSON('data/images.json');
const REG_BY_ID = Object.fromEntries(REG.images.map(i => [i.id, i]));
const MANIFEST = fs.existsSync(path.join(ROOT, 'data/images.manifest.json')) ? readJSON('data/images.manifest.json') : {};

const hasImage = id => Boolean(id && MANIFEST[id]);
const firstImage = ids => (ids || []).find(hasImage) || null;

function imgUrl(id, width) {
  const m = MANIFEST[id];
  if (!m) return null;
  const w = width ? (m.widths.find(x => x >= width) || m.widths[m.widths.length - 1]) : m.widths[m.widths.length - 1];
  return `/assets/img/${id}/${w}.webp`;
}

/**
 * <picture> with AVIF + WebP srcsets. Missing images become a quiet placeholder
 * block so layouts hold their shape until `npm run images` has been run.
 */
function pic(id, opts = {}) {
  const { sizes = '100vw', cls = '', eager = false, alt, ratio, fit } = opts;
  const reg = REG_BY_ID[id] || {};
  const altText = alt ?? reg.alt ?? '';
  const m = MANIFEST[id];
  const style = ratio ? ` style="aspect-ratio:${ratio}"` : '';
  if (!m) {
    return `<div class="img ph ${cls}"${style} role="img" aria-label="${esc(altText)}"><span>Photography to come</span></div>`;
  }
  const set = ext => m.widths.map(w => `/assets/img/${id}/${w}.${ext} ${w}w`).join(', ');
  const fallbackW = m.widths.find(w => w >= 800) || m.widths[m.widths.length - 1];
  const load = eager ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"';
  const bg = eager ? '' : ` style="background-image:url(${m.blur})"`;
  return `<picture class="img ${cls}"${ratio ? ` style="aspect-ratio:${ratio}"` : ''}>` +
    `<source type="image/avif" srcset="${set('avif')}" sizes="${sizes}">` +
    `<source type="image/webp" srcset="${set('webp')}" sizes="${sizes}">` +
    `<img src="/assets/img/${id}/${fallbackW}.webp" alt="${esc(altText)}" width="${m.w}" height="${m.h}" ${load} decoding="async"${bg}${fit ? ` style="object-position:${fit}"` : ''}>` +
    `</picture>`;
}

function preloadFor(id, sizes = '100vw') {
  const m = MANIFEST[id];
  if (!m) return '';
  const set = m.widths.map(w => `/assets/img/${id}/${w}.avif ${w}w`).join(', ');
  return `<link rel="preload" as="image" type="image/avif" imagesrcset="${set}" imagesizes="${sizes}" fetchpriority="high">`;
}

const money = n => '$' + Number(n).toLocaleString('en-AU');

module.exports = {
  ROOT, readJSON, esc, slugify, isPlaceholder, frontmatter, md, inline, splitFaq, wordCount,
  REG_BY_ID, MANIFEST, hasImage, firstImage, imgUrl, pic, preloadFor, money,
};
