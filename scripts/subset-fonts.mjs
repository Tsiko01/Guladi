// Subsets the self-hosted Noto Sans Georgian variable font (weight axis kept)
// to the characters the site uses: modern Georgian + basic Latin/punctuation.
// Run: npm run fonts
import subsetFont from 'subset-font';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => String.fromCodePoint(a + i)).join('');
const latin = range(0x20, 0x7e) + range(0xa0, 0xff) + '‐–—‘’‚“”„•…′″€™−→←✓№';
const georgian = range(0x10d0, 0x10ff) + '„“–—…«»·';

const base = `${root}node_modules/@fontsource-variable/noto-sans-georgian/files/`;
const jobs = [
  ['noto-sans-georgian-georgian-wght-normal.woff2', 'noto-sans-georgian.woff2', georgian],
  ['noto-sans-georgian-latin-wght-normal.woff2', 'noto-sans-georgian-latin.woff2', latin],
];
for (const [src, out, text] of jobs) {
  const input = readFileSync(base + src);
  const result = await subsetFont(input, text, { targetFormat: 'woff2', variationAxes: { wght: { min: 400, max: 900 } } });
  writeFileSync(`${root}src/assets/fonts/${out}`, result);
  console.log(out, `${(input.length / 1024).toFixed(1)}KB → ${(result.length / 1024).toFixed(1)}KB`);
}
