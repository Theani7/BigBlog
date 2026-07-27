import { describe, it, expect } from 'vitest';
import {
  cn,
  formatDate,
  readingTime,
  slugify,
  debounce,
  throttle,
  safeExternalLink,
} from '../../src/utils/index';

describe('cn', () => {
  it('joins class names', () => {
    expect(cn('px-4', 'py-2')).toBe('px-4 py-2');
  });

  it('filters falsy values', () => {
    expect(cn('a', false, null, undefined, 'b')).toBe('a b');
  });

  it('returns empty string for no inputs', () => {
    expect(cn()).toBe('');
  });
});

describe('formatDate', () => {
  it('formats a date string', () => {
    const result = formatDate('2026-07-15');
    expect(result).toContain('July');
    expect(result).toContain('15');
    expect(result).toContain('2026');
  });

  it('formats a Date object', () => {
    const result = formatDate(new Date('2026-01-01'));
    expect(result).toContain('January');
    expect(result).toContain('2026');
  });

  it('returns empty string for invalid date', () => {
    expect(formatDate('not-a-date')).toBe('');
  });

  it('respects custom options', () => {
    const result = formatDate('2026-07-15', { month: 'short', day: 'numeric', year: 'numeric' });
    expect(result).toContain('Jul');
  });
});

describe('readingTime', () => {
  it('returns 1 min for short text', () => {
    expect(readingTime('hello')).toBe('1 min read');
  });

  it('returns 1 min for ~200 words', () => {
    const text = 'word '.repeat(200);
    expect(readingTime(text)).toBe('1 min read');
  });

  it('returns 2 min for ~400 words', () => {
    const text = 'word '.repeat(400);
    expect(readingTime(text)).toBe('2 min read');
  });
});

describe('slugify', () => {
  it('converts to lowercase', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('removes special characters', () => {
    expect(slugify('Hello, World!')).toBe('hello-world');
  });

  it('handles multiple spaces', () => {
    expect(slugify('Hello   World')).toBe('hello-world');
  });

  it('trims leading/trailing dashes', () => {
    expect(slugify(' hello world ')).toBe('hello-world');
  });
});

describe('debounce', () => {
  it('calls function after delay', async () => {
    let callCount = 0;
    const fn = () => {
      callCount++;
    };
    const debounced = debounce(fn, 50);

    debounced();
    expect(callCount).toBe(0);

    await new Promise((r) => setTimeout(r, 60));
    expect(callCount).toBe(1);
  });

  it('cancels pending call', () => {
    let callCount = 0;
    const fn = () => {
      callCount++;
    };
    const debounced = debounce(fn, 50);

    debounced();
    debounced.cancel();
    expect(callCount).toBe(0);
  });
});

describe('throttle', () => {
  it('limits function calls', async () => {
    let callCount = 0;
    const fn = () => {
      callCount++;
    };
    const throttled = throttle(fn, 50);

    throttled();
    throttled();
    throttled();
    expect(callCount).toBe(1);

    await new Promise((r) => setTimeout(r, 60));
    expect(callCount).toBe(2);
  });
});

describe('safeExternalLink', () => {
  it('returns https URLs', () => {
    expect(safeExternalLink('https://example.com')).toBe('https://example.com');
  });

  it('returns http URLs', () => {
    expect(safeExternalLink('http://example.com')).toBe('http://example.com');
  });

  it('blocks javascript URLs', () => {
    expect(safeExternalLink('javascript:alert(1)')).toBeNull();
  });

  it('blocks data URLs', () => {
    expect(safeExternalLink('data:text/html,<script>alert(1)</script>')).toBeNull();
  });

  it('returns null for invalid URLs', () => {
    expect(safeExternalLink('not-a-url')).toBeNull();
  });
});
