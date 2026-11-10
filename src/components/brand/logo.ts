/**
 * The Guladi badge (red rounded square, white van with speed lines and a
 * wrench), redrawn as vector from the original logo PNG so it stays sharp at
 * any size and the loader can animate the van on its own.
 * Only erasable TypeScript syntax, so Node can import it directly from
 * scripts/build-brand-assets.mjs.
 */
export const RED = '#df0d14';
export const INK = '#1f2023';

export const vanBody =
  'M132 196H356Q372 196 382 207L428 262Q434 270 446 272L466 276Q488 282 492 306L494 340Q494 356 478 356H112Q98 356 100 340L116 212Q119 196 132 196Z';
export const vanWindow = 'M312 212H362Q370 212 375 219L408 262Q412 268 404 268H312Q306 268 306 262V218Q306 212 312 212Z';
export const vanHandle = 'M310 282H334A4 4 0 0 1 334 290H310A4 4 0 0 1 310 282Z';
export const vanLight = 'M457 290L476 292Q482 293 481 299L480 302L461 300Q455 299 457 293Z';
export const wheels = [180, 402];
export const wheelY = 350;
export const speedLines = [
  [24, 216, 106],
  [24, 250, 101],
  [24, 284, 96],
];
export const wrench =
  'M-51.75 -9H51.75A24 24 0 0 1 96.63 -8H80V8H96.63A24 24 0 0 1 51.75 9H-51.75A24 24 0 0 1 -96.63 8H-80V-8H-96.63A24 24 0 0 1 -51.75 -9Z';
export const wrenchTransform = 'translate(255 140) rotate(-18)';

const wheel = (cx: number) =>
  `<circle cx="${cx}" cy="${wheelY}" r="40" fill="${INK}"/><circle cx="${cx}" cy="${wheelY}" r="23" fill="#fff"/><circle cx="${cx}" cy="${wheelY}" r="12" fill="${INK}"/>`;

/** The van + wheels + wrench (no background), in the 512×512 badge space. */
export function vanMarkup(cut: string = RED) {
  return [
    `<path d="${wrench}" transform="${wrenchTransform}" fill="#fff" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>`,
    `<path d="${vanBody}" fill="#fff"/>`,
    `<path d="${vanWindow}" fill="${cut}"/>`,
    `<path d="${vanHandle}" fill="${cut}"/>`,
    `<path d="${vanLight}" fill="${cut}"/>`,
    ...wheels.map((cx) => wheel(cx)),
  ].join('');
}

export const speedMarkup = () =>
  speedLines.map(([x1, y, x2]) => `<path d="M${x1} ${y}H${x2}" stroke="#fff" stroke-width="11" stroke-linecap="round"/>`).join('');

/** Complete badge as a standalone SVG string (favicon, icons, OG image). */
export function badgeSvg(size: number = 512, radius: number = 88) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="${size}" height="${size}"><rect width="512" height="512" rx="${radius}" fill="${RED}"/>${speedMarkup()}${vanMarkup()}</svg>`;
}
