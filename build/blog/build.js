#!/usr/bin/env node
/*
  Raise AI blog generator. Zero dependencies (Node 18+).

  Source of truth:  build/blog/posts/*.md   (one Markdown file per post)
  Generated output: blog/<slug>/index.html, blog/index.html, blog/rss.xml,
                    and the blog entries inside sitemap.xml and llms.txt.

  Usage:
    node build/blog/build.js          build everything
    node build/blog/build.js --check  validate only, write nothing (exit 1 on errors)

  The site has no deploy-time build step, so the generated files are committed.
  Never hand-edit generated files: edit the .md source and re-run this script.
  Post format and writing rules: build/blog/AUTOPILOT.md
*/
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const SRC = path.join(__dirname, 'posts');
const PARTIALS = path.join(__dirname, 'partials');
const OUT = path.join(ROOT, 'blog');
const SITE = 'https://raiseai.in';
const ASSET_V = '4'; // bump when assets/blog.css or assets/blog.js change
const DEFAULT_OG = '/assets/images/results/AI_advertisement_jpg.webp';
const CHECK_ONLY = process.argv.includes('--check');

const BLOG = {
  title: 'Raise AI Blog | AI Guides and Prompts for Working Professionals',
  description: 'Practical AI guides and copy-paste ChatGPT and Gemini prompts for architects, interior designers, civil engineers and creators, from Raise AI in Kerala.',
  rssDescription: 'Practical AI guides and copy-paste prompts for working professionals, from the Raise AI team in Kerala.',
};

const AUTHOR = {
  name: 'Hadhi Muhammed P.',
  id: SITE + '/#hadhi',
  url: SITE + '/about/',
  jobTitle: 'Founder & AI Mentor, Raise AI',
  image: SITE + '/assets/images/founder/hadhi-cutout.webp?v=3',
  sameAs: [
    'https://www.instagram.com/hadhi_creates_',
    'https://www.linkedin.com/in/hadhi-muhammed-p-71667b378/',
    'https://x.com/amHadhi',
  ],
  bio: 'Founder of Raise AI in Kozhikode, Kerala. He makes AI video ads and teaches working professionals, including architects, interior designers and civil engineers, to use AI in their own job.',
};

// Order here is the order of the filter pills on /blog/.
const CATEGORIES = {
  'ai-for-architects': 'AI for architects',
  'ai-for-interiors': 'AI for interior designers',
  'ai-for-civil-engineers': 'AI for civil engineers',
  'ai-video': 'AI video',
  'ai-at-work': 'AI at work',
  'raise-ai-stories': 'Raise AI stories',
};

const CTAS = {
  webinar: {
    tag: 'Live webinar',
    text: 'Want to do this with us, live?',
    button: 'Start with the live webinar',
    bar: 'Register for live workshop',
    href: '/webinar/',
    event: 'blog_to_webinar',
    pixel: 'BlogToWebinar',
    final: 'Reading is step one. <span class="key">Building is step two.</span>',
  },
  aec: {
    tag: 'Architects cohort',
    text: 'We are building an AI course together with architects, interior designers and civil engineers. Want to be part of it?',
    button: 'Join the architects cohort',
    bar: 'Join the architects cohort',
    href: '/webinar/aec/',
    event: 'blog_to_aec',
    pixel: 'BlogToAEC',
    final: 'Prompts are step one. <span class="key">A real workflow is step two.</span>',
  },
};

const ARROW = '<i><svg viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></i>';

/* ---------- small helpers ---------- */

