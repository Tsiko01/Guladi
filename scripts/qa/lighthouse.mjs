// Runs Lighthouse (mobile + desktop) on a list of paths and prints scores + failing audits.
// Usage: node scripts/qa/lighthouse.mjs <outDir> <mobile|desktop> <path...>
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import { writeFileSync } from 'node:fs';

const [outDir, formFactor, ...paths] = process.argv.slice(2);
const BASE = process.env.BASE ?? 'http://localhost:5000';
const chrome = await chromeLauncher.launch({
  chromePath: process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  // DARK=1 → system dark preference, which the site follows when no theme is saved
  chromeFlags: ['--headless=new', '--no-first-run', ...(process.env.DARK ? ['--force-dark-mode', '--blink-settings=preferredColorScheme=0'] : [])],
});
const config =
  formFactor === 'desktop'
    ? (await import('lighthouse/core/config/desktop-config.js')).default
    : undefined;

const rows = [];
for (const p of paths) {
  const r = await lighthouse(BASE + p, { port: chrome.port, output: 'json', logLevel: 'error' }, config);
  const lhr = r.lhr;
  const s = Object.fromEntries(Object.entries(lhr.categories).map(([k, v]) => [k, Math.round(v.score * 100)]));
  const fails = Object.values(lhr.audits)
    .filter((a) => a.score !== null && a.score < 0.9 && a.scoreDisplayMode !== 'informative' && a.scoreDisplayMode !== 'notApplicable' && a.scoreDisplayMode !== 'manual')
    .map((a) => `${a.id}${a.displayValue ? ` (${a.displayValue})` : ''}`);
  const m = lhr.audits;
  rows.push(
    `${(process.env.DARK ? 'dark ' : '') + formFactor.padEnd(7)} ${p.padEnd(22)} perf ${s.performance}  a11y ${s.accessibility}  bp ${s['best-practices']}  seo ${s.seo}  | LCP ${m['largest-contentful-paint'].displayValue}  CLS ${m['cumulative-layout-shift'].displayValue}  TBT ${m['total-blocking-time'].displayValue}${fails.length ? `\n        ↳ ${fails.join(', ')}` : ''}`,
  );
  writeFileSync(`${outDir}/lh-${process.env.DARK ? 'dark-' : ''}${formFactor}${p.replace(/\//g, '_')}.json`, JSON.stringify(lhr));
}
chrome.kill();
console.log(rows.join('\n'));
