import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from "@astrojs/tailwind";

import svelte from "@astrojs/svelte";

// https://astro.build/config
export default defineConfig({
  site: 'https://laalquimia.github.io',
  base: '',
  integrations: [mdx(), sitemap(), tailwind(), svelte()]
});