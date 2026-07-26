import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';
import { generateRss } from '@lib/rss';
import { siteConfig } from '@config/site';
import { formatRfc2822 } from '@utils/content';

export const GET: APIRoute = async () => {
  const posts = await getCollection('blog');
  const published = posts
    .filter((p: CollectionEntry<'blog'>) => !p.data.draft)
    .sort(
      (a: CollectionEntry<'blog'>, b: CollectionEntry<'blog'>) =>
        b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf()
    );

  const items = published.map((post: CollectionEntry<'blog'>) => ({
    title: post.data.title,
    description: post.data.description,
    link: `${siteConfig.url}/blog/${post.data.slug ?? post.slug}`,
    pubDate: formatRfc2822(post.data.publishedAt),
    categories: [post.data.category, ...post.data.tags],
    cover: post.data.cover,
    author: post.data.author,
  }));

  const xml = generateRss({
    items,
    title: siteConfig.name,
    description: siteConfig.description,
    link: siteConfig.url,
    selfLink: `${siteConfig.url}/rss.xml`,
  });

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
};