const read = (p) => fs.readFileSync(p, 'utf8');
const partial = (name) => read(path.join(PARTIALS, name)).trimEnd();
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const xml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const slugify = (s) => s.toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const human = (d) => { const [y, m, day] = d.split('-').map(Number); return `${day} ${MONTHS[m - 1]} ${y}`; };
const iso = (d) => `${d}T00:00:00+05:30`;
const rfc822 = (d) => {
  const [y, m, day] = d.split('-').map(Number);
  const dow = new Date(Date.UTC(y, m - 1, day)).getUTCDay();
  return `${DAYS[dow]}, ${String(day).padStart(2, '0')} ${MONTHS[m - 1]} ${y} 00:00:00 +0530`;
};
// Markdown-ish text -> plain text (for schema, meta, RSS).
const plain = (s) => String(s)
  .replace(/!?\[([^\]]+)\]\([^)]+\)/g, '$1')
  .replace(/\*\*([^*]+)\*\*/g, '$1')
  .replace(/\*([^*\n]+)\*/g, '$1')
  .replace(/`([^`]+)`/g, '$1')
  .replace(/\s+/g, ' ')
  .trim();
const words = (s) => (plain(s).match(/[A-Za-z0-9₹%'’.-]+/g) || []).length;

/* ---------- inline Markdown ---------- */

function inline(src) {
  let s = esc(src);
  const codes = [];
  s = s.replace(/`([^`]+)`/g, (m, c) => { codes.push(c); return `\u0000${codes.length - 1}\u0000`; });
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, text, url) => {
    const external = /^https?:\/\//.test(url) && !url.startsWith(SITE);
    return external
      ? `<a href="${url}" target="_blank" rel="noopener">${text}</a>`
      : `<a href="${url}">${text}</a>`;
  });
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>');
  s = s.replace(/\u0000(\d+)\u0000/g, (m, i) => `<code>${codes[Number(i)]}</code>`);
  return s;
}

/* ---------- block Markdown ---------- */

// Renders Markdown blocks to HTML. `ctx` collects page-level pieces
// (table of contents, FAQ, sources, takeaways) that the template places itself.
function renderBlocks(md, ctx) {
  const lines = md.replace(/\r\n?/g, '\n').split('\n');
  const out = [];
  let para = [];
  const flush = () => { if (para.length) { out.push(`<p>${inline(para.join(' '))}</p>`); para = []; } };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // :::container blocks
    const open = line.match(/^:::([a-z]+)\s*(.*)$/);
    if (open) {
      flush();
      const body = [];
      i++;
      while (i < lines.length && lines[i].trim() !== ':::') { body.push(lines[i]); i++; }
      if (i >= lines.length) throw new Error(`Unclosed :::${open[1]} block`);
      out.push(container(open[1], open[2].trim(), body, ctx));
      continue;
    }

    if (!line.trim()) { flush(); continue; }

    const h = line.match(/^(#{2,3})\s+(.+)$/);
    if (h) {
      flush();
      const level = h[1].length;
      const text = h[2].trim();
      let id = slugify(plain(text)).slice(0, 60).replace(/-+$/, '');
      while (ctx.ids.has(id)) id += '-2';
      ctx.ids.add(id);
      if (level === 2) ctx.toc.push({ id, text: plain(text) });
      out.push(`<h${level} id="${id}">${inline(text)}</h${level}>`);
      continue;
    }

    if (/^\s*([-*]|\d+\.)\s+/.test(line)) {
      flush();
      const ordered = /^\s*\d+\./.test(line);
      const items = [];
      while (i < lines.length && (/^\s*([-*]|\d+\.)\s+/.test(lines[i]) || (/^\s{2,}\S/.test(lines[i]) && items.length))) {
        const m = lines[i].match(/^\s*(?:[-*]|\d+\.)\s+(.*)$/);
        if (m && !/^\s{2,}\S/.test(lines[i])) items.push(m[1]);
        else if (m && items.length === 0) items.push(m[1]);
        else items[items.length - 1] += ' ' + lines[i].trim();
        i++;
      }
      i--;
      const tag = ordered ? 'ol' : 'ul';
      out.push(`<${tag}>\n${items.map((t) => `  <li>${inline(t)}</li>`).join('\n')}\n</${tag}>`);
      continue;
    }

    if (/^\|.*\|\s*$/.test(line) && i + 1 < lines.length && /^\|[\s:|-]+\|\s*$/.test(lines[i + 1])) {
      flush();
      const cells = (l) => l.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
      const head = cells(line);
      i += 2;
      const rows = [];
      while (i < lines.length && /^\|.*\|\s*$/.test(lines[i])) { rows.push(cells(lines[i])); i++; }
      i--;
      out.push(
        '<div class="tbl" role="region" aria-label="Table" tabindex="0"><table>\n<thead><tr>' +
        head.map((c) => `<th scope="col">${inline(c)}</th>`).join('') + '</tr></thead>\n<tbody>\n' +
        rows.map((r) => '<tr>' + r.map((c, n) => (n === 0 ? `<th scope="row">${inline(c)}</th>` : `<td>${inline(c)}</td>`)).join('') + '</tr>').join('\n') +
        '\n</tbody>\n</table></div>'
      );
      continue;
    }

    if (/^>\s?/.test(line)) {
      flush();
      const q = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) { q.push(lines[i].replace(/^>\s?/, '')); i++; }
      i--;
      out.push(`<blockquote><p>${inline(q.join(' '))}</p></blockquote>`);
      continue;
    }

    para.push(line.trim());
  }
  flush();
  return out.join('\n');
}

