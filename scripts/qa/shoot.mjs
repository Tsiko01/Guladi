// QA: full-page screenshots + console errors + broken images + horizontal overflow.
// Usage: node scripts/qa/shoot.mjs <outDir> <width> [theme] <path...>
//   theme: dark | light (optional, default dark)
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';

let [outDir, width, ...rest] = process.argv.slice(2);
const theme = ['dark', 'light'].includes(rest[0]) ? rest.shift() : 'dark';
const paths = rest;
mkdirSync(outDir, { recursive: true });
const BASE = process.env.BASE ?? 'http://localhost:5000';
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const ctx = await browser.newContext({
  viewport: { width: +width, height: +width < 700 ? 844 : 900 },
  deviceScaleFactor: 1,
  reducedMotion: 'reduce',
});
await ctx.addInitScript((th) => {
  sessionStorage.setItem('guladi-intro', '1');
  localStorage.setItem('guladi-theme', th);
}, theme);
let errors = 0;
for (const p of paths) {
  const page = await ctx.newPage();
  page.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning') {
      errors++;
      console.log(`[${m.type()}] ${p}: ${m.text()}`);
    }
  });
  page.on('pageerror', (e) => {
    errors++;
    console.log(`[pageerror] ${p}: ${e.message}`);
  });
  page.on('requestfailed', (r) => {
    errors++;
    console.log(`[requestfailed] ${p}: ${r.url()}`);
  });
  page.on('response', (r) => r.status() >= 400 && console.log(`[http ${r.status()}] ${r.url()}`));
  const res = await page.goto(BASE + p, { waitUntil: 'networkidle' });
  if (!res.ok()) console.log(`[http ${res.status()}] ${p}`);
  // scroll through so lazy images and reveal animations run
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 500) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 80));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(600);
  const broken = await page.evaluate(() =>
    [...document.images].filter((i) => i.complete && i.naturalWidth === 0 && !i.src.startsWith('data:')).map((i) => i.currentSrc || i.src),
  );
  if (broken.length) {
    errors += broken.length;
    console.log(`[broken images] ${p}:`, broken);
  }
  const name = `${outDir}/${width}-${theme}${p.replace(/\//g, '_') || '_'}.png`;
  await page.screenshot({ path: name, fullPage: true });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  if (overflow > 0) {
    errors++;
    console.log(`[overflow] ${p}: ${overflow}px horizontal scroll`);
  }
  console.log('shot', name);
  await page.close();
}
await browser.close();
console.log('problems:', errors);
