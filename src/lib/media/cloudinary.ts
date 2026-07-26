/**
 * Cloudinary configuration and URL generation utilities.
 *
 * Provides type-safe Cloudinary URL construction without requiring
 * the full SDK for URL-based transforms. Uses @cloudinary/url-gen
 * for advanced cases and plain URL construction for simple transforms.
 */

export interface CloudinaryConfig {
  cloudName: string;
  folder: string;
}

export interface CloudinaryTransform {
  width?: number;
  height?: number;
  crop?: 'fill' | 'fit' | 'limit' | 'scale' | 'thumb' | 'pad';
  gravity?: 'auto' | 'face' | 'center' | 'north' | 'south' | 'east' | 'west';
  quality?: number | 'auto';
  format?: 'auto' | 'avif' | 'webp' | 'jpeg' | 'png' | 'gif';
  radius?: number | 'max';
  effect?: string;
}

const DEFAULT_CONFIG: CloudinaryConfig = {
  cloudName: '',
  folder: 'bigblog',
};

function getConfig(): CloudinaryConfig {
  const cloudName = import.meta.env.CLOUDINARY_CLOUD_NAME || '';
  return {
    ...DEFAULT_CONFIG,
    cloudName,
  };
}

/**
 * Determine if a source is a Cloudinary URL or public ID.
 */
export function isCloudinaryUrl(src: string): boolean {
  return (
    src.startsWith('http://res.cloudinary.com/') ||
    src.startsWith('https://res.cloudinary.com/') ||
    src.startsWith('https://cloudinary.com/') ||
    (!src.startsWith('/') && !src.startsWith('http') && !src.includes('.'))
  );
}

/**
 * Extract the public ID from a Cloudinary URL.
 */
export function extractPublicId(url: string): string {
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.\w+)?$/);
  return match?.[1] ?? url;
}

/**
 * Build a Cloudinary transformation URL string.
 */
function buildTransformString(transform: CloudinaryTransform): string {
  const parts: string[] = [];

  if (transform.width) parts.push(`w_${transform.width}`);
  if (transform.height) parts.push(`h_${transform.height}`);
  if (transform.crop) parts.push(`c_${transform.crop}`);
  if (transform.gravity) parts.push(`g_${transform.gravity}`);
  if (transform.quality) parts.push(`q_${transform.quality}`);
  if (transform.format) parts.push(`f_${transform.format}`);
  if (transform.radius !== undefined) parts.push(`r_${transform.radius}`);
  if (transform.effect) parts.push(`e_${transform.effect}`);

  return parts.join(',');
}

/**
 * Generate a Cloudinary URL for a given public ID and transformations.
 */
export function getCloudinaryUrl(publicId: string, transform?: CloudinaryTransform): string {
  const { cloudName } = getConfig();

  if (!cloudName) {
    return publicId;
  }

  const cleanId = publicId.replace(/^\//, '');
  const transformStr = transform ? buildTransformString(transform) : '';

  if (transformStr) {
    return `https://res.cloudinary.com/${cloudName}/image/upload/${transformStr}/${cleanId}`;
  }

  return `https://res.cloudinary.com/${cloudName}/image/upload/${cleanId}`;
}

/**
 * Generate a Cloudinary URL with auto format and quality.
 */
export function getOptimizedUrl(
  publicId: string,
  options?: {
    width?: number;
    height?: number;
    crop?: CloudinaryTransform['crop'];
    gravity?: CloudinaryTransform['gravity'];
    quality?: number;
  }
): string {
  const transform: CloudinaryTransform = {
    crop: options?.crop || 'fill',
    gravity: options?.gravity || 'auto',
    quality: options?.quality || 'auto',
    format: 'auto',
  };
  if (options?.width) transform.width = options.width;
  if (options?.height) transform.height = options.height;

  return getCloudinaryUrl(publicId, transform);
}

/**
 * Generate a srcset string for responsive images.
 */
export function getCloudinarySrcSet(
  publicId: string,
  widths: number[],
  options?: {
    crop?: CloudinaryTransform['crop'];
    gravity?: CloudinaryTransform['gravity'];
    quality?: number;
    format?: 'avif' | 'webp' | 'jpeg' | 'png' | 'auto';
  }
): string {
  const { cloudName } = getConfig();

  if (!cloudName) {
    return widths.map((w) => `${publicId} ${w}w`).join(', ');
  }

  const cleanId = publicId.replace(/^\//, '');
  const crop = options?.crop || 'fill';
  const gravity = options?.gravity || 'auto';
  const quality = options?.quality || 'auto';
  const format = options?.format || 'auto';

  return widths
    .map((w) => {
      const transform = `c_${crop},g_${gravity},q_${quality},f_${format},w_${w}`;
      return `https://res.cloudinary.com/${cloudName}/image/upload/${transform}/${cleanId} ${w}w`;
    })
    .join(', ');
}

/**
 * Generate an OG image URL (1200x630).
 */
export function getOgImageUrl(publicId: string): string {
  return getCloudinaryUrl(publicId, {
    width: 1200,
    height: 630,
    crop: 'fill',
    gravity: 'auto',
    quality: 80,
    format: 'auto',
  });
}

/**
 * Generate a thumbnail URL.
 */
export function getThumbnailUrl(publicId: string, size: 'sm' | 'md' | 'lg' = 'md'): string {
  const dimensions = { sm: 200, md: 400, lg: 600 };
  return getCloudinaryUrl(publicId, {
    width: dimensions[size],
    height: dimensions[size],
    crop: 'fill',
    gravity: 'auto',
    quality: 'auto',
    format: 'auto',
  });
}

/**
 * Generate an avatar URL with face detection.
 */
export function getAvatarUrl(publicId: string, size: number = 200): string {
  return getCloudinaryUrl(publicId, {
    width: size,
    height: size,
    crop: 'fill',
    gravity: 'face',
    quality: 'auto',
    format: 'auto',
  });
}
