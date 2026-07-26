import type { RssItem } from '../types/content';
import { siteConfig } from '@config/site';

interface RssFeedOptions {
  items: RssItem[];
  title?: string;
  description?: string;
  link: string;
  selfLink: string;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function formatRfc2822(date: Date): string {
  return date.toUTCString();
}

function getImageType(url: string): string {
  if (url.endsWith('.png')) return 'png';
  if (url.endsWith('.gif')) return 'gif';
  if (url.endsWith('.webp')) return 'webp';
  return 'jpg';
}

export function generateRss(options: RssFeedOptions): string {
  const {
    items,
    title = siteConfig.name,
    description = siteConfig.description,
    link,
    selfLink,
  } = options;

  const xml = [
    '<?xml version="1.0" encoding="UTF-8" ?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">',
    '<channel>',
    `<title>${escapeXml(title)}</title>`,
    `<description>${escapeXml(description)}</description>`,
    `<link>${escapeXml(link)}</link>`,
    `<atom:link href="${escapeXml(selfLink)}" rel="self" type="application/rss+xml" />`,
    `<language>${siteConfig.locale}</language>`,
    `<lastBuildDate>${formatRfc2822(new Date())}</lastBuildDate>`,
    ...items.map(
      (item) => `    <item>
      <title>${escapeXml(item.title)}</title>
      <description>${escapeXml(item.description)}</description>
      <link>${escapeXml(item.link)}</link>
      <guid isPermaLink="true">${escapeXml(item.link)}</guid>
      <pubDate>${item.pubDate}</pubDate>
      ${item.categories.map((cat) => `<category>${escapeXml(cat)}</category>`).join('\n      ')}
      ${item.cover ? `<enclosure url="${escapeXml(item.cover)}" type="image/${getImageType(item.cover)}" length="0" />` : ''}
      <author>${escapeXml(item.author)}</author>
    </item>`
    ),
    '</channel>',
    '</rss>',
  ].join('\n');

  return xml;
}
