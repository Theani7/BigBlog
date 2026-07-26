import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';
import { generateSitemap } from '@lib/sitemap';

export const GET: APIRoute = async () => {
  const posts = await getCollection('blog');
  const authors = await getCollection('authors');
  const series = await getCollection('series');
  const categories = await getCollection('categories');

  const xml = generateSitemap({
    posts,
    authors: authors.map((a: CollectionEntry<'authors'>) => ({
      name: a.data.name,
      slug: a.data.slug ?? a.slug,
      bio: a.data.bio,
      avatar: a.data.avatar,
    })),
    series: series.map((s: CollectionEntry<'series'>) => ({
      title: s.data.title,
      slug: s.data.slug ?? s.slug,
      description: s.data.description,
      cover: s.data.cover,
      author: s.data.author,
      category: s.data.category,
      publishedAt: s.data.publishedAt,
    })),
    categories: categories.map((c: CollectionEntry<'categories'>) => ({
      title: c.data.title,
      slug: c.data.slug ?? c.slug,
      description: c.data.description,
    })),
    pages: ['/', '/blog', '/about', '/projects', '/contact', '/archive', '/search'],
    includeImages: true,
  });

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
};
