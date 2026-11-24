#!/usr/bin/env node
/*
  Raise AI blog feedback loop: collects the data each scheduled run uses to
  decide what to write next and which old post to improve.

  Usage:
    node build/blog/feedback.js            check live pages + pull Clarity numbers, save a snapshot
    node build/blog/feedback.js --no-save  same, but only print

  What it does:
    1. Live check: every published post on https://raiseai.in must load (200),
       show the right title, carry its schema, and be listed in sitemap.xml
       and llms.txt. A broken page is fixed before anything else.
    2. Clarity (if a Clarity data-export token is saved as a network secret
       for www.clarity.ms): visits, engaged time, scroll depth per blog page,
       and visitor sources (Google, ChatGPT, Perplexity, Instagram...) for the
       last 3 days. Clarity only keeps 3 days in its export API, so each run
       saves its snapshot and the history adds up over time.
    3. Search checks: read from build/blog/performance/search-checks.json,
       which the agent updates by searching each post's primary keyword.

  Output: build/blog/performance/snapshots/YYYY-MM-DD.json and a printed
  summary. Read build/blog/LEARNINGS.md and AUTOPILOT.md for how to act on it.
  Zero dependencies (Node 18+, uses global fetch through the session proxy).
*/
'use strict';
// Node's built-in fetch only uses the session's HTTPS proxy when this flag is set
// (Node 22.21+). Re-run once with it, so the script works with a plain "node" call.
if (process.env.HTTPS_PROXY && !process.env.NODE_USE_ENV_PROXY) {
  const r = require('child_process').spawnSync(process.execPath, ['--no-warnings', ...process.argv.slice(1)], { stdio: 'inherit', env: { ...process.env, NODE_USE_ENV_PROXY: '1' } });
  process.exit(r.status === null ? 1 : r.status);
}
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const SRC = path.join(__dirname, 'posts');
const PERF = path.join(__dirname, 'performance');
const SNAP = path.join(PERF, 'snapshots');
const SITE = 'https://raiseai.in';
const SAVE = !process.argv.includes('--no-save');
const today = new Date().toISOString().slice(0, 10);

// Hosts that mean "an AI assistant sent this visitor".
const AI_SOURCES = /chatgpt|openai|perplexity|gemini\.google|bard|copilot|claude\.ai|you\.com|phind|meta\.ai/i;

function posts() {
  return fs.readdirSync(SRC).filter((f) => f.endsWith('.md')).map((f) => {
    const raw = fs.readFileSync(path.join(SRC, f), 'utf8');
    const fm = {};
    const m = raw.match(/^---\n([\s\S]*?)\n---/);
    if (m) for (const l of m[1].split('\n')) { const kv = l.match(/^([A-Za-z]+):\s*(.*)$/); if (kv) fm[kv[1]] = kv[2].trim(); }
    const slug = fm.slug || f.replace(/\.md$/, '');
    return {
      slug, title: fm.title, date: fm.date, updated: fm.updated || fm.date, category: fm.category,
      primary: (fm.keywords || '').split('|')[0].trim(), draft: fm.draft === 'true',
      path: `/blog/${slug}/`,
    };
  }).filter((p) => !p.draft);
}

async function get(url, headers = {}) {
  try {
    const r = await fetch(url, { headers: { 'user-agent': 'raiseai-blog-feedback/1.0', ...headers }, redirect: 'follow' });
    return { status: r.status, text: await r.text() };
  } catch (e) {
    return { status: 0, text: '', error: String(e.cause ? e.cause.code || e.cause.message : e.message) };
  }
}

async function liveCheck(list) {
  const [sitemap, llms] = await Promise.all([get(SITE + '/sitemap.xml'), get(SITE + '/llms.txt')]);
  if (!sitemap.status) return { reachable: false, error: sitemap.error, pages: [] };
  const pages = [];
  for (const p of list) {
    const r = await get(SITE + p.path);
    const issues = [];
    const canonical = (r.text.match(/<link rel="canonical" href="([^"]+)"/) || [])[1] || '';
    if (r.status !== 200) issues.push(`HTTP ${r.status || r.error}`);
    else if (canonical !== SITE + p.path) issues.push(`page not live: the site returned ${canonical || 'another page'} instead (not merged yet, or a soft 404)`);
    else {
      const title = (r.text.match(/<h1>([^<]*)<\/h1>/) || [])[1] || '';
      if (p.title && title.replace(/&amp;/g, '&').trim() !== p.title.trim()) issues.push('live H1 differs from source (not merged yet?)');
      if (!r.text.includes('"FAQPage"')) issues.push('FAQ schema missing');
      if (!r.text.includes('"BlogPosting"')) issues.push('BlogPosting schema missing');
    }
    if (!sitemap.text.includes(SITE + p.path)) issues.push('not in sitemap.xml');
    if (!llms.text.includes(SITE + p.path)) issues.push('not in llms.txt');
    pages.push({ slug: p.slug, status: r.status, ok: issues.length === 0, issues });
  }
  return { reachable: true, pages };
}

// Clarity data export API. The real token is injected by the session proxy;
// the placeholder below is replaced before the request leaves the machine.
async function clarity(dimension) {
  const url = `https://www.clarity.ms/export-data/api/v1/project-live-insights?numOfDays=3&dimension1=${encodeURIComponent(dimension)}`;
  const r = await get(url, { Authorization: 'Bearer clarity-token-from-proxy', 'Content-Type': 'application/json' });
  if (r.status !== 200) return { ok: false, status: r.status || r.error, note: r.status === 401 || r.status === 403 ? 'token missing or not accepted' : 'not reachable' };
  try { return { ok: true, data: JSON.parse(r.text) }; } catch (e) { return { ok: false, status: 'bad JSON' }; }
}

