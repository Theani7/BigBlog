import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';
import { generateRss } from '@lib/rss';
import { siteConfig } from '@config/site';
import { formatRfc2822 } from '@utils/content';

export async function getStaticPaths() {
  const categories = await getCollection('categories');
  return categories.map((cat: CollectionEntry<'categories'>) => ({
    params: { slug: cat.data.slug ?? cat.data.title.toLowerCase().replace(/\s+/g, '-') },
    props: { title: cat.data.title, description: cat.data.description },
  }));
}

export const GET: APIRoute = async ({ props }) => {
  const { title, description } = props as { title: string; description?: string };
  const posts = await getCollection('blog');
  const published = posts
    .filter((p: CollectionEntry<'blog'>) => !p.data.draft && p.data.category === title)
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

  const slug = title.toLowerCase().replace(/\s+/g, '-');

  const xml = generateRss({
    items,
    title: `${siteConfig.name} — ${title}`,
    description: description ?? `Articles in the ${title} category`,
    link: `${siteConfig.url}/category/${slug}`,
    selfLink: `${siteConfig.url}/rss/category/${slug}.xml`,
  });

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
};
