/**
 * Business facts. Everything here is taken from the original website
 * (modzravivulkanizaciaguladi.lovable.app). Do not change contact details
 * without the owner's confirmation.
 */
export type Localized = { ka: string; en: string };

export const site = {
  name: 'მოძრავი ვულკანიზაცია გულადი',
  nameEn: 'Guladi Mobile Tire Service',
  brand: { ka: 'გულადი', en: 'Guladi' },
  /** Production URL: set SITE_URL, otherwise Vercel's production domain is used (see astro.config.mjs). */
  url: import.meta.env.SITE,
  phone: {
    display: '+995 555 47 46 56',
    tel: '+995555474656',
  },
  whatsapp: {
    number: '995555474656',
    message: {
      ka: 'გამარჯობა! მჭირდება მოძრავი ვულკანიზაციის მომსახურება.',
      en: 'Hello! I need your mobile tire service.',
    },
  },
  /** The original site has only a placeholder for the address — fill in when known; null hides it. */
  address: null as Localized | null,
  social: {
    facebook: 'https://www.facebook.com/share/1CeSsLqu3w/',
    tiktok: 'https://www.tiktok.com/@vulkanizaciagamodzaxebit',
  },
  /** Open around the clock (stated on the original site: 24/7). */
  open247: true,
};

export const telHref = `tel:${site.phone.tel}`;
export const waHref = (lang: 'ka' | 'en') =>
  `https://wa.me/${site.whatsapp.number}?text=${encodeURIComponent(site.whatsapp.message[lang])}`;
