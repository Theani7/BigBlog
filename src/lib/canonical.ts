import { siteConfig } from '@config/site';

export function canonicalUrl(path: string): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${siteConfig.url}${clean}`;
}

export function postCanonical(slug: string, custom?: string): string {
  return custom ?? canonicalUrl(`/blog/${slug}`);
}

export function authorCanonical(slug: string): string {
  return canonicalUrl(`/author/${slug}`);
}

export function categoryCanonical(slug: string): string {
  return canonicalUrl(`/category/${slug}`);
}

export function seriesCanonical(slug: string): string {
  return canonicalUrl(`/series/${slug}`);
}

export function tagCanonical(slug: string): string {
  return canonicalUrl(`/tag/${slug}`);
}
