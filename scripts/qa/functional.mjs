// QA: exercises every interactive feature in a real browser and prints PASS/FAIL.
// Usage: node scripts/qa/functional.mjs   (serve dist first: node scripts/qa/serve.mjs 5000)
import { chromium } from 'playwright-core';

const BASE = process.env.BASE ?? 'http://localhost:5000';
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
let fails = 0;
const check = (name, ok, extra = '') => {
  if (!ok) fails++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? `  — ${extra}` : ''}`);
};
const errorsOf = (page) => {
  const errs = [];
  page.on('pageerror', (e) => errs.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  return errs;
};

// ── 1. Loader ──
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  const errs = errorsOf(page);
  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
  const shown = await page.evaluate(() => document.documentElement.classList.contains('has-loader') && getComputedStyle(document.querySelector('.loader')).display !== 'none');
  check('loader shows on the first visit', shown);
  await page.waitForTimeout(2600);
  check('loader removes itself after ~2s', await page.evaluate(() => !document.documentElement.classList.contains('has-loader')));
  await page.goto(BASE + '/services/tire-repair/', { waitUntil: 'domcontentloaded' });
  check('loader does not repeat in the same session', await page.evaluate(() => !document.documentElement.classList.contains('has-loader')));
  check('no console errors (loader run)', errs.length === 0, errs.join(' | '));
  await ctx.close();

  const rm = await browser.newContext({ reducedMotion: 'reduce' });
  const p2 = await rm.newPage();
  await p2.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
  check('loader skipped with reduced motion', await p2.evaluate(() => !document.documentElement.classList.contains('has-loader')));
  await rm.close();
}

// shared context: intro already seen
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'light' });
await ctx.addInitScript(() => sessionStorage.setItem('guladi-intro', '1'));

// ── 2. Slider ──
{
  const page = await ctx.newPage();
  const errs = errorsOf(page);
  await page.goto(BASE + '/', { waitUntil: 'load' });
  const active = () => page.evaluate(() => [...document.querySelectorAll('[data-slide]')].findIndex((s) => s.classList.contains('is-active')));
  check('slider starts on slide 1', (await active()) === 0);
  check('only one <h1> on the home page', (await page.locator('h1').count()) === 1);
  await page.click('[data-next]');
  check('next arrow → slide 2', (await active()) === 1);
  check('inactive slides are inert', await page.evaluate(() => document.querySelectorAll('[data-slide][inert]').length === 4));
  await page.click('[data-prev]');
  check('prev arrow → slide 1', (await active()) === 0);
  await page.click('[data-dot="3"]');
  check('dot 4 → slide 4', (await active()) === 3);
  await page.waitForTimeout(400);
  check('slide images load after interaction', await page.evaluate(() => !document.querySelectorAll('[data-slide]')[3].querySelector('img').src.startsWith('data:')));
  // swipe left (Playwright's click() scrolls the page a little — reset first)
  await page.evaluate(() => scrollTo(0, 0));
  await page.waitForTimeout(200);
  const box = await page.locator('[data-track]').boundingBox();
  await page.mouse.move(box.x + box.width * 0.7, box.y + box.height * 0.3);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.3, box.y + box.height * 0.3, { steps: 5 });
  await page.mouse.up();
  check('swipe left → next slide', (await active()) === 4);
  // autoplay
  await page.mouse.move(5, 5);
  await page.locator('body').click({ position: { x: 5, y: 5 } }).catch(() => {});
  await page.evaluate(() => document.activeElement?.blur());
  const before = await active();
  await page.waitForTimeout(7600);
  check('autoplay advances after ~7s', (await active()) !== before, `${before} → ${await active()}`);
  await page.click('[data-toggle]');
  check('pause button pauses', await page.evaluate(() => document.querySelector('[data-slider]').classList.contains('is-paused')));
  const paused = await active();
  await page.waitForTimeout(7600);
  check('paused slider stays put', (await active()) === paused);
  await page.click('[data-toggle]');
  check('play button resumes', await page.evaluate(() => document.querySelector('[data-slider]').classList.contains('is-playing')));
  check('no console errors (slider)', errs.length === 0, errs.join(' | '));
  await page.close();
}

// ── 3. Floating contact widget ──
{
  const page = await ctx.newPage();
  await page.goto(BASE + '/', { waitUntil: 'load' });
  const vis = () => page.evaluate(() => [...document.querySelectorAll('.fab__item')].map((li) => getComputedStyle(li).visibility === 'visible' && +getComputedStyle(li).opacity > 0.9));
  check('contact options hidden at first', (await vis()).every((v) => !v));
  await page.click('[data-fab-toggle]');
  await page.waitForTimeout(800);
  check('click expands both options', (await vis()).every(Boolean));
  check('main button turns into a close button', (await page.getAttribute('[data-fab-toggle]', 'aria-expanded')) === 'true');
  const hrefs = await page.$$eval('[data-fab-item]', (as) => as.map((a) => a.href));
  check('phone option uses tel:+995555474656', hrefs.includes('tel:+995555474656'), hrefs.join(' '));
  check('WhatsApp option uses wa.me/995555474656 with a Georgian message', hrefs.some((h) => h.startsWith('https://wa.me/995555474656?text=') && /%E1%83/.test(h)));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(800);
  check('Escape closes it', (await vis()).every((v) => !v));
  await page.click('[data-fab-toggle]');
  await page.waitForTimeout(300);
  await page.click('[data-fab-toggle]');
  await page.waitForTimeout(800);
  check('clicking the main button again closes it', (await vis()).every((v) => !v));
  const allTel = await page.$$eval('a[href^="tel:"]', (as) => [...new Set(as.map((a) => a.getAttribute('href')))]);
  check('every call link points at the same number', allTel.length === 1 && allTel[0] === 'tel:+995555474656', allTel.join(' '));
  await page.close();
}

// ── 4. Theme ──
{
  const page = await ctx.newPage();
  await page.goto(BASE + '/', { waitUntil: 'load' });
  check('first visit follows the system theme (light)', (await page.getAttribute('html', 'data-theme')) === 'light');
  await page.click('[data-theme-toggle]');
  await page.waitForTimeout(800);
  check('toggle switches to dark', (await page.getAttribute('html', 'data-theme')) === 'dark');
  check('choice saved in localStorage', (await page.evaluate(() => localStorage.getItem('guladi-theme'))) === 'dark');
  await page.reload({ waitUntil: 'load' });
  check('theme persists after reload', (await page.getAttribute('html', 'data-theme')) === 'dark');
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  check('dark background applied', bg === 'rgb(10, 11, 13)', bg);
  await page.evaluate(() => localStorage.removeItem('guladi-theme'));
  await page.close();
}

// ── 5. Language ──
{
  const page = await ctx.newPage();
  await page.goto(BASE + '/services/wheel-balancing/', { waitUntil: 'load' });
  await page.click('.header [data-lang-link="en"]');
  await page.waitForURL('**/en/services/wheel-balancing/');
  check('EN switch keeps the same page', page.url().endsWith('/en/services/wheel-balancing/'));
  check('language saved in localStorage', (await page.evaluate(() => localStorage.getItem('guladi-lang'))) === 'en');
  check('<html lang="en">', (await page.getAttribute('html', 'lang')) === 'en');
  // returning visitor typing the Georgian URL directly → English
  const p2 = await ctx.newPage();
  await p2.goto(BASE + '/', { waitUntil: 'load' });
  check('returning visitor lands on their saved language', p2.url().endsWith('/en/'), p2.url());
  await p2.click('.header [data-lang-link="ka"]');
  await p2.waitForURL(BASE + '/');
  check('GE switch goes back to Georgian', (await p2.getAttribute('html', 'lang')) === 'ka');
  await p2.close();
  // no Georgian text left on English pages (outside elements marked lang="ka")
  const enPages = ['/en/', '/en/services/tire-repair/', '/en/services/tire-change/', '/en/services/wheel-service/', '/en/services/rim-straightening/', '/en/services/wheel-balancing/', '/en/services/mobile-welding/', '/en/services/roadside-assistance/'];
  for (const p of enPages) {
    await page.goto(BASE + p, { waitUntil: 'load' });
    const leftovers = await page.evaluate(() => {
      const out = [];
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) {
        const n = walker.currentNode;
        if (/[\u10A0-\u10FF]/.test(n.textContent) && !n.parentElement.closest('[lang="ka"]')) out.push(n.textContent.trim().slice(0, 40));
      }
      for (const el of document.querySelectorAll('[alt],[aria-label],[title]'))
        for (const a of ['alt', 'aria-label', 'title']) if (/[\u10A0-\u10FF]/.test(el.getAttribute(a) ?? '') && !el.closest('[lang="ka"]')) out.push(`${a}=${el.getAttribute(a).slice(0, 40)}`);
      return out;
    });
    check(`no untranslated Georgian on ${p}`, leftovers.length === 0, leftovers.join(' | '));
  }
  await page.evaluate(() => localStorage.removeItem('guladi-lang'));
  await page.close();
}

// ── 6. Gallery + lightbox ──
{
  const page = await ctx.newPage();
  await page.goto(BASE + '/#gallery', { waitUntil: 'load' });
  const visibleTiles = () => page.$$eval('#gallery .tile', (ts) => ts.filter((t) => !t.hidden).map((t) => t.dataset.cat));
  check('gallery shows 8 photos at first', (await visibleTiles()).length === 8);
  await page.click('#gallery [data-more]');
  check('"show more" reveals the rest', (await visibleTiles()).length === (await page.$$eval('#gallery .tile', (t) => t.length)));
  await page.click('#gallery [data-filter="tire-change"]');
  const tc = await visibleTiles();
  check('category filter shows only that category', tc.length > 0 && tc.every((c) => c === 'tire-change'), tc.join(','));
  await page.click('#gallery .tile:not([hidden]) .tile__btn');
  await page.waitForTimeout(600);
  check('click opens the lightbox', await page.evaluate(() => document.querySelector('[data-lightbox]').open));
  check('lightbox image loads', await page.evaluate(() => document.querySelector('[data-lb-img]').naturalWidth > 1000));
  const c1 = await page.textContent('[data-lb-count]');
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(300);
  const c2 = await page.textContent('[data-lb-count]');
  check('arrow key moves to the next photo', c1 !== c2, `${c1} → ${c2}`);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  check('Escape closes the lightbox', await page.evaluate(() => !document.querySelector('[data-lightbox]').open));
  await page.close();
}

// ── 7. Mobile ──
{
  const m = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
  await m.addInitScript(() => sessionStorage.setItem('guladi-intro', '1'));
  const page = await m.newPage();
  await page.goto(BASE + '/', { waitUntil: 'load' });
  check('mobile: burger visible, desktop nav hidden', (await page.isVisible('[data-menu-toggle]')) && !(await page.isVisible('.nav')));
  await page.tap('[data-menu-toggle]');
  check('mobile: burger opens the menu', await page.isVisible('#mobile-menu'));
  await page.tap('#mobile-menu a[data-nav="contact"]');
  await page.waitForTimeout(1200);
  check('mobile: menu link closes menu and scrolls to section', !(await page.isVisible('#mobile-menu')) && (await page.evaluate(() => scrollY)) > 1000);
  check('mobile: no horizontal scroll', await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  // FAB does not cover the slider arrows
  await page.evaluate(() => scrollTo(0, 0));
  await page.waitForTimeout(300);
  const overlap = await page.evaluate(() => {
    const f = document.querySelector('.fab__main').getBoundingClientRect();
    return [...document.querySelectorAll('.hero__btn')].some((b) => {
      const r = b.getBoundingClientRect();
      return !(r.right <= f.left || r.left >= f.right || r.bottom <= f.top || r.top >= f.bottom);
    });
  });
  check('mobile: contact button does not cover slider controls', !overlap);
  await page.tap('[data-fab-toggle]');
  await page.waitForTimeout(800);
  check('mobile: contact widget opens by tap', await page.evaluate(() => document.querySelector('[data-fab]').classList.contains('is-open')));
  await m.close();
}

// ── 8. Section jumps land exactly under the header ──
for (const [w, h] of [
  [1440, 900],
  [390, 844],
]) {
  const c = await browser.newContext({ viewport: { width: w, height: h } });
  await c.addInitScript(() => sessionStorage.setItem('guladi-intro', '1'));
  const page = await c.newPage();
  const off = [];
  for (const id of ['services', 'why', 'how', 'gallery', 'contact']) {
    await page.goto(BASE + '/', { waitUntil: 'load' });
    if (w < 700) {
      await page.click('[data-menu-toggle]');
      await page.click(`#mobile-menu a[data-nav="${id}"]`);
    } else await page.click(`.nav a[data-nav="${id}"]`);
    await page.waitForTimeout(2000);
    const top = await page.evaluate((id) => Math.round(document.getElementById(id).getBoundingClientRect().top), id);
    if (Math.abs(top - 80) > 12) off.push(`${id}@${top}`);
  }
  await page.goto(BASE + '/#contact', { waitUntil: 'load' });
  await page.waitForTimeout(1500);
  const top = await page.evaluate(() => Math.round(document.getElementById('contact').getBoundingClientRect().top));
  if (Math.abs(top - 80) > 12) off.push(`direct #contact@${top}`);
  check(`${w}px: nav links land on their sections`, off.length === 0, off.join(' '));
  await c.close();
}

