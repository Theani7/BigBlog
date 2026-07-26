/**
 * Responsive image utilities for generating srcset, sizes, and image props.
 *
 * Provides a high-level API that components use to get everything they need
 * for responsive, optimized images with a single function call.
 */

import { getCloudinaryUrl, getCloudinarySrcSet, isCloudinaryUrl } from './cloudinary';
import { RESPONSIVE_CONFIG, CARD_WIDTHS, HERO_WIDTHS, AVATAR_WIDTHS } from './transforms';

export type ImageContext =
  'hero' | 'card' | 'featured' | 'thumbnail' | 'avatar' | 'article' | 'gallery' | 'banner' | 'og';

export interface ResponsiveImageResult {
  src: string;
  srcSet: string;
  sizes: string;
  width: number;
  height: number;
}

export interface ResponsiveImageOptions {
  alt: string;
  loading?: 'lazy' | 'eager';
  decoding?: 'async' | 'sync';
  fetchpriority?: 'high' | 'low' | 'auto';
  class?: string;
  style?: string;
  width?: number;
  height?: number;
}

const SIZES_MAP: Record<ImageContext, string> = {
  hero: '100vw',
  card: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px',
  featured: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 600px',
  thumbnail: '(max-width: 640px) 50vw, 200px',
  avatar: '(max-width: 640px) 48px, 64px',
  article: '(max-width: 768px) 100vw, 68ch',
  gallery: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px',
  banner: '100vw',
  og: '1200px',
};

const WIDTH_MAP: Record<ImageContext, number[]> = {
  hero: HERO_WIDTHS,
  card: CARD_WIDTHS,
  featured: CARD_WIDTHS,
  thumbnail: [160, 320, 480],
  avatar: AVATAR_WIDTHS,
  article: [640, 768, 1024, 1200],
  gallery: [400, 600, 800, 1200],
  banner: HERO_WIDTHS,
  og: [1200],
};

const CROP_MAP: Record<string, string> = {
  avatar: 'fill',
  hero: 'fill',
  card: 'fill',
  featured: 'fill',
  thumbnail: 'fill',
  banner: 'fill',
  og: 'fill',
  article: 'limit',
  gallery: 'limit',
};

const GRAVITY_MAP: Record<string, string> = {
  avatar: 'face',
};

const DIMENSION_MAP: Record<ImageContext, { width: number; height: number }> = {
  hero: { width: 1920, height: 800 },
  card: { width: 800, height: 450 },
  featured: { width: 800, height: 450 },
  thumbnail: { width: 400, height: 300 },
  avatar: { width: 200, height: 200 },
  article: { width: 1200, height: 800 },
  gallery: { width: 1200, height: 800 },
  banner: { width: 1920, height: 400 },
  og: { width: 1200, height: 630 },
};

/**
 * Generate srcset attribute value for a Cloudinary image.
 */
export function generateSrcSet(
  publicId: string,
  context: ImageContext = 'article',
  format: 'avif' | 'webp' | 'jpeg' | 'auto' = 'auto'
): string {
  if (!isCloudinaryUrl(publicId) && publicId.startsWith('/')) {
    return '';
  }

  const widths = WIDTH_MAP[context] || RESPONSIVE_CONFIG.widths;
  const crop = CROP_MAP[context] as 'fill' | 'fit' | 'limit';
  const gravity = GRAVITY_MAP[context] as 'auto' | 'face';

  return getCloudinarySrcSet(publicId, widths, {
    crop,
    gravity,
    quality: RESPONSIVE_CONFIG.quality[format === 'auto' ? 'jpeg' : format],
    format,
  });
}

/**
 * Generate sizes attribute value based on usage context.
 */
export function generateSizes(context: ImageContext): string {
  return SIZES_MAP[context] || SIZES_MAP.article;
}

/**
 * Get complete responsive image props for use in components.
 */
export function getResponsiveImageProps(
  publicId: string,
  context: ImageContext = 'article',
  options?: ResponsiveImageOptions
): ResponsiveImageResult {
  const dimensions = DIMENSION_MAP[context];
  const src =
    isCloudinaryUrl(publicId) || !publicId.startsWith('/')
      ? getCloudinaryUrl(publicId, {
          width: dimensions.width,
          height: dimensions.height,
          crop: CROP_MAP[context] as 'fill' | 'limit',
          gravity: GRAVITY_MAP[context] as 'auto' | 'face',
          quality: 'auto',
          format: 'auto',
        })
      : publicId;

  return {
    src,
    srcSet: generateSrcSet(publicId, context),
    sizes: generateSizes(context),
    width: options?.width || dimensions.width,
    height: options?.height || dimensions.height,
  };
}

/**
 * Check if an image should be loaded eagerly (above the fold).
 */
export function isEagerLoad(context: ImageContext): boolean {
  return context === 'hero' || context === 'og' || context === 'banner';
}

/**
 * Get the default fetchpriority for a context.
 */
export function getDefaultFetchPriority(context: ImageContext): 'high' | 'low' | 'auto' {
  if (context === 'hero' || context === 'banner') return 'high';
  if (context === 'card' || context === 'featured') return 'low';
  return 'auto';
}
