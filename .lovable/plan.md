## Goal

Crawler-visible (Facebook/Twitter/WhatsApp) per-region social share image + title + description for `/ar`, `/es`, `/global`, `/bd` and their `/explore` pages — by emitting real per-region `index.html` files at build time.

## Why this works on Lovable hosting

Lovable's hosting serves real files first and only falls back to root `index.html` when no file exists. So if `dist/ar/explore/index.html` exists, requests to `/ar/explore` get that file (with AR meta) — crawlers see the AR image without any JS. Real users still load the same React bundle and SPA continues normally.

## Changes

### 1. New file: `scripts/prerender-meta.mjs`

Post-build Node script. After `vite build` runs:

- Read `dist/index.html` as template
- For each region (`bd`, `ar`, `es`, `global`) and each route (`/{region}`, `/{region}/explore`):
  - Clone the template
  - Replace `<title>`, `<meta name="description">`, `og:title`, `og:description`, `og:image`, `twitter:title`, `twitter:description`, `twitter:image`, add `<link rel="canonical">` and `<meta property="og:locale">`
  - Write to `dist/{region}/index.html` and `dist/{region}/explore/index.html`
- Region meta hardcoded in the script (4 regions, small) — single source: title, description, ogImage path, locale, canonical base.

AR uses the new `/social/arabian-social-share.webp` (already in `public/`). BD/ES/Global keep the existing default image for now (easy to swap later by dropping new images in `public/social/` and updating the script).

### 2. `package.json` — chain prerender after build

Change `"build": "vite build"` → `"build": "vite build && node scripts/prerender-meta.mjs"`.
(Same for `build:dev` if needed.)

### 3. No changes to React code

The existing client-side meta updates in `Landing.tsx` / `Explore.tsx` stay (good for in-app navigation + browser tab title). Crawlers get the static per-region HTML; users get SPA.

## Out of scope

- Per-profile prerender for `/ar/explore/:id` — would need DB fetch at build time; those URLs fall back to root `index.html` (default image). Can add later if needed.
- Custom og images for ES/Global/BD — script structure supports it; just drop image into `public/social/` and update script.
- SSR / framework migration.

## Verification after deploy

```bash
curl -sL https://prothomalap.adxgram.com/ar/explore | grep -i 'og:image\|og:title'
curl -sL https://prothomalap.adxgram.com/ar | grep -i 'og:image'
curl -sL https://prothomalap.adxgram.com/ | grep -i 'og:image'  # default
```

AR routes should show the new arabian webp; root should show the existing default.
