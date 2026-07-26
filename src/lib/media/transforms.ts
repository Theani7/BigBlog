/**
 * Centralized transformation presets for Cloudinary images.
 *
 * Every transformation in the project is defined here — no duplication.
 * Components reference these presets by name instead of inline strings.
 */

import { getCloudinaryUrl, getCloudinarySrcSet, type CloudinaryTransform } from './cloudinary';

export type TransformPreset =
  | 'thumbnail-sm'
  | 'thumbnail'
  | 'thumbnail-lg'
  | 'card'
  | 'card-lg'
  | 'hero'
  | 'avatar'
  | 'avatar-sm'
  | 'avatar-lg'
  | 'banner'
  | 'og'
  | 'gallery'
  | 'gallery-sm';

export type ImageFormat = 'avif' | 'webp' | 'jpeg' | 'png';

export interface ResponsiveConfig {
  widths: number[];
  formats: ImageFormat[];
  quality: Record<ImageFormat, number>;
}

export const RESPONSIVE_CONFIG: ResponsiveConfig = {
  widths: [320, 480, 768, 1024, 1440, 1920],
  formats: ['avif', 'webp', 'jpeg'],
  quality: {
    avif: 60,
    webp: 75,
    jpeg: 80,
    png: 85,
  },
};

export const CARD_WIDTHS = [320, 480, 640, 800];
export const HERO_WIDTHS = [640, 1024, 1440, 1920];
export const AVATAR_WIDTHS = [32, 48, 64, 96, 128];
export const THUMBNAIL_WIDTHS = [160, 320, 480];
export const GALLERY_WIDTHS = [400, 600, 800, 1200];

const PRESET_MAP: Record<TransformPreset, CloudinaryTransform> = {
  'thumbnail-sm': { width: 200, height: 150, crop: 'fill', gravity: 'auto' },
  thumbnail: { width: 400, height: 300, crop: 'fill', gravity: 'auto' },
  'thumbnail-lg': { width: 600, height: 450, crop: 'fill', gravity: 'auto' },
  card: { width: 800, height: 450, crop: 'fill', gravity: 'auto' },
  'card-lg': { width: 1200, height: 675, crop: 'fill', gravity: 'auto' },
  hero: { width: 1920, height: 800, crop: 'fill', gravity: 'auto' },
  avatar: { width: 200, height: 200, crop: 'fill', gravity: 'face' },
  'avatar-sm': { width: 64, height: 64, crop: 'fill', gravity: 'face' },
  'avatar-lg': { width: 128, height: 128, crop: 'fill', gravity: 'face' },
  banner: { width: 1920, height: 400, crop: 'fill', gravity: 'auto' },
  og: { width: 1200, height: 630, crop: 'fill', gravity: 'auto' },
  gallery: { width: 1200, height: 800, crop: 'limit' },
  'gallery-sm': { width: 600, height: 400, crop: 'limit' },
};

/**
 * Get the Cloudinary transform for a named preset.
 */
export function getPresetTransform(preset: TransformPreset): CloudinaryTransform {
  return PRESET_MAP[preset];
}

/**
 * Get a Cloudinary URL for a named preset with optional overrides.
 */
export function getPresetUrl(
  publicId: string,
  preset: TransformPreset,
  overrides?: Partial<CloudinaryTransform>
): string {
  const baseTransform = PRESET_MAP[preset];
  return getCloudinaryUrl(publicId, { ...baseTransform, ...overrides });
}

/**
 * Get responsive srcset for a specific usage context.
 */
export function getResponsiveSrcSet(
  publicId: string,
  context: 'card' | 'hero' | 'avatar' | 'thumbnail' | 'gallery' | 'banner' | 'og',
  format: ImageFormat = 'jpeg'
): string {
  const widthMap: Record<string, number[]> = {
    card: CARD_WIDTHS,
    hero: HERO_WIDTHS,
    avatar: AVATAR_WIDTHS,
    thumbnail: THUMBNAIL_WIDTHS,
    gallery: GALLERY_WIDTHS,
    banner: HERO_WIDTHS,
    og: [1200],
  };

  const cropMap: Record<string, CloudinaryTransform['crop']> = {
    avatar: 'fill',
    thumbnail: 'fill',
    card: 'fill',
    hero: 'fill',
    banner: 'fill',
    gallery: 'limit',
    og: 'fill',
  };

  const gravityMap: Record<string, CloudinaryTransform['gravity']> = {
    avatar: 'face',
  };

  return getCloudinarySrcSet(publicId, widthMap[context] || RESPONSIVE_CONFIG.widths, {
    crop: cropMap[context],
    gravity: gravityMap[context],
    quality: RESPONSIVE_CONFIG.quality[format],
    format,
  });
}
