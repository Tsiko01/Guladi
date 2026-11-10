/**
 * ─────────────────────────────────────────────────────────────
 *  PHOTOS
 * ─────────────────────────────────────────────────────────────
 * Gallery / service photos live in  src/assets/photos/work/<category>/
 * where <category> is a service slug (see services.ts) or "other" for
 * photos that don't clearly belong to one service.
 *
 * To add your own photos: drop them in the matching folder. They appear in
 * the gallery automatically (your photos are listed before stock photos).
 * To make one the main photo of a service, set `cover` in services.ts.
 * Optional alt text / captions go in `captions` below — photos without
 * a caption get "<service name> — photo" as alt text.
 *
 * Current photos: free-licence stock (pexels.com/license, unsplash.com/license),
 * colour-graded by scripts/prepare-photos.mjs. The first hero slide is the
 * brand photo from the original website.
 */
import type { Localized } from './site';

/** Captions for the stock photos. */
const stock: Record<string, Localized> = {
  'tire-repair/mechanic-inspecting-tire': {
    ka: 'ხელოსანი საბურავს დაზიანებაზე ამოწმებს',
    en: 'A technician inspecting a tire for damage',
  },
  'tire-repair/tire-repair-outdoors': {
    ka: 'საბურავის შეკეთება ღია ცის ქვეშ',
    en: 'Repairing a tire outdoors',
  },
  'tire-change/impact-wrench-wheel-change': {
    ka: 'ბორბლის შეცვლა პნევმატური ქანჩის გასაღებით',
    en: 'Changing a wheel with an impact wrench',
  },
  'tire-change/mechanic-changing-tire': {
    ka: 'ხელოსანი ავტომობილს საბურავს უცვლის',
    en: 'A technician changing a car tire',
  },
  'tire-change/impact-wrench-wheel-nuts': {
    ka: 'ბორბლის ჭანჭიკების მოჭერა ელექტრო ქანჩით',
    en: 'Tightening wheel nuts with an impact wrench',
  },
  'tire-change/impact-wrench-kneeling': {
    ka: 'ბორბლის მოხსნა ქანჩის გასაღებით',
    en: 'Removing a wheel with an impact wrench',
  },
  'wheel-service/tire-pressure-check': {
    ka: 'საბურავში ჰაერის წნევის შემოწმება',
    en: 'Checking tire pressure',
  },
  'wheel-service/tire-inflation': {
    ka: 'საბურავის ჰაერით შევსება',
    en: 'Inflating a tire',
  },
  'wheel-service/wheel-inspection': {
    ka: 'ბორბლისა და დისკის დათვალიერება',
    en: 'Inspecting a wheel and rim',
  },
  'wheel-service/wheel-nuts-close-up': {
    ka: 'ბორბლის ჭანჭიკების შემოწმება ახლო ხედით',
    en: 'Close-up of checking the wheel nuts',
  },
  'wheel-service/tires-and-alloy-wheel': {
    ka: 'საბურავები და შენადნობის დისკი სახელოსნოში',
    en: 'Tires and an alloy wheel in the workshop',
  },
  'rim-straightening/alloy-rim-close-up': {
    ka: 'შენადნობის დისკი ახლო ხედით',
    en: 'Close-up of an alloy rim',
  },
  'rim-straightening/alloy-wheel-on-car': {
    ka: 'ავტომობილის ბორბალი შენადნობის დისკით',
    en: 'A car wheel with an alloy rim',
  },
  'wheel-balancing/mounting-balanced-wheel': {
    ka: 'დაბალანსებული ბორბლის დაყენება',
    en: 'Mounting a balanced wheel',
  },
  'mobile-welding/welding-sparks': {
    ka: 'შედუღება — ნაპერწკლები სახელოსნოში',
    en: 'Welding sparks in the workshop',
  },
  'mobile-welding/welder-at-work': {
    ka: 'შემდუღებელი მეტალის ნაწილზე მუშაობს',
    en: 'A welder working on a metal part',
  },
  'roadside-assistance/service-van-technician': {
    ka: 'ხელოსანი სამუშაო ფურგონთან, ხელსაწყოებით',
    en: 'A technician with tools next to the service van',
  },
  'roadside-assistance/mobile-tire-workshop': {
    ka: 'მოძრავი ვულკანიზაციის აღჭურვილი მანქანა',
    en: 'A fully equipped mobile tire workshop',
  },
  'roadside-assistance/roadside-tire-change': {
    ka: 'საბურავის შეცვლა გზის პირას',
    en: 'Changing a tire at the roadside',
  },
};

/** Alt text / captions, keyed by path inside work/ (no extension). Add your own photos' captions here. */
export const captions: Record<string, Localized> = {
  ...stock,
};

/** Stock photos are listed after the owner's own photos in the gallery. */
export const stockPhotos = new Set(Object.keys(stock));

/**
 * Hero slider. `image` is the wide (desktop) photo, `portrait` a 9:16 crop for
 * phones made by scripts/prepare-photos.mjs (paths inside src/assets/photos,
 * no extension). Texts are in i18n → hero.slides.<id>.
 */
export const slides = [
  { id: 'intro', image: 'slides/hero', portrait: 'slides/intro-portrait', position: '62% 50%', service: null },
  { id: 'change', image: 'work/tire-change/impact-wrench-wheel-change', portrait: 'slides/change-portrait', position: '60% 45%', service: 'tire-change' },
  { id: 'roadside', image: 'work/roadside-assistance/service-van-technician', portrait: 'slides/roadside-portrait', position: '58% 50%', service: 'roadside-assistance' },
  { id: 'welding', image: 'work/mobile-welding/welding-sparks', portrait: 'slides/welding-portrait', position: '55% 50%', service: 'mobile-welding' },
  { id: 'balancing', image: 'work/wheel-balancing/mounting-balanced-wheel', portrait: 'slides/balancing-portrait', position: '60% 50%', service: 'wheel-balancing' },
] as const;