function container(name, arg, body, ctx) {
  const text = body.join('\n').trim();
  switch (name) {
    case 'takeaways':
      ctx.takeaways = body.map((l) => l.match(/^\s*[-*]\s+(.*)$/)).filter(Boolean).map((m) => m[1]);
      return '';
    case 'faq': {
      let cur = null;
      for (const l of body) {
        const q = l.match(/^###\s+(.+)$/);
        if (q) { cur = { q: q[1].trim(), a: [] }; ctx.faq.push(cur); }
        else if (cur && l.trim()) cur.a.push(l.trim());
      }
      ctx.faq.forEach((f) => { if (Array.isArray(f.a)) f.a = f.a.join(' '); });
      return '';
    }
    case 'sources':
      for (const l of body) {
        const m = l.match(/^\s*[-*]\s+\[([^\]]+)\]\(([^)\s]+)\)\s*(?:[:-]\s*)?(.*)$/);
        if (m) ctx.sources.push({ title: m[1], url: m[2], note: m[3].trim() });
      }
      return '';
    case 'prompt': {
      const [title, works] = arg.split('|').map((s) => s.trim());
      const tools = (works || 'ChatGPT, Gemini').split(',').map((s) => s.trim()).filter(Boolean);
      ctx.prompts++;
      let id = 'prompt-' + slugify(title).slice(0, 50).replace(/-+$/, '');
      while (ctx.ids.has(id)) id += '-2';
      ctx.ids.add(id);
      const opens = tools.map((t) => {
        if (/chatgpt/i.test(t)) return '<a href="https://chatgpt.com/" target="_blank" rel="noopener" data-copy-open>Copy + open ChatGPT</a>';
        if (/gemini/i.test(t)) return '<a href="https://gemini.google.com/app" target="_blank" rel="noopener" data-copy-open>Copy + open Gemini</a>';
        return '';
      }).join('');
      return `<figure class="prompt" id="${id}">
<figcaption><h3>${inline(title)}</h3><span class="works">Works in ${tools.map(esc).join(' · ')}</span></figcaption>
<pre tabindex="0"><code>${esc(text)}</code></pre>
<div class="p-actions"><button type="button" data-copy>Copy prompt</button>${opens}</div>
</figure>`;
    }
    case 'note':
      return `<aside class="note"><b>${esc(arg || 'Note')}</b>${renderBlocks(text, ctx)}</aside>`;
    case 'figure': {
      const [src, size, alt] = arg.split('|').map((s) => s.trim());
      const [w, hgt] = (size || '').split('x');
      return `<figure class="post-shot${Number(w) > Number(hgt) ? ' wide' : ''}">
<img src="${esc(src)}" alt="${esc(alt || '')}" width="${esc(w)}" height="${esc(hgt)}" loading="lazy" decoding="async">
${text ? `<figcaption>${inline(text)}</figcaption>` : ''}
</figure>`;
    }
    case 'cta':
      ctx.hasMidCta = true;
      return '<!--MIDCTA-->';
    default:
      throw new Error(`Unknown block :::${name}`);
  }
}

/* ---------- load posts ---------- */

function loadPost(file) {
  const raw = read(path.join(SRC, file));
  const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) throw new Error(`${file}: missing front matter`);
  const fm = {};
  for (const l of m[1].split('\n')) {
    if (!l.trim() || l.trim().startsWith('#')) continue;
    const kv = l.match(/^([A-Za-z]+):\s*(.*)$/);
    if (!kv) throw new Error(`${file}: bad front matter line: ${l}`);
    fm[kv[1]] = kv[2].trim();
  }
  const ctx = { toc: [], faq: [], sources: [], takeaways: [], ids: new Set(), prompts: 0, hasMidCta: false };
  const bodyHtml = renderBlocks(m[2], ctx);
  const post = {
    file,
    slug: fm.slug || file.replace(/\.md$/, ''),
    title: fm.title,
    seoTitle: fm.seoTitle || fm.title,
    description: fm.description,
    excerpt: fm.excerpt || fm.description,
    crumb: fm.crumb || fm.title,
    category: fm.category,
    date: fm.date,
    updated: fm.updated || fm.date,
    keywords: (fm.keywords || '').split('|').map((s) => s.trim()).filter(Boolean),
    answer: fm.answer,
    audience: fm.audience || '',
    cta: fm.cta || 'webinar',
    image: fm.image || '',
    imageAlt: fm.imageAlt || '',
    imageSize: fm.imageSize || '',
    draft: fm.draft === 'true',
    featured: fm.featured === 'true',
    bodyHtml,
    bodyMd: m[2],
    ...ctx,
  };
  post.url = `${SITE}/blog/${post.slug}/`;
  post.path = `/blog/${post.slug}/`;
  const total = words(m[2]) + words(post.answer || '');
  post.wordCount = total;
  post.readMin = Math.max(2, Math.round(total / 200));
  const cover = path.join(OUT, post.slug, 'cover.jpg');
  post.cover = fs.existsSync(cover) ? `/blog/${post.slug}/cover.jpg` : '';
  post.ogImage = post.image || post.cover || DEFAULT_OG;
  return post;
}

