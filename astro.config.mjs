import { defineConfig } from 'astro/config';
import tailwind from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';

export default defineConfig({
  output: 'static',
  adapter: vercel(),
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