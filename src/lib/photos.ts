import type { ImageMetadata } from 'astro';
import { captions, stockPhotos } from '../config/photos';
import { services } from '../config/services';
import type { Lang } from '../i18n';

const files = import.meta.glob<{ default: ImageMetadata }>('../assets/photos/**/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP}', {
  eager: true,
});

/** "slides/hero" → image, "work/tire-repair/x" → image */
const byName = new Map<string, ImageMetadata>();
for (const [path, mod] of Object.entries(files)) {
  const rel = path.replace(/^.*\/assets\/photos\//, '').replace(/\.[^.]+$/, '');
  byName.set(rel, mod.default);
}

export const getPhoto = (name: string) => byName.get(name);

/** Responsive widths capped at the source width. */
export function widthsFor(img: ImageMetadata, max = 1920): number[] {
  const steps = [400, 640, 828, 1080, 1366, 1600, 1920];
  const cap = Math.min(img.width, max);
  const ws = steps.filter((w) => w < cap - 40);
  ws.push(cap);
  return ws;
}

export type Category = (typeof services)[number]['slug'] | 'other';
export const categories: Category[] = [...services.map((s) => s.slug), 'other'];

export interface GalleryItem {
  /** path inside work/, e.g. "tire-repair/welding-sparks" */
  id: string;
  category: Category;
  image: ImageMetadata;
  stock: boolean;
  alt: { ka: string; en: string };
}

const fallbackAlt = (category: Category, lang: Lang, n: number) => {
  const service = services.find((s) => s.slug === category);
  if (lang === 'ka') return `${service ? service.title.ka : 'სამუშაო'} — ფოტო ${n}`;
  return `${service ? service.title.en : 'Our work'} — photo ${n}`;
};

/**
 * All gallery photos: the owner's own photos first, then stock photos,
 * each group in service order. Unknown folders count as "other".
 */
export function getGallery(): GalleryItem[] {
  const counters = new Map<string, number>();
  const items: GalleryItem[] = [];
  for (const [name, image] of byName) {
    if (!name.startsWith('work/')) continue;
    const id = name.slice('work/'.length);
    const folder = id.includes('/') ? id.split('/')[0] : 'other';
    const category = (categories as string[]).includes(folder) ? (folder as Category) : 'other';
    const n = (counters.get(category) ?? 0) + 1;
    counters.set(category, n);
    items.push({
      id,
      category,
      image,
      stock: stockPhotos.has(id),
      alt: captions[id] ?? { ka: fallbackAlt(category, 'ka', n), en: fallbackAlt(category, 'en', n) },
    });
  }
  const order = (c: Category) => categories.indexOf(c);
  return items.sort((a, b) => Number(a.stock) - Number(b.stock) || order(a.category) - order(b.category) || a.id.localeCompare(b.id));
}

/** Cover photo for a service: the configured one, else the first photo in its folder. */
export function serviceCover(slug: string) {
  const service = services.find((s) => s.slug === slug);
  const gallery = getGallery();
  const configured = service && gallery.find((g) => g.id === service.cover);
  if (configured && !configured.stock) return configured;
  // otherwise the owner's own photo wins over a stock photo
  const own = gallery.find((g) => g.category === slug && !g.stock);
  return own ?? configured ?? gallery.find((g) => g.category === slug);
}
