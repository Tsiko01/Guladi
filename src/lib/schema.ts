import { site } from '../config/site';
import { services } from '../config/services';
import { homeHref, serviceHref, useT, type Lang } from '../i18n';

export const abs = (path: string) => new URL(path, site.url).href;
export const ogImage = (lang: Lang) => abs(`/og-image${lang === 'en' ? '-en' : ''}.jpg`);

const businessId = () => abs('/#business');

/** schema.org AutoRepair (a LocalBusiness subtype) for the whole business. */
export function businessSchema(lang: Lang) {
  const t = useT(lang);
  return {
    '@context': 'https://schema.org',
    '@type': 'AutoRepair',
    '@id': businessId(),
    name: site.name,
    alternateName: site.nameEn,
    description: t.seo.home.description,
    url: abs(homeHref(lang)),
    telephone: site.phone.tel,
    image: ogImage(lang),
    logo: abs('/icon-512.png'),
    sameAs: [site.social.facebook, site.social.tiktok],
    ...(site.address ? { address: { '@type': 'PostalAddress', streetAddress: site.address[lang], addressCountry: 'GE' } } : {}),
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '00:00',
      closes: '23:59',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: site.phone.tel,
      contactType: 'customer service',
      availableLanguage: ['ka', 'en'],
      hoursAvailable: { '@type': 'OpeningHoursSpecification', opens: '00:00', closes: '23:59' },
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: t.services.title,
      itemListElement: services.map((s) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: s.title[lang], description: s.short[lang], url: abs(serviceHref(lang, s.slug)) },
      })),
    },
  };
}

export function websiteSchema(lang: Lang) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': abs('/#website'),
    name: lang === 'ka' ? site.name : site.nameEn,
    url: abs(homeHref(lang)),
    inLanguage: lang,
    publisher: { '@id': businessId() },
  };
}

export function serviceSchema(lang: Lang, slug: string, image?: string) {
  const s = services.find((x) => x.slug === slug)!;
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: s.title[lang],
    description: s.long[lang],
    serviceType: s.title.en,
    url: abs(serviceHref(lang, slug)),
    ...(image ? { image } : {}),
    provider: { '@id': businessId() },
    availableChannel: { '@type': 'ServiceChannel', servicePhone: { '@type': 'ContactPoint', telephone: site.phone.tel } },
    hoursAvailable: { '@type': 'OpeningHoursSpecification', opens: '00:00', closes: '23:59' },
  };
}

export function breadcrumbSchema(lang: Lang, slug: string) {
  const t = useT(lang);
  const s = services.find((x) => x.slug === slug)!;
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: t.nav.home, item: abs(homeHref(lang)) },
      { '@type': 'ListItem', position: 2, name: t.nav.services, item: abs(homeHref(lang, '#services')) },
      { '@type': 'ListItem', position: 3, name: s.title[lang], item: abs(serviceHref(lang, slug)) },
    ],
  };
}
