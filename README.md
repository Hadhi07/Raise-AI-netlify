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
- `blog/` — blog index, posts (one folder per post) and `blog/rss.xml`
- `payment/`, `thankyou/`, `contact/`, `privacy/`, `terms/`, `refund/`, `delivery/` — funnel + legal pages
- `sitemap.xml`, `robots.txt`, `llms.txt` — search and AI crawler files. Add every new public page to `sitemap.xml` and `llms.txt`; add every new post to `blog/index.html` and `blog/rss.xml`.
