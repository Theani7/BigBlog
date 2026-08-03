import { describe, it, expect } from 'vitest';
import {
  isValidEmail,
  sanitizeContent,
  validateComment,
  validateNewsletter,
  validateReport,
  detectSpam,
} from '../src/lib/validation';

describe('isValidEmail', () => {
  it('accepts well-formed emails', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
  });

  it('rejects malformed emails', () => {
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail('no-at-sign')).toBe(false);
    expect(isValidEmail('a@b')).toBe(false);
    expect(isValidEmail('a@b.')).toBe(false);
  });
});

describe('sanitizeContent', () => {
  it('escapes HTML to prevent XSS', () => {
    expect(sanitizeContent('<script>alert(1)</script>')).toBe(
      '&lt;script&gt;alert(1)&lt;/script&gt;'
    );
    expect(sanitizeContent('a & b')).toBe('a &amp; b');
  });
});

describe('validateComment', () => {
  const valid = { articleSlug: 'my-post', content: 'Nice read!', authorName: 'Ana' };

  it('accepts a valid comment', () => {
    expect(validateComment(valid).valid).toBe(true);
  });

  it('rejects missing content and name', () => {
    const result = validateComment({ ...valid, content: '  ', authorName: '' });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Comment content is required');
    expect(result.errors).toContain('Author name is required');
  });

  it('rejects oversized content', () => {
    expect(validateComment({ ...valid, content: 'x'.repeat(5001) }).valid).toBe(false);
  });

  it('rejects a bad email', () => {
    expect(validateComment({ ...valid, authorEmail: 'nope' }).valid).toBe(false);
  });
});

describe('validateNewsletter', () => {
  it('accepts a valid email and rejects bad ones', () => {
    expect(validateNewsletter({ email: 'a@b.com' }).valid).toBe(true);
    expect(validateNewsletter({ email: 'nope' }).valid).toBe(false);
    expect(validateNewsletter({ email: '' }).valid).toBe(false);
  });
});

describe('validateReport', () => {
  it('requires a comment id and a valid reason', () => {
    expect(validateReport({ commentId: 'c1', reason: 'spam' }).valid).toBe(true);
    expect(validateReport({ commentId: '', reason: 'spam' }).valid).toBe(false);
    expect(validateReport({ commentId: 'c1', reason: 'nonsense' }).valid).toBe(false);
  });
});

describe('detectSpam', () => {
  it('flags spammy content', () => {
    const spam = detectSpam(
      'buy now click here https://a.com https://b.com https://c.com https://d.com'
    );
    expect(spam.isSpam).toBe(true);
  });

  it('passes normal content', () => {
    expect(detectSpam('This is a thoughtful comment about the article.').isSpam).toBe(false);
  });
});
