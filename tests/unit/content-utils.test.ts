import { describe, it, expect } from 'vitest';
import {
  readingTime,
  slugify,
  generateUniqueSlug,
  headingId,
  extractHeadings,
  generateToc,
  formatDate,
  formatRfc2822,
  clamp,
  chunkArray,
  getPaginationMeta,
  paginate,
} from '../../src/utils/content';

describe('readingTime', () => {
  it('calculates reading time', () => {
    const result = readingTime('word '.repeat(200));
    expect(result.minutes).toBe(1);
    expect(result.words).toBe(200);
    expect(result.characters).toBeGreaterThan(0);
  });

  it('returns at least 1 minute', () => {
    const result = readingTime('short text');
    expect(result.minutes).toBe(1);
  });
});

describe('slugify', () => {
  it('creates URL-safe slugs', () => {
    expect(slugify('Hello World')).toBe('hello-world');
    expect(slugify('Test: With Special @ Chars')).toBe('test-with-special-chars');
  });
});

describe('generateUniqueSlug', () => {
  it('returns base slug if unique', () => {
    expect(generateUniqueSlug('hello world', new Set())).toBe('hello-world');
  });

  it('appends suffix if duplicate exists', () => {
    expect(generateUniqueSlug('hello world', new Set(['hello-world']))).toBe('hello-world-1');
  });

  it('finds next available suffix', () => {
    expect(generateUniqueSlug('hello world', new Set(['hello-world', 'hello-world-1']))).toBe(
      'hello-world-2'
    );
  });
});

describe('headingId', () => {
  it('generates heading IDs', () => {
    expect(headingId('Hello World')).toBe('hello-world');
    expect(headingId('Section 1: Overview')).toBe('section-1-overview');
  });
});

describe('extractHeadings', () => {
  it('extracts headings from markdown', () => {
    const md = '# Title\n\nSome text\n\n## Subtitle\n\nMore text\n\n### Section';
    const headings = extractHeadings(md);
    expect(headings).toHaveLength(3);
    expect(headings[0]).toEqual({ id: 'title', text: 'Title', level: 1 });
    expect(headings[1]).toEqual({ id: 'subtitle', text: 'Subtitle', level: 2 });
    expect(headings[2]).toEqual({ id: 'section', text: 'Section', level: 3 });
  });

  it('returns empty array for no headings', () => {
    expect(extractHeadings('Just plain text')).toHaveLength(0);
  });
});

describe('generateToc', () => {
  it('builds nested TOC', () => {
    const headings = [
      { id: 'intro', text: 'Intro', level: 1 },
      { id: 'setup', text: 'Setup', level: 2 },
      { id: 'usage', text: 'Usage', level: 2 },
      { id: 'advanced', text: 'Advanced', level: 3 },
      { id: 'conclusion', text: 'Conclusion', level: 1 },
    ];
    const toc = generateToc(headings);
    expect(toc).toHaveLength(2);
    expect((toc[0] as { children: unknown[] }).children).toHaveLength(2);
  });
});

describe('formatDate', () => {
  it('formats dates', () => {
    expect(formatDate('2026-07-15')).toContain('July');
  });

  it('returns empty for invalid', () => {
    expect(formatDate('invalid')).toBe('');
  });
});

describe('formatRfc2822', () => {
  it('formats RFC 2822', () => {
    const result = formatRfc2822('2026-07-15T12:00:00Z');
    expect(result).toContain('2026');
    expect(result).toContain('GMT');
  });
});

describe('clamp', () => {
  it('clamps below min', () => expect(clamp(-5, 0, 10)).toBe(0));
  it('clamps above max', () => expect(clamp(15, 0, 10)).toBe(10));
  it('keeps in range', () => expect(clamp(5, 0, 10)).toBe(5));
});

describe('chunkArray', () => {
  it('chunks array', () => {
    expect(chunkArray([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });

  it('handles empty array', () => {
    expect(chunkArray([], 3)).toEqual([]);
  });
});

describe('getPaginationMeta', () => {
  it('calculates pagination', () => {
    const meta = getPaginationMeta(25, 2, 10);
    expect(meta.currentPage).toBe(2);
    expect(meta.totalPages).toBe(3);
    expect(meta.hasNext).toBe(true);
    expect(meta.hasPrevious).toBe(true);
    expect(meta.nextPage).toBe(3);
    expect(meta.previousPage).toBe(1);
  });

  it('first page has no previous', () => {
    const meta = getPaginationMeta(25, 1, 10);
    expect(meta.hasPrevious).toBe(false);
    expect(meta.previousPage).toBeUndefined();
  });

  it('last page has no next', () => {
    const meta = getPaginationMeta(25, 3, 10);
    expect(meta.hasNext).toBe(false);
    expect(meta.nextPage).toBeUndefined();
  });
});

describe('paginate', () => {
  it('returns correct slice', () => {
    const result = paginate([1, 2, 3, 4, 5], 2, 2);
    expect(result.items).toEqual([3, 4]);
    expect(result.meta.currentPage).toBe(2);
  });
});