// ── 9. Links ──
{
  const page = await ctx.newPage();
  const seen = new Set();
  const queue = ['/', '/en/'];
  const bad = [];
  while (queue.length) {
    const p = queue.shift();
    if (seen.has(p)) continue;
    seen.add(p);
    const res = await page.goto(BASE + p, { waitUntil: 'domcontentloaded' });
    if (!res.ok()) bad.push(`${p} ${res.status()}`);
    const links = await page.$$eval('a[href]', (as) => as.map((a) => a.getAttribute('href')));
    for (const h of links) {
      if (!h.startsWith('/')) continue;
      const path = h.split('#')[0];
      if (!seen.has(path)) queue.push(path);
    }
    // in-page anchors exist
    const missing = await page.$$eval('a[href*="#"]', (as) =>
      as
        .map((a) => new URL(a.href))
        .filter((u) => u.pathname === location.pathname && u.hash.length > 1 && !document.getElementById(u.hash.slice(1)))
        .map((u) => u.hash),
    );
    if (missing.length) bad.push(`${p} missing anchors ${missing.join(',')}`);
  }
  for (const f of ['/robots.txt', '/sitemap-index.xml', '/sitemap-0.xml', '/favicon.svg', '/site.webmanifest', '/og-image.jpg', '/og-image-en.jpg']) {
    const r = await page.request.get(BASE + f);
    if (!r.ok()) bad.push(`${f} ${r.status()}`);
  }
  check(`all internal links + SEO files respond (${seen.size} pages crawled)`, bad.length === 0, bad.join(' | '));
  const r404 = await page.request.get(BASE + '/nope/');
  check('unknown URL returns the 404 page', r404.status() === 404);
  await page.close();
}

await browser.close();
console.log(fails ? `\n${fails} FAILED` : '\nALL PASSED');
process.exit(fails ? 1 : 0);
