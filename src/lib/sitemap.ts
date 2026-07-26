import type { Post } from '../types/content';
import { siteConfig } from '@config/site';

/**
 * Generate a sitemap XML string.
 *
 * @param posts - All published posts
 * @param pages - Static page paths
 * @returns Sitemap XML string
 */
export function generateSitemap(posts: Post[], pages: string[] = []): string {
  const baseUrl = siteConfig.url;
  const postUrls = posts
    .filter((post) => !post.data.draft)
    .map((post) => `${baseUrl}/blog/${post.slug}`);

  const staticUrls = pages.map((path) => `${baseUrl}${path}`);
  const allUrls = [...staticUrls, ...postUrls];

  const xml = [
    '<?xml version="1.0" encoding="UTF-8" ?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...allUrls
      .map(
        (url) => `  <url>
    <loc>${escapeXml(url)}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${url === `${baseUrl}/` ? '1.0' : '0.8'}</priority>
  </url>`
      )
      .join('\n'),
    '</urlset>',
  ].join('\n');

  return xml;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
