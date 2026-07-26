import { defineConfig } from 'astro/config';
import tailwind from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  output: 'server',
  adapter: cloudflare(),
  integrations: [mdx(), tailwind()],
  vite: {
    plugins: [tailwind()],
  },
  site: 'https://bigblog.dev',
  build: {
    format: 'directory',
  },
  routing: {
    caseSensitive: false,
  },
});
