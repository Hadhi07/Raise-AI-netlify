# RaiseAI Website

Static marketing + funnel site for raiseai.in (Raise AI).

- Pure static HTML/CSS/JS — no runtime build required (Tailwind CSS is pre-compiled into `/assets`).
- All webinar/replay videos are hosted on YouTube (unlisted) and embedded, not served from this repo.
- Hosted on Cloudflare. The repo root is deployed as static assets with no build step. `.assetsignore` keeps non-site files (handoff notes, Markdown, `node_modules`, package files, `build/`, helper scripts) from being published, and `_headers` sets cache and basic security headers.

## Structure
- `index.html` — home
- `webinar/` — webinar landing + payment
- `replay/` — replay pages
- `course/` — course dashboard + day pages
- `about/`, `results/`, `students/`, `reviews/` — company and proof pages
- `blog/` — blog index, posts (one folder per post) and `blog/rss.xml`. **Generated, do not edit by hand** (see Blog below)
- `payment/`, `thankyou/`, `contact/`, `privacy/`, `terms/`, `refund/`, `delivery/` — funnel + legal pages
- `sitemap.xml`, `robots.txt`, `llms.txt` — search and AI crawler files. Add every new public page to `sitemap.xml` and `llms.txt`. Blog entries in both files are written by the blog generator.

## Blog
Posts are Markdown files in `build/blog/posts/`. A zero-dependency Node script turns them into the pages in `blog/`, and updates `blog/index.html`, `blog/rss.xml` and the blog entries in `sitemap.xml` and `llms.txt`. The output is committed because the site has no deploy-time build.

- Write or edit a post: `build/blog/posts/<slug>.md`
- Build: `npm run build:blog` (renders share covers, then all pages)
- Validate only: `npm run check:blog`
- Topic queue: `build/blog/keywords.json`
- Format, writing rules and the scheduled-run playbook: `build/blog/AUTOPILOT.md`
