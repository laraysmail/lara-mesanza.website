# laramesanza.com — real site

Multi-page rebuild of the homepage mockup (`lara-homepage-v13_1.html`), built with [Astro](https://docs.astro.build). Design system, motion language, and copy rules are locked per the project brief; see `/Users/laramesanza/.claude/plans/whimsical-crafting-kite.md` for the build plan this was scaffolded from.

## Editing content without touching code

Most day-to-day edits are one-line changes in `src/data/*.json`, not markup changes:

- **`src/data/products.json`** — tienda items. Add a new object to the array for a new product: `id`, `type` (`propio`/`afiliado`), `source` (Amazon/AliExpress/Leroy Merlin/Propio), `name`, `price`, `categories` (array of `furgo`/`camion`/`terreno`/`viaje`), `url`, `featured` (only one item should be `true`).
- **`src/data/discounts.json`** — descuentos codes. Add an object: `id`, `category` (`camper`/`viaje`), `name`, `description`, `code`, `off`, `url`. New items automatically flow into the 3-column waterfall and the filter pills.
- **`src/data/services.json`** — asesoramiento service cards. Add a second object to this array to add a second service (e.g. land/property advice) without touching `asesoramiento.astro`.
- **`src/data/site.json`** — trust-strip stats and the homepage subline ("current chapter"). Update `currentChapterSubline` as the journey moves on; update `stats` once real numbers are confirmed.
- **`src/data/videos.json`** — fallback video list, used until `site.json`'s `youtubeChannelId` is filled in (see below).

## Open items (from the project brief, not yet resolved)

- **Checkout platform** for digital products (Gumroad vs. Payhip vs. other) — not decided, so buy buttons currently point at placeholder `#` links.
- **Product image/price data**: currently manual (edited in `products.json`), not live. Amazon and AliExpress both have official affiliate APIs for live price/image data, but both require an approved affiliate account with API access — worth revisiting once that's in place. Leroy Merlin and Temu have no public affiliate API; scraping their pages was ruled out as too fragile/against ToS.
- **YouTube live data**: `src/pages/index.astro` fetches the latest 3 videos at build time from the channel's public RSS feed once `youtubeChannelId` is set in `site.json` (no API key needed). Subscriber count in `site.json` is still a manually-set placeholder — making it live needs a YouTube Data API key from Lara.
- **Hosting target**: brief says "somewhere modern, Vercel/Netlify-style," not finalized. The contact form (`src/pages/contacto.astro`) and the discount email-capture form (`src/components/DiscountsSection.astro`) are both UI-only right now (`onsubmit="return false;"`) pending that decision — Netlify Forms is zero-config if we land there, otherwise Formspree or similar.
- **Redirects**: `redirects.template.txt` is scaffolded but empty of real mappings — needs the actual list of indexed URLs from the current WordPress site (Search Console or a crawl) before the domain switches over.
- **Real photos/video**: every image area is currently a gradient placeholder, matching the mockup, pending real assets from Lara.
- **Bilingual (English) support**: not decided, currently Spanish-only per the brief.

## Project structure

```
src/
  layouts/BaseLayout.astro   — <head>, header, footer, progress rail, shared scripts
  styles/                    — design tokens (tokens.css) + resets/utilities (global.css)
  scripts/                   — motion.js (every page), filters.js (every page), home-motion.js (homepage only)
  components/                — one component per section/card, reused across pages where noted above
  data/                      — editable content, see above
  pages/                     — index.astro, tienda.astro, descuentos.astro, asesoramiento.astro, contacto.astro
```

## Commands

| Command           | Action                                       |
| :----------------- | :-------------------------------------------- |
| `npm install`       | Install dependencies                          |
| `npm run dev`       | Local dev server at `localhost:4321`          |
| `npm run build`     | Build production site to `./dist/`            |
| `npm run preview`   | Preview the production build locally          |
