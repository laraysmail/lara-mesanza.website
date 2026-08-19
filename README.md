# laramesanza.com — real site

Multi-page rebuild of the homepage mockup (`lara-homepage-v13_1.html`), built with [Astro](https://docs.astro.build). Design system, motion language, and copy rules are locked per the project brief; see `/Users/laramesanza/.claude/plans/whimsical-crafting-kite.md` for the build plan this was scaffolded from.

## Editing content without touching code

Most day-to-day edits are one-line changes in `src/data/*.json`, not markup changes:

- **`src/data/products.json`** — tienda items. Add a new object to the array for a new product: `id`, `type` (`propio`/`afiliado`), `source` (Amazon/AliExpress/Leroy Merlin/Propio), `name`, `price`, `categories` (array of `furgo`/`camion`/`terreno`/`viaje`), `url`, `featured` (only one item should be `true`).
- **`src/data/discounts.json`** — descuentos codes. Add an object: `id`, `name`, `description`, `category` (`camper`/`viaje`/`vida`, space-separated if more than one applies), `discountType` (`percentage`/`fixed`/`free`/`link`), `value` (number, or `null` for free/link), `code` (or `null` if the discount applies automatically through the link), `url`, `logo` (path to an image, or `null` for the placeholder badge). New items automatically flow into the 3-column waterfall and the filter pills. This mirrors the "Affiliations" database in Notion — that's the source of truth for which discounts are live.
- **`src/data/services.json`** — asesoramiento service cards. Add a second object to this array to add a second service (e.g. land/property advice) without touching `asesoramiento.astro`.
- **`src/data/site.json`** — trust-strip stats and the homepage subline ("current chapter"). Update `currentChapterSubline` as the journey moves on; update `stats` once real numbers are confirmed.
- **`src/data/videos.json`** — fallback video list, used until `site.json`'s `youtubeChannelId` is filled in (see below).

## Open items (from the project brief, not yet resolved)

- **Checkout platform** for digital products (Gumroad vs. Payhip vs. other) — not decided, so buy buttons currently point at placeholder `#` links.
- **Product image/price data**: currently manual (edited in `products.json`), not live. Amazon and AliExpress both have official affiliate APIs for live price/image data, but both require an approved affiliate account with API access — worth revisiting once that's in place. Leroy Merlin and Temu have no public affiliate API; scraping their pages was ruled out as too fragile/against ToS.
- **YouTube live data**: `src/pages/index.astro` fetches the latest 3 videos at build time from the channel's public RSS feed once `youtubeChannelId` is set in `site.json` (no API key needed). Subscriber count in `site.json` is still a manually-set placeholder — making it live needs a YouTube Data API key from Lara.
- **Redirects**: `redirects.template.txt` is scaffolded but empty of real mappings — needs the actual list of indexed URLs from the current WordPress site (Search Console or a crawl) before the domain switches over.
- **Real photos/video**: every image area is currently a gradient placeholder, matching the mockup, pending real assets from Lara.
- **Bilingual (English) support**: not decided, currently Spanish-only per the brief.
- **Discount logos**: `logo` is `null` on every entry in `discounts.json` right now (renders as a placeholder badge) — Lara is generating single-color brand marks separately; drop the file paths in once they exist.
- **Email capture form** (`src/components/DiscountsSection.astro`) is still UI-only (`onsubmit="return false;"`) — same fix as the contact form below applies once this is deployed on Netlify: add `data-netlify="true"`, a `form-name` hidden field, and wire the same submit handler.

## Hosting & the contact form (decided)

Hosting is **Netlify** — free tier, no cost. The domain (laramesanza.com) stays exactly as-is; only its DNS gets repointed once the new site is approved, and the current WordPress/Hostinger site stays live and untouched until then.

`src/pages/contacto.astro` is already wired for **Netlify Forms**: the `<form>` has `name="contacto"`, `data-netlify="true"`, a hidden `form-name` field, and a honeypot field (`bot-field`) for spam. Submission is intercepted by a small script that POSTs via `fetch` and shows an inline "mensaje enviado" state instead of a page reload/redirect.

**This only actually works once the site is deployed on Netlify** — Netlify Forms is detected at build/deploy time by crawling the built HTML for `data-netlify="true"` forms, so it can't be tested locally with `npm run dev` (submissions will just fail against `/`, which is expected until deployed). `netlify.toml` in the project root already sets the build command and publish directory, so connecting the repo in Netlify's dashboard (or `netlify deploy`) should work with no extra config.

To go live: push this repo to GitHub (or GitLab/Bitbucket), connect it in Netlify (netlify.com → Add new site → Import an existing project), and Netlify handles the rest — including a preview URL to check everything before repointing the real domain.

## Project structure

```
src/
  layouts/BaseLayout.astro   — <head>, header, footer, progress rail, shared scripts
  styles/                    — design tokens (tokens.css) + resets/utilities (global.css)
  scripts/                   — motion.js (every page), filters.js (every page), home-motion.js (homepage only)
  lib/youtube.js             — shared RSS-feed fetch, used by both index.astro and videos.astro
  components/                — one component per section/card, reused across pages where noted above
  data/                      — editable content, see above
  pages/                     — index.astro, tienda.astro, descuentos.astro, asesoramiento.astro, contacto.astro, videos.astro
```

## Commands

| Command           | Action                                       |
| :----------------- | :-------------------------------------------- |
| `npm install`       | Install dependencies                          |
| `npm run dev`       | Local dev server at `localhost:4321`          |
| `npm run build`     | Build production site to `./dist/`            |
| `npm run preview`   | Preview the production build locally          |
