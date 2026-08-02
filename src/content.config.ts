import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    excerpt: z.string().optional(),
    slug: z.string().optional(),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    draft: z.boolean().default(false),
    featured: z.boolean().default(false),
    cover: z.string().optional(),
    coverAlt: z.string().optional(),
    coverWidth: z.number().int().positive().optional(),
    coverHeight: z.number().int().positive().optional(),
    coverCredit: z.string().optional(),
    author: z.string().min(1, 'Author is required'),
    category: z.string().min(1, 'Category is required'),
    tags: z.array(z.string()).min(1, 'At least one tag is required'),
    series: z.string().optional(),
    seriesOrder: z.number().int().positive().optional(),
    canonical: z.url().optional(),
    ogImage: z.string().optional(),
    readingTime: z.string().optional(),
    toc: z.boolean().default(true),
    keywords: z.array(z.string()).optional(),
    language: z.string().default('en'),
    featuredOrder: z.number().int().nonnegative().optional(),
  }),
});

const authors = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/authors' }),
  schema: z.object({
    name: z.string().min(1, 'Name is required'),
    slug: z.string().optional(),
    bio: z.string().optional(),
    avatar: z.string().optional(),
    twitter: z.string().optional(),
    github: z.string().optional(),
    linkedin: z.string().optional(),
    website: z.url().optional(),
  }),
});

const series = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/series' }),
  schema: z.object({
    title: z.string().min(1, 'Title is required'),
    slug: z.string().optional(),
    description: z.string().optional(),
    cover: z.string().optional(),
    author: z.string().min(1, 'Author is required'),
    category: z.string().min(1, 'Category is required'),
    tags: z.array(z.string()).optional(),
    publishedAt: z.coerce.date(),
    order: z.number().int().positive().optional(),
  }),
});

const categories = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/categories' }),
  schema: z.object({
    title: z.string().min(1, 'Title is required'),
    slug: z.string().optional(),
    description: z.string().optional(),
    parent: z.string().optional(),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    slug: z.string().optional(),
    publishedAt: z.coerce.date().optional(),
    draft: z.boolean().default(false),
    cover: z.string().optional(),
    coverAlt: z.string().optional(),
    coverWidth: z.number().int().positive().optional(),
    coverHeight: z.number().int().positive().optional(),
    coverCredit: z.string().optional(),
    canonical: z.url().optional(),
    ogImage: z.string().optional(),
    keywords: z.array(z.string()).optional(),
    language: z.string().default('en'),
  }),
});

export const collections = { blog, authors, series, categories, pages };
