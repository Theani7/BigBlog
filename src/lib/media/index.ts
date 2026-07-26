/**
 * Media utilities barrel export.
 *
 * Central access point for all media/image utilities.
 */

export {
  getCloudinaryUrl,
  getOptimizedUrl,
  getCloudinarySrcSet,
  getOgImageUrl,
  getThumbnailUrl,
  getAvatarUrl,
  isCloudinaryUrl,
  extractPublicId,
  type CloudinaryConfig,
  type CloudinaryTransform,
} from './cloudinary';

export {
  RESPONSIVE_CONFIG,
  CARD_WIDTHS,
  HERO_WIDTHS,
  AVATAR_WIDTHS,
  THUMBNAIL_WIDTHS,
  GALLERY_WIDTHS,
  getPresetTransform,
  getPresetUrl,
  getResponsiveSrcSet,
  type TransformPreset,
  type ImageFormat,
  type ResponsiveConfig,
} from './transforms';

export {
  generateSrcSet,
  generateSizes,
  getResponsiveImageProps,
  isEagerLoad,
  getDefaultFetchPriority,
  type ImageContext,
  type ResponsiveImageResult,
  type ResponsiveImageOptions,
} from './responsive';
