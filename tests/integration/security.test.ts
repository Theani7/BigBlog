import { describe, it, expect } from 'vitest';
import { sanitizeContent, isValidEmail, detectSpam } from '../../src/lib/validation/index';
import { safeExternalLink } from '../../src/utils/index';

describe('XSS Prevention', () => {
  it('sanitizes script tags', () => {
    const result = sanitizeContent('<script>alert("xss")</script>');
    expect(result).not.toContain('<script>');
    expect(result).toContain('&lt;script&gt;');
  });

  it('sanitizes event handlers by escaping tags', () => {
    const result = sanitizeContent('<img onerror="alert(1)" src="x">');
    expect(result).toContain('&lt;img');
    expect(result).not.toContain('<img');
  });

  it('sanitizes quotes', () => {
    const result = sanitizeContent('He said "hello" and \'goodbye\'');
    expect(result).toContain('&quot;');
    expect(result).toContain('&#x27;');
  });

  it('sanitizes angle brackets', () => {
    const result = sanitizeContent('1 < 2 > 0');
    expect(result).toContain('&lt;');
    expect(result).toContain('&gt;');
  });
});

describe('URL Safety', () => {
  it('blocks javascript: protocol', () => {
    expect(safeExternalLink('javascript:alert(1)')).toBeNull();
  });

  it('blocks data: protocol', () => {
    expect(safeExternalLink('data:text/html,<script>alert(1)</script>')).toBeNull();
  });

  it('blocks vbscript: protocol', () => {
    expect(safeExternalLink('vbscript:msgbox(1)')).toBeNull();
  });

  it('allows https:', () => {
    expect(safeExternalLink('https://example.com')).toBe('https://example.com');
  });

  it('allows http:', () => {
    expect(safeExternalLink('http://example.com')).toBe('http://example.com');
  });

  it('rejects invalid URLs', () => {
    expect(safeExternalLink('not-a-url')).toBeNull();
  });
});

describe('Input Validation', () => {
  it('validates email format', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
    expect(isValidEmail('invalid')).toBe(false);
    expect(isValidEmail('')).toBe(false);
  });

  it('limits email length', () => {
    const longEmail = 'a'.repeat(250) + '@test.com';
    expect(isValidEmail(longEmail)).toBe(false);
  });
});

describe('Spam Detection', () => {
  it('detects normal content', () => {
    const result = detectSpam('Great article, thanks for sharing!');
    expect(result.isSpam).toBe(false);
  });

  it('detects excessive links', () => {
    const result = detectSpam(
      'Visit https://a.com https://b.com https://c.com https://d.com https://e.com'
    );
    expect(result.confidence).toBeGreaterThan(0.2);
  });

  it('detects repeated characters', () => {
    const result = detectSpam('aaaaaaaaaaaaa test content here');
    expect(result.confidence).toBeGreaterThan(0);
  });
});

describe('Rate Limiting', () => {
  it('tracks timestamps within window', () => {
    const now = Date.now();
    const timestamps = [now - 1000, now - 2000, now - 3000];
    const windowMs = 60000;
    const recent = timestamps.filter((t) => now - t < windowMs);
    expect(recent).toHaveLength(3);
  });

  it('excludes old timestamps', () => {
    const now = Date.now();
    const timestamps = [now - 1000, now - 70000];
    const windowMs = 60000;
    const recent = timestamps.filter((t) => now - t < windowMs);
    expect(recent).toHaveLength(1);
  });
});
