#!/usr/bin/env node
/*
 * Pre-launch QA over the built site (run `npm run build` first).
 * Fails on: em/en dashes or exclamation marks in visible copy, pages without
 * exactly one <h1>, broken internal links, images missing alt text.
 * Lists: every placeholder still waiting on real data.
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'public');
if (!fs.existsSync(OUT)) { console.error('Run npm run build first.'); process.exit(1); }

const files = [];
(function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); e.isDirectory() ? walk(p) : p.endsWith('.html') && files.push(p); } })(OUT);

const errors = [], warnings = [];
const visible = html => html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ');
const exists = href => {
  const clean = href.split(/[?#]/)[0];
  if (!clean) return true;
  const f = path.join(OUT, clean);
  return fs.existsSync(f) && (fs.statSync(f).isFile() || fs.existsSync(path.join(f, 'index.html')));
};

for (const f of files) {
  const rel = '/' + path.relative(OUT, f).replace(/index\.html$/, '');
  const html = fs.readFileSync(f, 'utf8');
  const text = visible(html);
  if (/[–—]/.test(text) || /\s-\s/.test(text.replace(/\s+/g, ' ').replace(/\d\s-\s\d/g, ''))) errors.push(`${rel}: dash in copy`);
  if (/!/.test(text.replace(/<!--[\s\S]*?-->/g, ''))) errors.push(`${rel}: exclamation mark in copy`);
  const h1 = (html.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) errors.push(`${rel}: ${h1} <h1> elements`);
  for (const m of html.matchAll(/<img\b[^>]*>/g)) if (!/\balt="[^"]+"/.test(m[0]) && !/alt=""/.test(m[0])) errors.push(`${rel}: img without alt`);
  for (const m of html.matchAll(/href="(\/[^"]*)"/g)) if (!exists(m[1])) errors.push(`${rel}: broken link ${m[1]}`);
  if (/\b(dream home|nestled|boasting|unparalleled)\b/i.test(text)) warnings.push(`${rel}: cliché`);
}

// Placeholders still waiting on input
const placeholders = [];
const scan = (dir) => {
  for (const e of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { scan(p); continue; }
    if (!/\.(json|md)$/.test(e.name) || e.name === 'images.manifest.json') continue;
    fs.readFileSync(path.join(ROOT, p), 'utf8').split('\n').forEach((line, i) => {
      if (!/"_note"/.test(line) && /\[(DATA PLACEHOLDER|LICENCE NO\.|TO CONFIRM|Alex to supply)\]/.test(line)) placeholders.push(`${p}:${i + 1}  ${line.trim().slice(0, 110)}`);
    });
  }
};
scan('data');
const cs = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/case-studies.json'), 'utf8')).caseStudies;
cs.forEach(c => ['challenge', 'strategy', 'campaign', 'quote'].forEach(k => { if (!c[k]) placeholders.push(`data/case-studies.json  ${c.saleId}: ${k} (Alex to supply)`); }));
const reg = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/images.json'), 'utf8')).images;
const man = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/images.manifest.json'), 'utf8'));
const missing = reg.filter(i => !man[i.id]).map(i => i.id);

console.log(`Checked ${files.length} pages.`);
warnings.forEach(w => console.log('  warn  ' + w));
errors.forEach(e => console.log('  FAIL  ' + e));
console.log(`\nPlaceholders awaiting input (${placeholders.length}):`);
placeholders.forEach(p => console.log('  - ' + p));
if (missing.length) console.log(`\nImages not yet processed (${missing.length}): ${missing.join(', ')}\n  Run: npm run images`);
process.exit(errors.length ? 1 : 0);
