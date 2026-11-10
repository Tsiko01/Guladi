// Builds favicons, app icons, the web manifest and the 1200×630 social-share
// images (Georgian + English) from the vector logo in src/components/brand/logo.ts.
// The share images are rendered in headless Chrome so the Georgian font is exact.
// Run: npm run brand   (needs Google Chrome installed; set CHROME_PATH if it isn't in the default place)
import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import { badgeSvg, RED } from '../src/components/brand/logo.ts';

const root = fileURLToPath(new URL('..', import.meta.url));
const pub = (p) => `${root}public/${p}`;

// ── icons ──
writeFileSync(pub('favicon.svg'), badgeSvg(512, 112));
const png = (size, file, { radius = 112, pad = 0, bg } = {}) => {
  const inner = size - pad * 2;
  const svg = Buffer.from(badgeSvg(inner, radius));
  const img = sharp({ create: { width: size, height: size, channels: 4, background: bg ?? { r: 0, g: 0, b: 0, alpha: 0 } } }).composite([
    { input: svg, left: pad, top: pad },
  ]);
  return img.png().toFile(pub(file));
};
await png(32, 'favicon-32.png', { radius: 96 });
await png(180, 'apple-touch-icon.png', { radius: 0 });
await png(192, 'icon-192.png');
await png(512, 'icon-512.png');
// maskable: full-bleed red with the artwork inside the safe zone
await png(512, 'icon-maskable-512.png', { radius: 0, pad: 64, bg: RED });

writeFileSync(
  pub('site.webmanifest'),
  JSON.stringify(
    {
      name: 'მოძრავი ვულკანიზაცია გულადი',
      short_name: 'გულადი',
      description: 'საბურავის მომსახურება ადგილზე — 24/7',
      lang: 'ka',
      start_url: '/',
      display: 'standalone',
      background_color: '#0a0b0d',
      theme_color: '#0a0b0d',
      icons: [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
    null,
    2,
  ),
);

// ── social-share images ──
const b64 = (file) => readFileSync(file).toString('base64');
const hero = await sharp(`${root}src/assets/photos/slides/hero.jpg`).resize(1200, 630, { fit: 'cover', position: 'right' }).jpeg({ quality: 85 }).toBuffer();
const fontKa = b64(`${root}src/assets/fonts/noto-sans-georgian.woff2`);
const fontLatin = b64(`${root}src/assets/fonts/noto-sans-georgian-latin.woff2`);
const copy = {
  ka: { badge: '24/7 მომსახურება ადგილზე', a: 'მოძრავი ვულკანიზაცია', b: 'გულადი', c: 'საბურავის შეკეთება, შეცვლა, ბალანსირება, დისკის გასწორება' },
  en: { badge: '24/7 on-the-spot service', a: 'Mobile Tire Service', b: 'Guladi', c: 'Tire repair, tire change, wheel balancing, rim straightening' },
};
const html = (c) => `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:N;src:url(data:font/woff2;base64,${fontKa}) format('woff2');font-weight:400 900;unicode-range:U+10A0-10FF}
@font-face{font-family:N;src:url(data:font/woff2;base64,${fontLatin}) format('woff2');font-weight:400 900;unicode-range:U+0000-00FF,U+2000-206F}
*{margin:0;box-sizing:border-box}body{width:1200px;height:630px;overflow:hidden;font-family:N,sans-serif;color:#f5f5f5;background:#0a0b0d url(data:image/jpeg;base64,${hero.toString('base64')}) right/cover}
.s{position:absolute;inset:0;background:linear-gradient(90deg,rgba(10,11,13,.96) 0%,rgba(10,11,13,.8) 48%,rgba(10,11,13,.15) 100%)}
.w{position:absolute;left:72px;top:64px;right:330px;bottom:64px;display:flex;flex-direction:column}
.logo{display:flex;align-items:center;gap:16px;font-weight:900;font-size:26px}.logo svg{width:64px;height:64px;border-radius:14px}
.badge{align-self:flex-start;margin-top:52px;padding:7px 18px;border:1.5px solid rgba(239,119,65,.55);border-radius:99px;background:rgba(210,71,11,.16);color:#ef7741;font-weight:700;font-size:21px}
h1{margin-top:22px;font-size:62px;line-height:1.12;font-weight:900}h1 span{display:block;color:#ef7741}
p{margin-top:auto;display:flex;align-items:center;gap:18px;font-size:22px;color:#c4c7cc}
.ph{flex:none;padding:12px 22px;border-radius:12px;background:#d2470b;color:#fff;font-weight:800;font-size:26px;box-shadow:0 12px 30px -10px rgba(210,71,11,.9)}
</style></head><body><div class="s"></div><div class="w">
<div class="logo">${badgeSvg(64, 96)}<span>${c.b}</span></div>
<div class="badge">${c.badge}</div><h1>${c.a}<span>${c.b}</span></h1>
<p><span class="ph">+995 555 47 46 56</span><span>${c.c}</span></p></div></body></html>`;

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
for (const [lang, file] of [
  ['ka', 'og-image.jpg'],
  ['en', 'og-image-en.jpg'],
]) {
  await page.setContent(html(copy[lang]), { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  const shot = await page.screenshot({ type: 'png' });
  await sharp(shot).jpeg({ quality: 86, mozjpeg: true }).toFile(pub(file));
  console.log('wrote', file);
}
await browser.close();
console.log('icons + manifest written to public/');
