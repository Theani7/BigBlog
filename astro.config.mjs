import { defineConfig } from 'astro/config';
import tailwind from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import vercel from '@astrojs/vercel';

export default defineConfig({
  output: 'server',
  adapter: vercel(),
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
