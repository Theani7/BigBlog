import type { APIRoute } from 'astro';
import { siteConfig } from '../config/site';

export const GET: APIRoute = () => {
  const baseUrl = siteConfig.url;

  const content = [
    '# BigBlog — robots.txt',
    '',
    'User-agent: *',
    'Allow: /',
    '',
    '# Disallow API routes',
    'Disallow: /api/',
    '',
    '# Disallow utility pages',
    'Disallow: /404',
    'Disallow: /loading',
    '',
    '# Sitemap',
    `Sitemap: ${baseUrl}/sitemap.xml`,
    '',
  ].join('\n');

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
};
