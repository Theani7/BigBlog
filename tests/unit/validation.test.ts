import { describe, it, expect } from 'vitest';
import {
  isValidEmail,
  sanitizeContent,
  validateComment,
  validateNewsletter,
  validateReport,
  generateSessionId,
  detectSpam,
  checkRateLimit,
} from '../../src/lib/validation/index';

describe('isValidEmail', () => {
  it('accepts valid emails', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
    expect(isValidEmail('test.user@domain.co')).toBe(true);
  });

  it('rejects invalid emails', () => {
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail('not-an-email')).toBe(false);
    expect(isValidEmail('@domain.com')).toBe(false);
    expect(isValidEmail('user@')).toBe(false);
  });

  it('rejects emails over 254 chars', () => {
    expect(isValidEmail('a'.repeat(250) + '@test.com')).toBe(false);
  });
});

describe('sanitizeContent', () => {
  it('escapes HTML entities', () => {
    expect(sanitizeContent('<script>alert(1)</script>')).toBe(
      '&lt;script&gt;alert(1)&lt;/script&gt;'
    );
  });

  it('escapes quotes', () => {
    expect(sanitizeContent('He said "hello"')).toBe('He said &quot;hello&quot;');
  });

  it('escapes ampersands', () => {
    expect(sanitizeContent('a & b')).toBe('a &amp; b');
  });
});

describe('validateComment', () => {
  it('accepts valid comment', () => {
    const result = validateComment({
      articleSlug: 'test-post',
      content: 'Great article!',
      authorName: 'Alice',
    });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects missing content', () => {
    const result = validateComment({
      articleSlug: 'test-post',
      content: '',
      authorName: 'Alice',
    });
    expect(result.valid).toBe(false);
  });

  it('rejects long content', () => {
    const result = validateComment({
      articleSlug: 'test-post',
      content: 'x'.repeat(5001),
      authorName: 'Alice',
    });
    expect(result.valid).toBe(false);
  });

  it('rejects invalid email', () => {
    const result = validateComment({
      articleSlug: 'test-post',
      content: 'Nice!',
      authorName: 'Alice',
      authorEmail: 'not-email',
    });
    expect(result.valid).toBe(false);
  });
});

describe('validateNewsletter', () => {
  it('accepts valid email', () => {
    const result = validateNewsletter({ email: 'user@example.com' });
    expect(result.valid).toBe(true);
  });

  it('rejects invalid email', () => {
    const result = validateNewsletter({ email: 'not-email' });
    expect(result.valid).toBe(false);
  });
});

describe('validateReport', () => {
  it('accepts valid report', () => {
    const result = validateReport({ commentId: 1, reason: 'spam' });
    expect(result.valid).toBe(true);
  });

  it('rejects invalid commentId', () => {
    const result = validateReport({ commentId: 0, reason: 'spam' });
    expect(result.valid).toBe(false);
  });

  it('rejects invalid reason', () => {
    const result = validateReport({ commentId: 1, reason: 'invalid' as never });
    expect(result.valid).toBe(false);
  });
});

describe('generateSessionId', () => {
  it('generates hex string', () => {
    const id = generateSessionId();
    expect(id).toMatch(/^[0-9a-f]{32}$/);
  });

  it('generates unique IDs', () => {
    const id1 = generateSessionId();
    const id2 = generateSessionId();
    expect(id1).not.toBe(id2);
  });
});

describe('detectSpam', () => {
  it('detects normal content as not spam', () => {
    const result = detectSpam('This is a normal comment about the article.');
    expect(result.isSpam).toBe(false);
    expect(result.confidence).toBeLessThan(0.5);
  });

  it('detects spam with keywords and links', () => {
    const result = detectSpam(
      'BUY NOW CLICK HERE FREE MONEY http://a.com http://b.com http://c.com http://d.com AAAAA'
    );
    expect(result.isSpam).toBe(true);
  });

  it('detects excessive links', () => {
    const result = detectSpam('Visit https://a.com https://b.com https://c.com https://d.com');
    expect(result.confidence).toBeGreaterThan(0.2);
  });
});

describe('checkRateLimit', () => {
  it('allows under limit', () => {
    const timestamps = [Date.now() - 1000];
    const result = checkRateLimit(timestamps, 60000, 10);
    expect(result.allowed).toBe(true);
  });

  it('blocks over limit', () => {
    const now = Date.now();
    const timestamps = Array.from({ length: 10 }, () => now - 1000);
    const result = checkRateLimit(timestamps, 60000, 10);
    expect(result.allowed).toBe(false);
    expect(result.retryAfter).toBeGreaterThan(0);
  });
});
