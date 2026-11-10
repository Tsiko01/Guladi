import { ka } from './ka';
import { en } from './en';
import type { Localized } from '../config/site';

export const locales = ['ka', 'en'] as const;
export type Lang = (typeof locales)[number];
export const defaultLang: Lang = 'ka';
export const ogLocale: Record<Lang, string> = { ka: 'ka_GE', en: 'en_US' };

/** Same shape as the Georgian dictionary, with literal strings widened to `string`. */
type Widen<T> = T extends string ? string : T extends readonly (infer U)[] ? Widen<U>[] : { [K in keyof T]: Widen<T[K]> };
export type Dict = Widen<typeof ka>;

const dictionaries: Record<Lang, Dict> = { ka, en };
export const useT = (lang: Lang): Dict => dictionaries[lang];

/** Pick the right language from a { ka, en } object. */
export const loc = <T>(value: { ka: T; en: T }, lang: Lang): T => value[lang];
export type { Localized };

export const otherLang = (lang: Lang): Lang => (lang === 'ka' ? 'en' : 'ka');

/** Root of a language: "/" for Georgian, "/en/" for English. */
export const langRoot = (lang: Lang) => (lang === defaultLang ? '/' : `/${lang}/`);
export const homeHref = (lang: Lang, hash = '') => `${langRoot(lang)}${hash}`;
export const serviceHref = (lang: Lang, slug: string) => `${langRoot(lang)}services/${slug}/`;

/** Home-page sections, in page order. */
export const sections = ['services', 'why', 'how', 'gallery', 'contact'] as const;
export type SectionId = (typeof sections)[number];
