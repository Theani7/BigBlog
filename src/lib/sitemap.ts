import type { Post, Author, Series, Category } from '../types/content';
import { siteConfig } from '@config/site';

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
  images?: Array<{ loc: string; title?: string; caption?: string }>;
}

interface SitemapOptions {
  posts: Post[];
  authors?: Author[];
  series?: Series[];
  categories?: Category[];
  pages?: string[];
  includeImages?: boolean;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0] ?? '';
}

export function generateSitemap(options: SitemapOptions): string {
  const {
    posts,
    authors = [],
    series = [],
    categories = [],
    pages = [],
    includeImages = true,
  } = options;

  const baseUrl = siteConfig.url;
  const urls: SitemapUrl[] = [];

  for (const page of pages) {
    const isHomepage = page === '/';
    urls.push({
      loc: `${baseUrl}${page}`,
      lastmod: formatDate(new Date()),
      changefreq: isHomepage ? 'daily' : 'weekly',
      priority: isHomepage ? 1.0 : page === '/blog' ? 0.9 : 0.7,
    });
  }

  for (const post of posts) {
    if (post.data.draft) continue;

    const slug = post.data.slug ?? post.slug;
    const postUrl = `${baseUrl}/blog/${slug}`;
    const lastmod = post.data.updatedAt
      ? formatDate(post.data.updatedAt)
      : formatDate(post.data.publishedAt);

    const url: SitemapUrl = {
      loc: postUrl,
      lastmod,
      changefreq: 'weekly',
      priority: post.data.featured ? 0.9 : 0.8,
    };

    if (includeImages && post.data.cover) {
      url.images = [
        {
          loc: post.data.cover,
          title: post.data.title,
          caption: post.data.coverAlt ?? post.data.title,
        },
      ];
    }

    urls.push(url);
  }

  for (const author of authors) {
    const slug = author.slug ?? author.name.toLowerCase().replace(/\s+/g, '-');
    urls.push({
      loc: `${baseUrl}/author/${slug}`,
      changefreq: 'monthly',
      priority: 0.5,
    });
  }

  for (const cat of categories) {
    const slug = cat.slug ?? cat.title.toLowerCase().replace(/\s+/g, '-');
    urls.push({
      loc: `${baseUrl}/category/${slug}`,
      changefreq: 'weekly',
      priority: 0.7,
    });
  }

  for (const s of series) {
    const slug = s.slug ?? s.title.toLowerCase().replace(/\s+/g, '-');
    urls.push({
      loc: `${baseUrl}/series/${slug}`,
      lastmod: formatDate(s.publishedAt),
      changefreq: 'monthly',
      priority: 0.6,
    });
  }

  const allTags = [...new Set(posts.filter((p) => !p.data.draft).flatMap((p) => p.data.tags))];
  for (const tag of allTags) {
    urls.push({
      loc: `${baseUrl}/tag/${encodeURIComponent(tag.toLowerCase())}`,
      changefreq: 'weekly',
      priority: 0.4,
    });
  }

  const xml = [
    '<?xml version="1.0" encoding="UTF-8" ?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
    ...urls.map((url) => {
      const lines = [
        '  <url>',
        `    <loc>${escapeXml(url.loc)}</loc>`,
        url.lastmod ? `    <lastmod>${url.lastmod}</lastmod>` : '',
        `    <changefreq>${url.changefreq}</changefreq>`,
        `    <priority>${url.priority}</priority>`,
      ];

      if (url.images) {
        for (const img of url.images) {
          lines.push('    <image:image>');
          lines.push(`      <image:loc>${escapeXml(img.loc)}</image:loc>`);
          if (img.title) lines.push(`      <image:title>${escapeXml(img.title)}</image:title>`);
          if (img.caption)
            lines.push(`      <image:caption>${escapeXml(img.caption)}</image:caption>`);
          lines.push('    </image:image>');
        }
      }

      lines.push('  </url>');
      return lines.filter(Boolean).join('\n');
    }),
    '</urlset>',
  ].join('\n');

  return xml;
}
