import { describe, it, expect } from 'vitest';
import {
  isCloudinaryUrl,
  extractPublicId,
  getCloudinaryUrl,
  getOptimizedUrl,
  getOgImageUrl,
  getThumbnailUrl,
} from '../../src/lib/media/cloudinary';

describe('isCloudinaryUrl', () => {
  it('identifies Cloudinary URLs', () => {
    expect(isCloudinaryUrl('https://res.cloudinary.com/demo/image/upload/sample.jpg')).toBe(true);
  });

  it('identifies public IDs (no extension, no slashes)', () => {
    expect(isCloudinaryUrl('sample')).toBe(true);
  });

  it('rejects non-Cloudinary URLs', () => {
    expect(isCloudinaryUrl('https://example.com/image.jpg')).toBe(false);
  });

  it('rejects local paths', () => {
    expect(isCloudinaryUrl('/images/photo.jpg')).toBe(false);
  });
});

describe('extractPublicId', () => {
  it('extracts public ID from URL', () => {
    const id = extractPublicId('https://res.cloudinary.com/demo/image/upload/v1234/sample.jpg');
    expect(id).toBe('sample');
  });

  it('extracts public ID without extension', () => {
    const id = extractPublicId('https://res.cloudinary.com/demo/image/upload/sample');
    expect(id).toBe('sample');
  });
});

describe('getCloudinaryUrl', () => {
  it('returns public ID when no cloud name configured', () => {
    const url = getCloudinaryUrl('sample');
    expect(url).toBe('sample');
  });
});

describe('getOptimizedUrl', () => {
  it('returns a URL string', () => {
    const url = getOptimizedUrl('sample', { width: 800 });
    expect(typeof url).toBe('string');
  });
});

describe('getOgImageUrl', () => {
  it('returns a URL string', () => {
    const url = getOgImageUrl('sample');
    expect(typeof url).toBe('string');
  });
});

describe('getThumbnailUrl', () => {
  it('returns a URL string for each size', () => {
    expect(typeof getThumbnailUrl('sample', 'sm')).toBe('string');
    expect(typeof getThumbnailUrl('sample', 'md')).toBe('string');
    expect(typeof getThumbnailUrl('sample', 'lg')).toBe('string');
  });
});
