# მოძრავი ვულკანიზაცია გულადი — website

Bilingual (Georgian default, English) website for Guladi mobile tire service, rebuilt from
[the original site](https://modzravivulkanizaciaguladi.lovable.app/) with the same structure and
dark/orange identity, plus a hero slider, service pages, a gallery, light/dark theme, an intro
loader and a floating call/WhatsApp button.

Static site built with [Astro](https://astro.build) — no framework runtime, ~3 KB of JavaScript.

## Commands

```bash
npm install
npm run dev        # local dev server → http://localhost:4321
npm run build      # production build → dist/
npm run preview    # serve the build
npm run check      # type-check
```

The first build converts every photo to AVIF/WebP in several sizes and takes a few minutes; after
that the results are cached (`node_modules/.astro`) and builds take ~10 s.

## Deploying to Vercel

1. Push this folder to a Git repository and import it in Vercel (set **Root Directory** to this
   folder if it sits inside a larger repo). The Astro preset is detected automatically.
2. Canonical URLs, the sitemap and `robots.txt` use Vercel's production domain automatically.
   When you connect a custom domain, add an environment variable `SITE_URL=https://your-domain.ge`
   and redeploy.

`vercel.json` adds long-term caching for `/_astro/*` and basic security headers.

## Where things live

| What | File |
| --- | --- |
| Phone, WhatsApp number + pre-filled message, address, social links | `src/config/site.ts` |
| The 7 services (titles, texts, icons, main photo) | `src/config/services.ts` |
| Hero slider (which photos, order) | `src/config/photos.ts` → `slides` |
| All other texts, Georgian / English | `src/i18n/ka.ts`, `src/i18n/en.ts` |
| Colours, fonts, buttons | `src/styles/global.css` |
| Logo (vector) | `src/components/brand/logo.ts` |

The address on the original site was an unfilled placeholder, so it is hidden here
(`address: null`). Fill it in `site.ts` and it appears in the contact section and in the
structured data.

## Photos

Every photo lives in one folder per service:

```
src/assets/photos/work/
  tire-repair/          საბურავის შეკეთება
  tire-change/          საბურავის შეცვლა
  wheel-service/        დისკისა და საბურავის მომსახურება
  rim-straightening/    დისკის გასწორება
  wheel-balancing/      საბურავის ბალანსირება
  mobile-welding/       შედუღება ადგილზე
  roadside-assistance/  გზაზე გადაუდებელი დახმარება
  other/                photos that don't clearly belong to one service (create when needed)
```

**Adding your own photos:** drop the JPG/PNG files into the matching folder and rebuild. They
appear in the gallery automatically, listed before the stock photos, and if a service has one of
your photos it is used on that service's card and page instead of the stock photo. Optional
captions / alt text go in `captions` in `src/config/photos.ts` (without one, the alt text is
"<service> — photo N").

**Current photos:** free-licence stock photos, colour-graded by `scripts/prepare-photos.mjs`
(originals in `photos-source/stock/`) so they share the brand's dark, warm look. The first
hero slide and the logo come from the original website (`photos-source/reference/`).
Run `npm run photos` after changing anything in `photos-source/`.

| File (in `work/`) | Source |
| --- | --- |
| tire-repair/mechanic-inspecting-tire | [Pexels 6870311](https://www.pexels.com/photo/6870311/) |
| tire-repair/tire-repair-outdoors | [Pexels 13746776](https://www.pexels.com/photo/13746776/) |
| tire-change/impact-wrench-wheel-change | [Pexels 17600886](https://www.pexels.com/photo/17600886/) |
| tire-change/mechanic-changing-tire | [Pexels 3806249](https://www.pexels.com/photo/3806249/) |
| tire-change/impact-wrench-wheel-nuts | [Pexels 8985603](https://www.pexels.com/photo/8985603/) |
| tire-change/impact-wrench-kneeling | [Pexels 6870318](https://www.pexels.com/photo/6870318/) |
| wheel-service/tire-pressure-check | [Pexels 3807386](https://www.pexels.com/photo/3807386/) |
| wheel-service/tire-inflation | [Pexels 3807695](https://www.pexels.com/photo/3807695/) |
| wheel-service/wheel-inspection | [Pexels 8986147](https://www.pexels.com/photo/8986147/) |
| wheel-service/wheel-nuts-close-up | [Pexels 8986177](https://www.pexels.com/photo/8986177/) |
| wheel-service/tires-and-alloy-wheel | [Pexels 34357281](https://www.pexels.com/photo/34357281/) |
| rim-straightening/alloy-rim-close-up | [Pexels 12590837](https://www.pexels.com/photo/12590837/) |
| rim-straightening/alloy-wheel-on-car | [Pexels 12173187](https://www.pexels.com/photo/12173187/) |
| wheel-balancing/mounting-balanced-wheel | Unsplash — `images.unsplash.com/photo-1645445522156-9ac06bc7a767` |
| mobile-welding/welding-sparks | [Pexels 15888226](https://www.pexels.com/photo/15888226/) |
| mobile-welding/welder-at-work | [Pexels 2381463](https://www.pexels.com/photo/2381463/) |
| roadside-assistance/service-van-technician | [Pexels 13821194](https://www.pexels.com/photo/13821194/) |
| roadside-assistance/mobile-tire-workshop | [Pexels 8660855](https://www.pexels.com/photo/8660855/) |
| roadside-assistance/roadside-tire-change | [Pexels 9518248](https://www.pexels.com/photo/9518248/) |

Licences: [Pexels](https://www.pexels.com/license/), [Unsplash](https://unsplash.com/license) —
free for commercial use, no attribution required (the footer credits them anyway).

## Brand assets

`npm run brand` regenerates the favicons, app icons, `site.webmanifest` and the two 1200×630
social-share images (`public/og-image.jpg`, `public/og-image-en.jpg`) from the vector logo.
It renders the share images in headless Chrome (set `CHROME_PATH` if Chrome is not in the
default Windows location).

## Features

- **Intro loader** — the badge pops in, the letters of "გულადი" follow, the van drives along a
  dashed road, then the panel lifts away with a curved orange edge (~2 s, CSS only). Shown once per
  browser session; skipped with reduced motion.
- **Hero slider** — 5 slides, autoplay with progress bars, pause/play, arrows, dots, swipe and
  arrow keys. Pauses while the tab is hidden or the hero is off-screen; no autoplay with reduced
  motion. Phones get 9:16 crops of each photo.
- **Floating contact button** — modelled on sabacho.ge: the phone button expands into WhatsApp
  (`wa.me` with a pre-filled message in the page's language) and Call (`tel:`), and turns into a
  close button. Escape or a click outside closes it.
- **Theme** — follows the system on the first visit, toggle in the header, saved in
  `localStorage`.
- **Language** — GE / EN switch keeps you on the same page; the choice is saved and a returning
  visitor is sent to their language.
- **SEO** — unique titles/descriptions, canonical + hreflang, Open Graph/Twitter cards,
  `AutoRepair` + `Service` + `BreadcrumbList` structured data, sitemap, robots.txt.

## QA scripts

```bash
npm run build
node scripts/qa/serve.mjs 5000                 # production-like server (brotli, cache headers)
node scripts/qa/functional.mjs                 # clicks through every feature, prints PASS/FAIL
node scripts/qa/shoot.mjs qa-out 390 dark / /en/   # full-page screenshots + console/broken-image checks
node scripts/qa/lighthouse.mjs qa-out mobile / /en/ /services/tire-repair/
```

(In Git Bash on Windows prefix the last two with `MSYS_NO_PATHCONV=1` so `/en/` isn't rewritten.)
