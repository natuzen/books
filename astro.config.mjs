import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  site: 'https://epocayrosa.com',

  integrations: [
    preact(),
    tailwind(),
    sitemap(),
  ],

  output: 'static',
  adapter: cloudflare()
});