// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Production URL: SITE_URL if set, otherwise Vercel's production domain
// (VERCEL_PROJECT_PRODUCTION_URL is provided automatically on Vercel builds).
const SITE =
  process.env.SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:4321');

export default defineConfig({
  site: SITE,
  trailingSlash: 'always',
  build: { format: 'directory', inlineStylesheets: 'always' },
  image: { responsiveStyles: false },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/404'),
      i18n: { defaultLocale: 'ka', locales: { ka: 'ka', en: 'en' } },
    }),
  ],
});