/* ---------- validation ---------- */

function validate(posts) {
  const errors = [];
  const warnings = [];
  const seen = new Set();
  const paths = new Set(posts.map((p) => p.path));
  for (const p of posts) {
    const E = (msg) => errors.push(`${p.file}: ${msg}`);
    const W = (msg) => warnings.push(`${p.file}: ${msg}`);
    for (const k of ['title', 'description', 'category', 'date', 'answer']) if (!p[k]) E(`missing "${k}"`);
    if (seen.has(p.slug)) E(`duplicate slug ${p.slug}`);
    seen.add(p.slug);
    if (!/^[a-z0-9-]+$/.test(p.slug)) E('slug must be lowercase letters, numbers and hyphens');
    if (p.category && !CATEGORIES[p.category]) E(`unknown category "${p.category}"`);
    if (!CTAS[p.cta]) E(`unknown cta "${p.cta}"`);
    for (const k of ['date', 'updated']) if (p[k] && !/^\d{4}-\d{2}-\d{2}$/.test(p[k])) E(`${k} must be YYYY-MM-DD`);
    if (p.date && p.updated && p.updated < p.date) E('updated is before date');
    if (p.seoTitle && (p.seoTitle + ' | Raise AI').length > 65) W(`<title> is ${(p.seoTitle + ' | Raise AI').length} chars (aim for 65 or less; set seoTitle)`);
    if (p.description && (p.description.length < 110 || p.description.length > 165)) W(`description is ${p.description.length} chars (aim for 120 to 160)`);
    const aw = words(p.answer || '');
    if (aw < 35 || aw > 90) W(`short answer is ${aw} words (aim for 40 to 80)`);
    if (p.faq.length < 3) E(`needs at least 3 FAQ questions (has ${p.faq.length})`);
    if (p.faq.some((f) => !f.a)) E('an FAQ question has no answer');
    if (p.sources.length < 2) E(`needs at least 2 sources (has ${p.sources.length})`);
    if (p.takeaways.length < 3) W('fewer than 3 key takeaways');
    if (p.toc.length < 3) W('fewer than 3 H2 sections');
    if (p.wordCount < 700) W(`only ${p.wordCount} words`);
    if (!p.keywords.length) E('missing keywords (first one is the primary keyword)');
    else {
      const kw = p.keywords[0].toLowerCase();
      const tokens = kw.split(/\s+/).filter((t) => t.length > 2);
      const has = (text) => tokens.every((t) => text.toLowerCase().includes(t));
      if (!has(p.title)) W(`primary keyword "${kw}" not fully in title`);
      if (!has(p.answer || '') && !has(p.description || '')) W(`primary keyword "${kw}" not in short answer or description`);
    }
    if (/[—–]/.test(p.bodyMd + p.title + p.description + p.answer)) W('contains an en or em dash (house style: use commas, colons or "to")');
    const internal = [...p.bodyMd.matchAll(/\]\((\/[^)\s#]*)/g)].map((x) => x[1]);
    if (!internal.length) W('no internal links in the body');
    for (const href of internal) {
      if (href.startsWith('/blog/') && href !== '/blog/' && !paths.has(href)) E(`links to missing post ${href}`);
      else if (!href.startsWith('/blog/')) {
        const target = path.join(ROOT, href);
        if (!fs.existsSync(target) && !fs.existsSync(path.join(target, 'index.html'))) E(`broken internal link ${href}`);
      }
    }
    if (p.image && !fs.existsSync(path.join(ROOT, p.image.split('?')[0]))) E(`image not found: ${p.image}`);
    if (!p.image && !p.cover) W('no cover yet: run "node build/blog/covers.js"');
  }
  return { errors, warnings };
}

/* ---------- templates ---------- */

function head({ title, description, canonical, ogType, ogTitle, ogImage, ogImageSize, extraMeta = '', jsonld }) {
  const img = ogImage.startsWith('http') ? ogImage : SITE + ogImage;
  const size = ogImageSize
    ? `\n<meta property="og:image:width" content="${ogImageSize[0]}">\n<meta property="og:image:height" content="${ogImageSize[1]}">`
    : '';
  return `<!doctype html>
<html lang="en-IN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
<link rel="canonical" href="${canonical}">
<link rel="alternate" type="application/rss+xml" title="Raise AI Blog" href="${SITE}/blog/rss.xml">${extraMeta}

<!-- Open Graph / Meta -->
<meta property="og:type" content="${ogType}">
<meta property="og:site_name" content="Raise AI">
<meta property="og:url" content="${canonical}">
<meta property="og:title" content="${esc(ogTitle)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:image" content="${img}">${size}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(ogTitle)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${img}">

${partial('head-common.html')}
<link rel="stylesheet" href="/assets/blog.css?v=${ASSET_V}">

<!-- Schema.org JSON-LD -->
<script type="application/ld+json">
${JSON.stringify(jsonld, null, 2).replace(/</g, '\\u003c')}
</script>
</head>`;
}

function stickyBar(cta) {
  return `<!-- Sticky mobile bar -->
<div class="bar show" id="sticky-bar">
  <a class="btn" href="${cta.href}" id="bar-cta-btn" data-cta="${cta.event}_sticky">
    ${cta.bar}
    ${ARROW}
  </a>
  <a class="wa" href="https://wa.me/917356003301?text=Hi%2C%20I%20have%20a%20question%20about%20Raise%20AI." aria-label="Chat with us on WhatsApp" id="bar-wa-btn">
    <svg viewBox="0 0 24 24" fill="none" stroke="#17191C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4 20l1.3-4.2A8 8 0 1 1 8.4 19L4 20z"/>
    </svg>
  </a>
</div>`;
}

function finalCta(cta) {
  return `<section class="sec-dark final">
  <div class="wrap">
    <h2>${cta.final}</h2>
    <a class="btn" href="${cta.href}" id="final-cta-btn" data-cta="${cta.event}_final">
      ${cta.button}
      ${ARROW}
    </a>
  </div>
  <div class="shape" aria-hidden="true"></div>
</section>`;
}

function related(post, posts) {
  const others = posts.filter((p) => p.slug !== post.slug);
  const score = (p) => (p.category === post.category ? 2 : 0) + (p.cta === post.cta ? 1 : 0);
  const picks = others.sort((a, b) => score(b) - score(a) || (a.date < b.date ? 1 : -1)).slice(0, 3);
  const rows = picks.map((p) => `        <a class="post" href="${p.path}">
          <small>${esc(CATEGORIES[p.category])}</small>
          <h3>${esc(p.title)}</h3>
          <p>${esc(p.excerpt)}</p>
        </a>`);
  if (rows.length < 2) {
    rows.push(`        <a class="post" href="/results/">
          <small>Student Results</small>
          <h3>AI ads made by Raise AI students</h3>
          <p>UGC ads, product B-roll and more, made without a camera or studio.</p>
        </a>`);
  }
  return rows.join('\n');
}

function postPage(post, posts) {
  const cta = CTAS[post.cta];
  const cat = CATEGORIES[post.category];
  const midbox = `<div class="midbox">
  <span class="tag tag-lime">${cta.tag}</span>
  <p>${cta.text}</p>
  <a class="btn" href="${cta.href}" id="midbox-cta-btn" data-cta="${cta.event}">
    ${cta.button}
    ${ARROW}
  </a>
</div>`;
  const body = post.bodyHtml.replace('<!--MIDCTA-->', midbox);

  const jsonld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        '@id': post.url + '#article',
        headline: post.title,
        description: post.description,
        image: SITE + post.ogImage,
        datePublished: iso(post.date),
        dateModified: iso(post.updated),
        inLanguage: 'en-IN',
        articleSection: cat,
        keywords: post.keywords.join(', '),
        wordCount: post.wordCount,
        ...(post.audience ? { audience: { '@type': 'Audience', audienceType: post.audience } } : {}),
        author: {
          '@type': 'Person',
          '@id': AUTHOR.id,
          name: AUTHOR.name,
          url: AUTHOR.url,
          jobTitle: AUTHOR.jobTitle,
          image: AUTHOR.image,
          sameAs: AUTHOR.sameAs,
        },
        publisher: {
          '@type': 'EducationalOrganization',
          '@id': SITE + '/#org',
          name: 'Raise AI',
          url: SITE + '/',
          logo: SITE + '/assets/images/logo/logo-light.webp',
        },
        mainEntityOfPage: post.url,
        url: post.url,
        isPartOf: { '@id': SITE + '/blog/#blog' },
        ...(post.sources.length ? { citation: post.sources.map((s) => ({ '@type': 'CreativeWork', name: s.title, url: s.url })) } : {}),
      },
      {
        '@type': 'FAQPage',
        '@id': post.url + '#faq',
        mainEntity: post.faq.map((f) => ({
          '@type': 'Question',
          name: plain(f.q),
          acceptedAnswer: { '@type': 'Answer', text: plain(f.a) },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE + '/' },
          { '@type': 'ListItem', position: 2, name: 'Blog', item: SITE + '/blog/' },
          { '@type': 'ListItem', position: 3, name: post.crumb, item: post.url },
        ],
      },
    ],
  };

  const updatedBit = post.updated !== post.date ? ` · Updated <time datetime="${post.updated}">${human(post.updated)}</time>` : '';
  const coverFig = post.image
    ? `
      <figure class="cover-img">
        <img src="${esc(post.image)}" alt="${esc(post.imageAlt)}"${post.imageSize ? ` width="${post.imageSize.split('x')[0]}" height="${post.imageSize.split('x')[1]}"` : ''} loading="eager" decoding="async">
      </figure>
`
    : '';
  const takeaways = post.takeaways.length
    ? `
      <div class="kt">
        <b>Key takeaways</b>
        <ul>
${post.takeaways.map((t) => `          <li>${inline(t)}</li>`).join('\n')}
        </ul>
      </div>
`
    : '';
  const toc = post.toc.length >= 3
    ? `
      <nav class="toc" aria-label="In this guide">
        <b>In this guide</b>
        <ol>
${post.toc.map((t) => `          <li><a href="#${t.id}">${esc(t.text)}</a></li>`).join('\n')}
        </ol>
      </nav>
`
    : '';
  const sources = post.sources.length
    ? `
      <h2 class="sub" id="sources">Sources</h2>
      <ul class="sources">
${post.sources.map((s) => `        <li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a>${s.note ? `: <span>${inline(s.note)}</span>` : ''}</li>`).join('\n')}
      </ul>
      <p class="checked">Facts in this guide were last checked on <time datetime="${post.updated}">${human(post.updated)}</time>. AI tools change their plans and features often, so confirm limits and prices on the official pages above.</p>
`
    : '';

  return `${head({
    title: `${post.seoTitle} | Raise AI`,
    description: post.description,
    canonical: post.url,
    ogType: 'article',
    ogTitle: post.title,
    ogImage: post.ogImage,
    ogImageSize: post.ogImage === post.cover ? [1200, 630] : null,
    extraMeta: `
<meta name="author" content="${esc(AUTHOR.name)}">
<meta property="article:published_time" content="${iso(post.date)}">
<meta property="article:modified_time" content="${iso(post.updated)}">
<meta property="article:section" content="${esc(cat)}">`,
    jsonld,
  })}
<body id="top">

${partial('header.html')}

<main>

<section class="sec" style="padding-top:20px">
  <div class="wrap">
    <article class="article">

      <nav class="crumb" aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/blog/">Blog</a> / <span aria-current="page">${esc(post.crumb)}</span></nav>

      <div style="margin-top:24px"><span class="tag">${esc(cat)}</span></div>

      <h1>${esc(post.title)}</h1>

      <p class="by">By <a href="/about/">${esc(AUTHOR.name)}</a> · <time datetime="${post.date}">${human(post.date)}</time>${updatedBit} · ${post.readMin} min read</p>

      <div class="answer">
        <b>Short answer:</b> ${inline(post.answer)}
      </div>
${coverFig}${takeaways}${toc}
      <div class="body">
${body}
      </div>

      <h2 class="sub" id="faq">Questions people ask</h2>
      <div class="faq" style="margin-top:20px">
${post.faq.map((f, n) => `        <details${n === 0 ? ' open' : ''}>
          <summary>${inline(f.q)}</summary>
          <p>${inline(f.a)}</p>
        </details>`).join('\n')}
      </div>
${sources}
      <div class="author">
        <img src="/assets/images/founder/hadhi-cutout-2.webp" alt="${esc(AUTHOR.name)}, founder of Raise AI" width="64" height="64" loading="lazy" decoding="async" style="object-fit:cover;object-position:top;background:var(--soft-white)">
        <div>
          <b>${esc(AUTHOR.name)}</b>
          <p>${esc(AUTHOR.bio)} <a href="/about/">About us</a></p>
        </div>
      </div>

      <h2 class="sub">Read next</h2>
      <div class="posts" style="margin-top:20px">
${related(post, posts)}
      </div>
    </article>
  </div>
</section>

${finalCta(cta)}

</main>

${partial('footer.html')}

${stickyBar(cta)}

<script>window.RAISE_POST = { slug: ${JSON.stringify(post.slug)}, event: ${JSON.stringify(cta.event)}, pixel: ${JSON.stringify(cta.pixel)} };</script>
<script src="/assets/blog.js?v=${ASSET_V}" defer></script>

</body>
</html>
`;
}

function indexPage(posts) {
  const feat = posts.find((p) => p.featured) || posts[0];
  const rest = posts.filter((p) => p !== feat);
  const usedCats = Object.keys(CATEGORIES).filter((c) => posts.some((p) => p.category === c));
  const cta = CTAS.webinar;
  const jsonld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Blog',
        '@id': SITE + '/blog/#blog',
        url: SITE + '/blog/',
        name: 'Raise AI Blog',
        description: BLOG.description,
        publisher: { '@id': SITE + '/#org' },
        inLanguage: 'en-IN',
        blogPost: posts.map((p) => ({
          '@type': 'BlogPosting',
          '@id': p.url + '#article',
          headline: p.title,
          url: p.url,
          datePublished: iso(p.date),
          dateModified: iso(p.updated),
          author: { '@id': AUTHOR.id },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE + '/' },
          { '@type': 'ListItem', position: 2, name: 'Blog', item: SITE + '/blog/' },
        ],
      },
    ],
  };
  const featImg = feat.image || feat.cover || DEFAULT_OG;
  const featAlt = feat.image ? feat.imageAlt : `Cover: ${feat.title}`;
  return `${head({
    title: BLOG.title,
    description: BLOG.description,
    canonical: SITE + '/blog/',
    ogType: 'website',
    ogTitle: BLOG.title,
    ogImage: DEFAULT_OG,
    jsonld,
  })}
<body id="top">

${partial('header.html')}

<main>

<section class="phero">
  <div class="wrap">
    <nav class="crumb" aria-label="Breadcrumb"><a href="/">Home</a> / <span aria-current="page">Blog</span></nav>
    <div class="tagrow"><span class="tag">Blog</span></div>
    <h1>Learn something <span class="key">today.</span></h1>
    <span class="underline"></span>
    <p class="lead">Practical AI guides and copy-paste ChatGPT and Gemini prompts for architects, interior designers, civil engineers and creators. Written by the Raise AI team in Kerala.</p>
  </div>
</section>

<section class="sec" style="padding-top:0">
  <div class="wrap">
    <div class="pills" role="group" aria-label="Filter posts by topic">
      <button data-f="all" aria-pressed="true">All</button>
${usedCats.map((c) => `      <button data-f="${c}" aria-pressed="false">${esc(CATEGORIES[c])}</button>`).join('\n')}
    </div>

    <a class="feat" href="${feat.path}" data-cat="${feat.category}" aria-label="Read the latest post: ${esc(feat.title)}">
      <div class="ph">
        <img src="${esc(featImg)}" alt="${esc(featAlt)}" width="1200" height="630" loading="eager" decoding="async">
      </div>
      <div class="in">
        <small>${esc(CATEGORIES[feat.category])}</small>
        <h2>${esc(feat.title)}</h2>
        <p>${esc(feat.excerpt)}</p>
        <p class="meta"><time datetime="${feat.date}">${human(feat.date)}</time> · ${feat.readMin} min read</p>
      </div>
    </a>

    <div class="posts">
${rest.map((p) => `      <a class="post" href="${p.path}" data-cat="${p.category}">
        <small>${esc(CATEGORIES[p.category])}</small>
        <h3>${esc(p.title)}</h3>
        <p>${esc(p.excerpt)}</p>
        <p class="meta"><time datetime="${p.date}">${human(p.date)}</time> · ${p.readMin} min read</p>
      </a>`).join('\n')}
    </div>
    <p class="blog-empty" id="blog-empty" hidden>No posts in this topic yet. New guides are on the way.</p>
  </div>
</section>

${finalCta(cta)}

</main>

${partial('footer.html')}

${stickyBar(cta)}

<script src="/assets/blog.js?v=${ASSET_V}" defer></script>

</body>
</html>
`;
}

