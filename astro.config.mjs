import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://sugarrush.dev',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'nl'],
    routing: { prefixDefaultLocale: false },
  },
  integrations: [
    sitemap({
      // /og/ renders the social card only — noindex scaffolding, not a page.
      filter: (page) => !page.includes('/404') && !page.includes('/og/'),
    }),
  ],
});
