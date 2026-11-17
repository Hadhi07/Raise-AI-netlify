#!/usr/bin/env node
/*
  Renders a branded 1200x630 cover (blog/<slug>/cover.jpg) for every post that
  has no "image:" in its front matter. The cover is used as the social share
  image (og:image) and as the card image on /blog/.

  Usage:
    node build/blog/covers.js          only posts that have no cover yet
    node build/blog/covers.js --all    re-render every cover
    node build/blog/covers.js <slug>   re-render one post

  Needs Playwright with Chromium (pre-installed in Claude Code cloud sessions).
  Run "node build/blog/build.js" afterwards so pages pick up the new cover.
*/
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const SRC = path.join(__dirname, 'posts');
const OUT = path.join(ROOT, 'blog');

const LABELS = {
  'ai-for-architects': 'AI for architects',
  'ai-for-interiors': 'AI for interior designers',
  'ai-for-civil-engineers': 'AI for civil engineers',
  'ai-video': 'AI video',
  'ai-at-work': 'AI at work',
  'raise-ai-stories': 'Raise AI stories',
};

const b64 = (p) => fs.readFileSync(path.join(ROOT, p)).toString('base64');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function frontMatter(file) {
  const raw = fs.readFileSync(path.join(SRC, file), 'utf8');
  const m = raw.match(/^---\n([\s\S]*?)\n---\n/);
  const fm = {};
  if (m) for (const l of m[1].split('\n')) { const kv = l.match(/^([A-Za-z]+):\s*(.*)$/); if (kv) fm[kv[1]] = kv[2].trim(); }
  fm.slug = fm.slug || file.replace(/\.md$/, '');
  return fm;
}

function html(post) {
  const title = post.coverTitle || post.title;
  const size = title.length > 62 ? 58 : title.length > 44 ? 66 : 76;
  // Brand fonts come from Google Fonts (as on the site); the self-hosted files are the offline fallback.
  return `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@600&family=Manrope:wght@800&display=block" rel="stylesheet">
<style>
@font-face{font-family:ManropeLocal;font-weight:800;src:url(data:font/woff2;base64,${b64('assets/fonts/manrope-800.woff2')}) format('woff2')}
@font-face{font-family:InterLocal;font-weight:600;src:url(data:font/woff2;base64,${b64('assets/fonts/inter-600.woff2')}) format('woff2')}
*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;background:#000;color:#fff;font-family:Inter,InterLocal,sans-serif;position:relative;overflow:hidden}
.shape{position:absolute;width:560px;height:560px;border-radius:50%;right:-170px;bottom:-250px;background:linear-gradient(90deg,#08B8F5,#1554FF,#1237D6)}
.in{position:absolute;inset:0;padding:64px 72px;display:flex;flex-direction:column}
.logo{height:44px;width:175px;overflow:hidden;flex:none}
.logo img{height:138px;width:auto;margin:-47px 0 0 -17px;display:block}
.tag{margin-top:auto;align-self:flex-start;font:600 19px/1 Inter,InterLocal,sans-serif;letter-spacing:.08em;text-transform:uppercase;background:#D1FE17;color:#000;border-radius:99px;padding:13px 20px}
h1{margin-top:26px;max-width:960px;font:800 ${size}px/1.06 Manrope,ManropeLocal,sans-serif;letter-spacing:-.025em;text-wrap:balance}
.foot{margin-top:30px;font:600 22px/1 Inter,InterLocal,sans-serif;color:#9AA0AA}
.bar{display:block;width:72px;height:8px;border-radius:8px;background:#D1FE17;margin-top:26px}
</style></head><body>
<div class="shape"></div>
<div class="in">
  <div class="logo"><img src="data:image/webp;base64,${b64('assets/images/logo/logo-dark.webp')}" alt=""></div>
  <span class="tag">${esc(LABELS[post.category] || 'Blog')}</span>
  <h1>${esc(title)}</h1>
  <span class="bar"></span>
  <div class="foot">raiseai.in/blog</div>
</div>
</body></html>`;
}

(async () => {
  let chromium;
  try { ({ chromium } = require('playwright')); }
  catch (e) { console.error('Playwright is not installed here, so covers were not rendered. Posts fall back to the default share image.'); process.exit(0); }

  const args = process.argv.slice(2);
  const all = args.includes('--all');
  const only = args.filter((a) => !a.startsWith('--'));
  const posts = fs.readdirSync(SRC).filter((f) => f.endsWith('.md')).map(frontMatter)
    .filter((p) => !p.image && p.draft !== 'true')
    .filter((p) => (only.length ? only.includes(p.slug) : all || !fs.existsSync(path.join(OUT, p.slug, 'cover.jpg'))));
  if (!posts.length) { console.log('Covers are up to date.'); return; }

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  for (const p of posts) {
    await page.setContent(html(p), { waitUntil: 'networkidle' }).catch(() => {});
    await page.evaluate(() => document.fonts.ready);
    const dir = path.join(OUT, p.slug);
    fs.mkdirSync(dir, { recursive: true });
    await page.screenshot({ path: path.join(dir, 'cover.jpg'), type: 'jpeg', quality: 86 });
    console.log('cover: blog/' + p.slug + '/cover.jpg');
  }
  await browser.close();
})();
