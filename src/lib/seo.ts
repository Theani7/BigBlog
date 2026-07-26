/**
 * SEO utilities for BigBlog.
 *
 * Provides helper functions to generate meta tags, OpenGraph data,
 * and structured data for pages.
 */

import { siteConfig, seo as defaultSeo } from '@config/site';

export interface SeoProps {
  title?: string;
  description?: string;
  canonical?: string;
  image?: string;
  type?: string;
  robots?: 'index, follow' | 'noindex, nofollow';
}

/**
 * Generate a complete SEO meta tag string for a page.
 *
 * @param props - SEO properties for the page
 * @returns Object with title, description, and meta tags
 *
 * @example
 * const seo = generateSeo({ title: 'My Post', description: 'A great post' });
 */
export function generateSeo(props: SeoProps) {
  const title = props.title ? `${props.title} — ${siteConfig.name}` : defaultSeo.defaultTitle;

  const description = props.description ?? defaultSeo.defaultDescription;
  const image = props.image ?? defaultSeo.defaultImage;
  const type = props.type ?? defaultSeo.defaultType;
  const canonical = props.canonical ?? `${siteConfig.url}${Astro.url.pathname}`;

  return {
    title,
    description,
    canonical,
    image,
    type,
    robots: props.robots ?? 'index, follow',
  };
}

/**
 * Generate OpenGraph meta tags as an object.
 *
 * @param props - SEO properties
 * @returns OpenGraph meta tag object
 */
export function generateOpenGraph(props: SeoProps) {
  const seo = generateSeo(props);
  return {
    'og:title': seo.title,
    'og:description': seo.description,
    'og:type': seo.type,
    'og:url': seo.canonical,
    'og:image': seo.image,
    'og:site_name': siteConfig.name,
    'og:locale': siteConfig.locale,
  };
}

/**
 * Generate Twitter Card meta tags as an object.
 *
 * @param props - SEO properties
 * @returns Twitter Card meta tag object
 */
export function generateTwitterCard(props: SeoProps) {
  const seo = generateSeo(props);
  return {
    'twitter:card': 'summary_large_image',
    'twitter:title': seo.title,
    'twitter:description': seo.description,
    'twitter:image': seo.image,
    'twitter:site': `@${siteConfig.name.toLowerCase()}`,
  };
}

/**
 * Generate robots meta tag content.
 *
 * @param robots - Robots directive
 * @returns Robots meta content string
 */
export function generateRobots(robots: SeoProps['robots'] = 'index, follow'): string {
  return robots;
}
