import type { RssItem } from '../types/content';
import { siteConfig } from '@config/site';
import { formatRfc2822 } from '@utils/content';

/**
 * Generate an RSS 2.0 feed XML string.
 *
 * @param items - RSS items
 * @param title - Feed title
 * @param description - Feed description
 * @param link - Feed URL
 * @returns RSS XML string
 */
export function generateRss(
  items: RssItem[],
  title = siteConfig.name,
  description = siteConfig.description,
  link = siteConfig.url
): string {
  const xml = [
    '<?xml version="1.0" encoding="UTF-8" ?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    `<channel>`,
    `<title>${escapeXml(title)}</title>`,
    `<description>${escapeXml(description)}</description>`,
    `<link>${escapeXml(link)}</link>`,
    `<atom:link href="${escapeXml(link)}" rel="self" type="application/rss+xml" />`,
    `<language>${siteConfig.locale}</language>`,
    `<lastBuildDate>${formatRfc2822(new Date())}</lastBuildDate>`,
    ...items
      .map(
        (item) => `    <item>
      <title>${escapeXml(item.title)}</title>
      <description>${escapeXml(item.description)}</description>
      <link>${escapeXml(item.link)}</link>
      <pubDate>${item.pubDate}</pubDate>
      ${item.categories.map((cat) => `<category>${escapeXml(cat)}</category>`).join('\n      ')}
      ${item.cover ? `<enclosure url="${escapeXml(item.cover)}" type="image/${getImageType(item.cover)}" />` : ''}
      <author>${escapeXml(item.author)}</author>
    </item>`
      )
      .join('\n'),
    `</channel>`,
    `</rss>`,
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

function getImageType(url: string): string {
  if (url.endsWith('.png')) return 'png';
  if (url.endsWith('.gif')) return 'gif';
  return 'jpg';
}
