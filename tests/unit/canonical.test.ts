import { describe, it, expect } from 'vitest';
import {
  canonicalUrl,
  postCanonical,
  authorCanonical,
  categoryCanonical,
} from '../../src/lib/canonical';

describe('canonicalUrl', () => {
  it('generates canonical URL with leading slash', () => {
    const url = canonicalUrl('/blog/my-post');
    expect(url).toContain('/blog/my-post');
  });

  it('adds leading slash if missing', () => {
    const url = canonicalUrl('blog/my-post');
    expect(url).toContain('/blog/my-post');
  });
});

describe('postCanonical', () => {
  it('generates post canonical URL', () => {
    const url = postCanonical('my-post');
    expect(url).toContain('/blog/my-post');
  });

  it('uses custom URL when provided', () => {
    const url = postCanonical('my-post', 'https://custom.com/other');
    expect(url).toBe('https://custom.com/other');
  });
});

describe('authorCanonical', () => {
  it('generates author canonical URL', () => {
    const url = authorCanonical('alice');
    expect(url).toContain('/author/alice');
  });
});

describe('categoryCanonical', () => {
  it('generates category canonical URL', () => {
    const url = categoryCanonical('engineering');
    expect(url).toContain('/category/engineering');
  });
});