// Flatten Clarity's [{metricName, information:[{...}]}] into rows keyed by the dimension value.
function flatten(data, dimension) {
  const rows = {};
  for (const metric of Array.isArray(data) ? data : []) {
    const name = metric.metricName || metric.name || 'metric';
    for (const info of metric.information || []) {
      const keyField = Object.keys(info).find((k) => k.toLowerCase() === dimension.toLowerCase()) ||
        Object.keys(info).find((k) => /url|source|channel|referrer/i.test(k));
      const key = keyField ? String(info[keyField]) : '(all)';
      rows[key] = rows[key] || {};
      for (const [k, v] of Object.entries(info)) if (k !== keyField) rows[key][`${name}.${k}`] = v;
    }
  }
  return rows;
}

function num(row, re) {
  const k = Object.keys(row || {}).find((x) => re.test(x));
  const v = k ? Number(row[k]) : NaN;
  return Number.isFinite(v) ? v : null;
}

async function main() {
  const list = posts();
  const snapshot = { date: today, posts: list.map(({ slug, primary, date, updated, category }) => ({ slug, primary, date, updated, category })) };

  console.log(`Feedback run ${today}: ${list.length} published posts\n`);

  // 1. Live check
  const live = await liveCheck(list);
  snapshot.live = live;
  if (!live.reachable) console.log(`LIVE CHECK: raiseai.in not reachable from here (${live.error}). Allow the host in the environment.`);
  else {
    const bad = live.pages.filter((p) => !p.ok);
    console.log(`LIVE CHECK: ${live.pages.length - bad.length}/${live.pages.length} pages OK`);
    bad.forEach((p) => console.log(`  ! ${p.slug}: ${p.issues.join('; ')}`));
  }

  // 2. Clarity
  const byUrl = await clarity('URL');
  if (!byUrl.ok) {
    console.log(`\nCLARITY: not connected (${byUrl.status}: ${byUrl.note}). Ask Hadhi for a Clarity data-export token (Settings > Data Export).`);
    snapshot.clarity = { connected: false, reason: `${byUrl.status}` };
  } else {
    const bySource = await clarity('Source');
    const urlRows = flatten(byUrl.data, 'URL');
    const srcRows = bySource.ok ? flatten(bySource.data, 'Source') : {};
    const blog = {};
    for (const [url, row] of Object.entries(urlRows)) {
      const m = url.match(/\/blog\/([a-z0-9-]+)\/?/);
      const key = m ? m[1] : (/\/blog\/?($|\?)/.test(url) ? '(blog index)' : null);
      if (!key) continue;
      blog[key] = blog[key] || { sessions: 0, rows: [] };
      blog[key].sessions += num(row, /traffic.*session|sessioncount|totalsession/i) || 0;
      blog[key].rows.push({ url, ...row });
    }
    const ai = Object.entries(srcRows).filter(([s]) => AI_SOURCES.test(s)).map(([source, row]) => ({ source, sessions: num(row, /session/i) }));
    snapshot.clarity = { connected: true, window: 'last 3 days', blog, sources: srcRows, aiSources: ai, raw: { byUrl: byUrl.data, bySource: bySource.ok ? bySource.data : null } };

    console.log('\nCLARITY (last 3 days), blog pages:');
    const ranked = Object.entries(blog).sort((a, b) => b[1].sessions - a[1].sessions);
    if (!ranked.length) console.log('  no blog visits recorded in this window');
    for (const [slug, v] of ranked) {
      const r = v.rows[0];
      const scroll = num(r, /scroll/i);
      const time = num(r, /engag.*(time|active)|activetime/i);
      console.log(`  ${String(v.sessions).padStart(5)} sessions  ${slug}${scroll != null ? `  scroll ${scroll}%` : ''}${time != null ? `  engaged ${time}s` : ''}`);
    }
    console.log(`\nAI ASSISTANT REFERRALS: ${ai.length ? ai.map((a) => `${a.source} (${a.sessions ?? '?'})`).join(', ') : 'none in this window'}`);
  }

  // 3. Search checks recorded by the agent
  const scFile = path.join(PERF, 'search-checks.json');
  const sc = fs.existsSync(scFile) ? JSON.parse(fs.readFileSync(scFile, 'utf8')) : { checks: [] };
  const latest = {};
  for (const c of sc.checks || []) if (!latest[c.keyword] || latest[c.keyword].date < c.date) latest[c.keyword] = c;
  snapshot.searchChecks = Object.values(latest);
  console.log('\nSEARCH CHECKS (latest per keyword):');
  const unchecked = list.filter((p) => p.primary && !latest[p.primary]);
  for (const c of Object.values(latest)) console.log(`  ${c.date}  ${c.found ? 'FOUND  ' : 'not yet'}  "${c.keyword}"${c.position ? ` (position ${c.position})` : ''}`);
  if (unchecked.length) console.log(`  never checked: ${unchecked.map((p) => `"${p.primary}"`).join(', ')}`);

  // Age of each post, to know when search data is meaningful (Google needs time).
  const ageDays = (d) => Math.round((Date.parse(today) - Date.parse(d)) / 86400000);
  snapshot.ages = Object.fromEntries(list.map((p) => [p.slug, ageDays(p.date)]));

  if (SAVE) {
    fs.mkdirSync(SNAP, { recursive: true });
    fs.writeFileSync(path.join(SNAP, `${today}.json`), JSON.stringify(snapshot, null, 2) + '\n');
    console.log(`\nSaved build/blog/performance/snapshots/${today}.json`);
  }
}

main();