function rss(posts) {
  const latest = posts.map((p) => p.updated).sort().pop();
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Raise AI Blog</title>
    <link>${SITE}/blog/</link>
    <atom:link href="${SITE}/blog/rss.xml" rel="self" type="application/rss+xml"/>
    <description>${xml(BLOG.rssDescription)}</description>
    <language>en-IN</language>
    <lastBuildDate>${rfc822(latest)}</lastBuildDate>
${posts.map((p) => `    <item>
      <title>${xml(p.title)}</title>
      <link>${p.url}</link>
      <guid isPermaLink="true">${p.url}</guid>
      <description>${xml(p.description)}</description>
      <author>support@raiseai.in (${xml(AUTHOR.name)})</author>
      <category>${xml(CATEGORIES[p.category])}</category>
      <pubDate>${rfc822(p.date)}</pubDate>
    </item>`).join('\n')}
  </channel>
</rss>
`;
}

function sitemap(posts) {
  const file = path.join(ROOT, 'sitemap.xml');
  let s = read(file);
  s = s.replace(/[ \t]*<url>\s*<loc>https:\/\/raiseai\.in\/blog\/[^<]*<\/loc>[\s\S]*?<\/url>\n?/g, '');
  const latest = posts.map((p) => p.updated).sort().pop();
  const entry = (loc, lastmod, freq, pri) => `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${freq}</changefreq>
    <priority>${pri}</priority>
  </url>
`;
  const block = entry(SITE + '/blog/', latest, 'weekly', '0.8') + posts.map((p) => entry(p.url, p.updated, 'monthly', '0.7')).join('');
  const anchor = s.indexOf('  <url>\n    <loc>https://raiseai.in/contact/</loc>');
  s = anchor >= 0 ? s.slice(0, anchor) + block + s.slice(anchor) : s.replace('</urlset>', block + '</urlset>');
  return s;
}

function llms(posts) {
  const file = path.join(ROOT, 'llms.txt');
  let s = read(file);
  s = s.replace(/^- Guide: .*\n/gm, '');
  s = s.replace(/^- Blog: .*$/m, `- Blog: ${BLOG.description} URL: ${SITE}/blog/`);
  s = s.replace(/## Blog posts\n[\s\S]*?(?=\n## )/, '').replace(/\n{3,}/g, '\n\n');
  const section = `## Blog posts\n\n${posts.map((p) => `- ${p.title}: ${p.description} URL: ${p.url}`).join('\n')}\n`;
  return s.replace('\n## Courses', `\n${section}\n## Courses`);
}

