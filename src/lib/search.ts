import { getCollection } from 'astro:content';
import { filterDrafts } from '../lib/content';

export interface SearchEntry {
  id: string;
  slug: string;
  title: string;
  description: string;
  excerpt: string;
  content: string;
  tags: string[];
  category: string;
  series?: string;
  author: string;
  publishedAt: string;
  readingTime: number;
  featured: boolean;
}

function stripMarkdown(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]+`/g, '')
    .replace(/#{1,6}\s+/g, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/~~([^~]+)~~/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/^\s*>\s+/gm, '')
    .replace(/---+/g, '')
    .replace(/\|/g, ' ')
    .replace(/\n{2,}/g, '\n')
    .trim();
}

function calculateReadingTime(body: string): number {
  const words = body.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

export async function generateSearchIndex(): Promise<SearchEntry[]> {
  const posts = await getCollection('blog');
  const published = filterDrafts(posts);

  return published.map((post) => {
    const content = stripMarkdown(post.body);
    const plainText = content.toLowerCase();

    return {
      id: post.id,
      slug: post.data.slug ?? post.id,
      title: post.data.title,
      description: post.data.description,
      excerpt: post.data.excerpt || post.data.description,
      content: plainText.slice(0, 2000),
      tags: post.data.tags,
      category: post.data.category,
      series: post.data.series,
      author: post.data.author,
      publishedAt: post.data.publishedAt.toISOString(),
      readingTime: calculateReadingTime(post.body),
      featured: post.data.featured,
    };
  });
}
