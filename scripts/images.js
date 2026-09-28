#!/usr/bin/env node
/*
 * Image pipeline. Never hotlink: every image the site shows is downloaded,
 * cropped, graded and re-encoded here, then served from /assets/img/.
 *
 *   npm run images            process anything missing from the manifest
 *   npm run images -- --force re-process everything
 *   npm run images -- hawthorne-01 sharland-01   process specific ids
 *
 * Output: static/assets/img/<id>/<width>.avif|webp, data/images.manifest.json,
 * and images/contact-sheet.html (a visual index for writing alt text).
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.resolve(__dirname, '..');
const REG = require(path.join(ROOT, 'data/images.json'));
const MANIFEST_PATH = path.join(ROOT, 'data/images.manifest.json');
const OUT_DIR = path.join(ROOT, 'static/assets/img');
const CACHE_DIR = path.join(ROOT, 'images/.cache');

const args = process.argv.slice(2);
const force = args.includes('--force');
const only = args.filter(a => !a.startsWith('--'));

const manifest = fs.existsSync(MANIFEST_PATH) ? JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8')) : {};

async function getSource(entry) {
  if (!/^https?:\/\//.test(entry.src)) return fs.readFileSync(path.join(ROOT, entry.src));
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  const cached = path.join(CACHE_DIR, entry.id + path.extname(new URL(entry.src).pathname));
  if (fs.existsSync(cached) && !force) return fs.readFileSync(cached);
  const res = await fetch(entry.src, { headers: { 'User-Agent': 'alex-banning.com image pipeline' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(cached, buf);
  return buf;
}

// A subtle warm grade: lift reds, ease blues, soften saturation a touch.
const warm = img => img.linear([1.03, 1.0, 0.95], [2, 1, -2]).modulate({ saturation: 0.94 });

async function processEntry(entry) {
  const src = await getSource(entry);
  let base = sharp(src).rotate();
  if (entry.crop) base = base.extract(entry.crop);
  if (entry.grade === 'warm') base = warm(base);
  const graded = await base.toBuffer();
  const meta = await sharp(graded).metadata();
  const dir = path.join(OUT_DIR, entry.id);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });

  const widths = REG.widths.filter(w => w < meta.width);
  widths.push(Math.min(meta.width, REG.widths[REG.widths.length - 1]));
  const uniq = [...new Set(widths)].sort((a, b) => a - b);

  for (const w of uniq) {
    const resized = sharp(graded).resize({ width: w, withoutEnlargement: true });
    await resized.clone().avif({ quality: 50, effort: 4 }).toFile(path.join(dir, `${w}.avif`));
    await resized.clone().webp({ quality: 72 }).toFile(path.join(dir, `${w}.webp`));
  }
  const blur = await sharp(graded).resize(24).blur(1.2).webp({ quality: 40 }).toBuffer();

  manifest[entry.id] = {
    w: meta.width,
    h: meta.height,
    widths: uniq,
    blur: 'data:image/webp;base64,' + blur.toString('base64'),
  };
}

function contactSheet() {
  const cards = REG.images.map(e => {
    const m = manifest[e.id];
    const img = m ? `<img src="../static/assets/img/${e.id}/${m.widths[0]}.webp" alt="">` : '<div class="missing">not processed</div>';
    return `<figure>${img}<figcaption><b>${e.id}</b><br>${e.alt}</figcaption></figure>`;
  }).join('\n');
  fs.writeFileSync(path.join(ROOT, 'images/contact-sheet.html'), `<!doctype html><meta charset="utf-8"><title>Contact sheet</title>
<style>body{font:14px system-ui;margin:24px;background:#f6f2ea}main{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px}
figure{margin:0;background:#fff;padding:8px}img{width:100%;aspect-ratio:3/2;object-fit:cover}.missing{aspect-ratio:3/2;background:#d9d2c5;display:grid;place-items:center}</style>
<h1>Image contact sheet</h1><p>Use this to check crops and write accurate alt text in data/images.json.</p><main>${cards}</main>`);
}

(async () => {
  let ok = 0, skipped = 0;
  const failed = [];
  for (const entry of REG.images) {
    if (only.length && !only.includes(entry.id)) continue;
    const done = manifest[entry.id] && fs.existsSync(path.join(OUT_DIR, entry.id));
    if (done && !force && !only.length) { skipped++; continue; }
    try {
      await processEntry(entry);
      ok++;
      console.log('  ok   ', entry.id);
    } catch (err) {
      failed.push(entry.id);
      console.log('  FAIL ', entry.id, '(' + err.message + ')');
    }
  }
  const sorted = Object.fromEntries(Object.keys(manifest).sort().map(k => [k, manifest[k]]));
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(sorted, null, 2) + '\n');
  contactSheet();
  console.log(`\nProcessed ${ok}, already done ${skipped}, failed ${failed.length}.`);
  if (failed.length) {
    console.log('Failed images render as placeholders until this is re-run with network access to their source.');
  }
})();
