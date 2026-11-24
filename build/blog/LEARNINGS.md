# Raise AI blog: learnings

Read this first on every weekly run. Update it at the end of every run.
It is the memory of the feedback loop: what the site offers now, what the data
has shown, and what changed because of it. Keep it short and factual.

## Site and audience (from the weekly website scan)

Last scan: 24 Nov 2026 (origin/main at 6c34d54).

- **Main audience for the blog:** architects, interior designers, civil and site
  engineers, builders, mostly Kerala and India. Many already use ChatGPT and Gemini.
- **Offers on the site now:**
  - `/architects/`: "AI for Architects: From Empty Site to Finished Space". A free
    recorded session plus a 10-day hands-on cohort in 5 modules (plot photo to finished
    project, render to walkthrough video, Google Flow / Kling / Seedance, material
    control, studio marketing). Full refund before class 3. Added 23 Nov 2026.
    **Blog CTA for AEC and news posts points here.**
  - `/webinar/aec/`: the older invite-only co-creation page. The homepage card and
    footer still link here. Blog no longer links to it.
  - `/webinar/`: 2-hour live beginner workshop on AI video with free tools.
  - AI Ad Video Production Masterclass (14 days, 7 modules) for creators and editors.
- **Proof numbers on the homepage:** 25+ course students, 500+ webinar attendees,
  ₹1,00,000+ earned by students. `PROOF` in `build.js` matches.
- **Tools the cohort teaches:** Google Flow, Kling AI, Seedance, Gemini, ChatGPT.
  News about these tools is the most useful for this audience.

## Rules learned (keep until data says otherwise)

- Prompts the reader can paste right away are the core of every post.
- Say what AI cannot do (scale, structure, rules, rates). It builds trust.
- Every superlative needs proof (see Positioning in AUTOPILOT.md).
- Facts about plans and availability change weekly: always cite the official page
  and the date checked.
- Do not repeat a topic in back-to-back posts (for example two Kerala-house posts).

## Data so far

- 24 Nov 2026: all 10 posts live and passing the live check (200, correct title,
  BlogPosting and FAQ schema, in sitemap and llms.txt).
- Clarity: not connected yet (waiting for Hadhi's data-export token).
- Search checks: first round recorded 24 Nov (see `performance/search-checks.json`).
  Posts are 1 to 7 days old, so not being found yet is expected.

## Log

- **24 Nov 2026** (first weekly run, replaces the missed Monday 23 Nov post). Hadhi
  switched the blog to one verified-news article per week, published automatically.
  Website scan found the new `/architects/` page, so the blog CTA, the course post,
  the prompts-for-architects FAQ and the llms.txt course line now point to it and
  match its facts. Built the feedback loop (`feedback.js`, snapshots, search checks,
  decision rules). No traffic data yet.
