/**
 * Dynamic OG image endpoint.
 *
 * Generates Open Graph images for articles, authors, series, and categories.
 * Uses Cloudinary URL transformations for zero-build-time image generation.
 * Supports text overlays for title, author, category, and reading time.
 */
import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { siteConfig } from '@config/site';

function escapeCloudinaryText(text: string): string {
  return text
    .replace(/%/g, '%25')
    .replace(/#/g, '%23')
    .replace(/\//g, '%2F')
    .replace(/\?/g, '%3F')
    .replace(/&/g, '%26')
    .replace(/=/g, '%3D')
    .replace(/\+/g, '%2B')
    .replace(/ /g, '%20');
}

function getOverlayLayers(options: {
  title?: string;
  subtitle?: string | null;
  author?: string | null;
  readingTime?: string | null;
  theme?: string;
}): string[] {
  const { title, subtitle, author, readingTime, theme = 'dark' } = options;
  const textColor = theme === 'light' ? 'rgb:1a1a2e' : 'rgb:ffffff';
  const accentColor = theme === 'light' ? 'rgb:6366f1' : 'rgb:818cf8';
  const subtextColor = theme === 'light' ? 'rgb:64748b' : 'rgb:94a3b8';
  const layers: string[] = [];

  if (subtitle) {
    layers.push(
      `l_text:Geist_28:${escapeCloudinaryText(subtitle.toUpperCase())},co_${accentColor},g_south_west,x_80,y_260,w_1040`
    );
  }

  if (title) {
    const truncated = title.length > 65 ? title.slice(0, 62) + '...' : title;
    layers.push(
      `l_text:Geist_48_bold:${escapeCloudinaryText(truncated)},co_${textColor},g_south_west,x_80,y_140,w_1040`
    );
  }

  const metaParts: string[] = [];
  if (author) metaParts.push(author);
  if (readingTime) metaParts.push(readingTime);
  if (metaParts.length > 0) {
    layers.push(
      `l_text:Geist_22:${escapeCloudinaryText(metaParts.join('  ·  '))},co_${subtextColor},g_south_west,x_80,y_90,w_1040`
    );
  }

  layers.push(
    `l_text:Geist_24_bold:${escapeCloudinaryText(siteConfig.name)},co_${accentColor},g_south_west,x_80,y_50`
  );

  return layers;
}

export const GET: APIRoute = async ({ params, redirect, url }) => {
  const slug = params.slug;

  if (!slug) {
    return redirect('/og/default');
  }

  const parts = slug.split('/');
  const type = parts[0];
  const id = parts.slice(1).join('/');

  const cloudName = import.meta.env.CLOUDINARY_CLOUD_NAME;

  if (!cloudName) {
    return new Response('Cloudinary not configured', { status: 500 });
  }

  const theme = url.searchParams.get('theme') ?? 'dark';
  const bgBase = theme === 'light' ? 'rgb:f8fafc' : 'rgb:0f172a';
  const showOverlay = url.searchParams.get('overlay') !== 'false';

  let ogTitle = siteConfig.name;
  let ogSubtitle = '';
  let imageId = '';
  let authorName = '';
  let readingTime = '';

  switch (type) {
    case 'blog': {
      const posts = await getCollection('blog');
      const post = posts.find(
        (p: { data: { slug?: string }; slug: string }) => (p.data.slug ?? p.slug) === id
      );
      if (post) {
        ogTitle = post.data.title;
        ogSubtitle = post.data.category;
        imageId = post.data.cover || '';
        authorName = post.data.author;
        readingTime = post.data.readingTime ?? '';
      }
      break;
    }
    case 'author': {
      const authors = await getCollection('authors');
      const author = authors.find(
        (a: { data: { slug?: string }; slug: string }) => (a.data.slug ?? a.slug) === id
      );
      if (author) {
        ogTitle = author.data.name;
        ogSubtitle = 'Author';
        imageId = author.data.avatar || '';
      }
      break;
    }
    case 'series': {
      const series = await getCollection('series');
      const s = series.find(
        (sr: { data: { slug?: string }; slug: string }) => (sr.data.slug ?? sr.slug) === id
      );
      if (s) {
        ogTitle = s.data.title;
        ogSubtitle = 'Series';
        imageId = s.data.cover || '';
      }
      break;
    }
    case 'category': {
      ogTitle = id.charAt(0).toUpperCase() + id.slice(1);
      ogSubtitle = 'Category';
      break;
    }
    default: {
      ogTitle = siteConfig.name;
      ogSubtitle = siteConfig.description;
    }
  }

  if (!showOverlay || (!ogSubtitle && !authorName && !readingTime && type === 'category')) {
    if (imageId) {
      const ogUrl = `https://res.cloudinary.com/${cloudName}/image/upload/w_1200,h_630,c_fill,f_auto,q_80/${imageId}`;
      return new Response(null, {
        status: 302,
        headers: {
          Location: ogUrl,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }
  }

  const overlayLayers = getOverlayLayers({
    title: ogTitle,
    subtitle: ogSubtitle || null,
    author: authorName || null,
    readingTime: readingTime || null,
    theme,
  });

  const transforms = [
    'w_1200',
    'h_630',
    'c_fill',
    'f_auto',
    'q_80',
    'g_south_west',
    `l_fill,b_${bgBase},w_1200,h_630`,
    ...overlayLayers,
  ];

  const publicId = imageId || 'bigblog/og-default';
  const ogUrl = `https://res.cloudinary.com/${cloudName}/image/upload/${transforms.join('/')}/${publicId}`;

  return new Response(null, {
    status: 302,
    headers: {
      Location: ogUrl,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getCollection('blog');
  const authors = await getCollection('authors');
  const series = await getCollection('series');

  const paths: Array<{ params: { slug: string } }> = [];

  for (const post of posts) {
    const slug = post.data.slug ?? post.slug;
    paths.push({ params: { slug: `blog/${slug}` } });
  }

  for (const author of authors) {
    const slug = author.data.slug ?? author.slug;
    paths.push({ params: { slug: `author/${slug}` } });
  }

  for (const s of series) {
    const slug = s.data.slug ?? s.slug;
    paths.push({ params: { slug: `series/${slug}` } });
  }

  return paths;
};