/* ---------- main ---------- */

function main() {
  const files = fs.readdirSync(SRC).filter((f) => f.endsWith('.md')).sort();
  const all = files.map(loadPost);
  const posts = all.filter((p) => !p.draft).sort((a, b) => (a.date === b.date ? a.slug.localeCompare(b.slug) : a.date < b.date ? 1 : -1));
  const { errors, warnings } = validate(posts);
  warnings.forEach((w) => console.log('  warn  ' + w));
  errors.forEach((e) => console.log('  ERROR ' + e));
  if (errors.length) { console.log(`\n${errors.length} error(s). Nothing written.`); process.exit(1); }
  if (CHECK_ONLY) { console.log(`\nOK: ${posts.length} post(s), ${warnings.length} warning(s).`); return; }

  for (const p of posts) {
    const dir = path.join(OUT, p.slug);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), postPage(p, [...posts]));
  }
  fs.writeFileSync(path.join(OUT, 'index.html'), indexPage(posts));
  fs.writeFileSync(path.join(OUT, 'rss.xml'), rss(posts));
  fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemap(posts));
  fs.writeFileSync(path.join(ROOT, 'llms.txt'), llms(posts));
  console.log(`\nBuilt ${posts.length} post(s): index, rss.xml, sitemap.xml and llms.txt updated. ${warnings.length} warning(s).`);
}

main();
