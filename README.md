# RaiseAI Website

Static marketing + funnel site for raiseai.in (Raise AI).

- Pure static HTML/CSS/JS — no runtime build required (Tailwind CSS is pre-compiled into `/assets`).
- All webinar/replay videos are hosted on YouTube (unlisted) and embedded, not served from this repo.
- Deployed via Netlify (connect this repo in the Netlify dashboard; `netlify.toml` sets it to serve the root with no build).

## Structure
- `index.html` — home
- `webinar/` — webinar landing + payment
- `replay/` — replay pages
- `course/` — course dashboard + day pages
- `payment/`, `thankyou/`, `contact/`, `privacy/`, `terms/`, `refund/`, `delivery/` — funnel + legal pages
