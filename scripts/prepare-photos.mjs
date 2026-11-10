// Prepares the site photos from the originals in photos-source/.
//   photos-source/reference/  the brand's hero photo and logo (from the original site)
//   photos-source/stock/      free-licence photos (pexels.com/license, unsplash.com/license),
//                             colour-graded here so they share one dark, warm look
// Output: src/assets/photos/  — Astro then builds AVIF/WebP in several sizes.
//   slides/hero.jpg                 first hero slide
//   work/<service-slug>/<name>.jpg  one folder per service; used by the service
//                                   cards, the slider and the gallery
// Your own photos can go straight into src/assets/photos/work/<service-slug>/
// (or work/other/) — no need to run this script for them.
// Run: npm run photos
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const src = (p) => `${root}photos-source/${p}`;
const out = (p) => {
  const file = `${root}src/assets/photos/${p}`;
  mkdirSync(dirname(file), { recursive: true });
  return file;
};

/** Soft dark vignette, multiplied over the photo. */
const vignette = (w, h, strength = 0.5) => {
  const v = Math.round(255 * (1 - strength));
  return Buffer.from(
    `<svg width="${w}" height="${h}"><defs><radialGradient id="v" cx="50%" cy="45%" r="75%">
      <stop offset="55%" stop-color="#fff"/><stop offset="100%" stop-color="rgb(${v},${v},${v})"/>
    </radialGradient></defs><rect width="100%" height="100%" fill="url(#v)"/></svg>`,
  );
};

/** Darker, slightly desaturated, warm shadows — one consistent look for all photos. */
async function grade(input, file, { brightness = 0.72, saturation = 0.76, maxW = 2000, maxH = 1800 } = {}) {
  const buf = await sharp(input).rotate().resize({ width: maxW, height: maxH, fit: 'inside', withoutEnlargement: true }).toBuffer();
  const { width: w, height: h } = await sharp(buf).metadata();
  await sharp(buf)
    .modulate({ brightness, saturation })
    .linear([1.04, 0.98, 0.9], [2, 0, -2])
    .composite([{ input: vignette(w, h), blend: 'multiply' }])
    .jpeg({ quality: 86, mozjpeg: true })
    .toFile(file);
  return file;
}

const copy = (input, file) => sharp(input).rotate().jpeg({ quality: 90, mozjpeg: true }).toFile(file).then(() => file);

const dark = { brightness: 0.9, saturation: 0.82 };

const jobs = [
  copy(src('reference/hero.jpg'), out('slides/hero.jpg')),

  // tire repair
  grade(src('stock/pexels-6870311.jpg'), out('work/tire-repair/mechanic-inspecting-tire.jpg')),
  grade(src('stock/pexels-13746776.jpg'), out('work/tire-repair/tire-repair-outdoors.jpg')),
  // tire change
  grade(src('stock/pexels-17600886.jpg'), out('work/tire-change/impact-wrench-wheel-change.jpg'), dark),
  grade(src('stock/pexels-3806249.jpg'), out('work/tire-change/mechanic-changing-tire.jpg')),
  grade(src('stock/pexels-8985603.jpg'), out('work/tire-change/impact-wrench-wheel-nuts.jpg')),
  grade(src('stock/pexels-6870318.jpg'), out('work/tire-change/impact-wrench-kneeling.jpg')),
  // wheel & tire service (diagnostics)
  grade(src('stock/pexels-3807386.jpg'), out('work/wheel-service/tire-pressure-check.jpg')),
  grade(src('stock/pexels-3807695.jpg'), out('work/wheel-service/tire-inflation.jpg')),
  grade(src('stock/pexels-8986147.jpg'), out('work/wheel-service/wheel-inspection.jpg')),
  grade(src('stock/pexels-8986177.jpg'), out('work/wheel-service/wheel-nuts-close-up.jpg')),
  grade(src('stock/pexels-34357281.jpg'), out('work/wheel-service/tires-and-alloy-wheel.jpg')),
  // rim straightening
  grade(src('stock/pexels-12590837.jpg'), out('work/rim-straightening/alloy-rim-close-up.jpg'), dark),
  grade(src('stock/pexels-12173187.jpg'), out('work/rim-straightening/alloy-wheel-on-car.jpg')),
  // wheel balancing
  grade(src('stock/unsplash-1645445522156.jpg'), out('work/wheel-balancing/mounting-balanced-wheel.jpg'), dark),
  // on-site welding
  grade(src('stock/pexels-15888226.jpg'), out('work/mobile-welding/welding-sparks.jpg'), dark),
  grade(src('stock/pexels-2381463.jpg'), out('work/mobile-welding/welder-at-work.jpg'), dark),
  // roadside assistance
  grade(src('stock/pexels-13821194.jpg'), out('work/roadside-assistance/service-van-technician.jpg')),
  grade(src('stock/pexels-8660855.jpg'), out('work/roadside-assistance/mobile-tire-workshop.jpg')),
  grade(src('stock/pexels-9518248.jpg'), out('work/roadside-assistance/roadside-tire-change.jpg')),
];

const done = await Promise.all(jobs);

/** 9:16 portrait crop around a horizontal focal point, for the slider on phones. */
async function portrait(input, file, focusX) {
  const { width: w, height: h } = await sharp(input).metadata();
  const cw = Math.round((h * 9) / 16);
  const left = Math.max(0, Math.min(w - cw, Math.round(w * focusX - cw / 2)));
  await sharp(input).extract({ left, top: 0, width: cw, height: h }).jpeg({ quality: 86, mozjpeg: true }).toFile(file);
  return file;
}
const photo = (p) => `${root}src/assets/photos/${p}.jpg`;
done.push(
  ...(await Promise.all([
    portrait(photo('slides/hero'), out('slides/intro-portrait.jpg'), 0.66),
    portrait(photo('work/tire-change/impact-wrench-wheel-change'), out('slides/change-portrait.jpg'), 0.5),
    portrait(photo('work/roadside-assistance/service-van-technician'), out('slides/roadside-portrait.jpg'), 0.36),
    portrait(photo('work/mobile-welding/welding-sparks'), out('slides/welding-portrait.jpg'), 0.52),
    portrait(photo('work/wheel-balancing/mounting-balanced-wheel'), out('slides/balancing-portrait.jpg'), 0.55),
  ])),
);

for (const file of done) {
  const m = await sharp(file).metadata();
  console.log(`${file.replace(root, '')}  ${m.width}×${m.height}`);
}
