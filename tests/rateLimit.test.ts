import { describe, it, expect, beforeEach } from 'vitest';
import { slidingWindow, checkRateLimit } from '../src/lib/rateLimit';

// The in-memory fallback path is what tests exercise: no MONGO_URI is set,
// so checkRateLimit never touches the database.
beforeEach(() => {
  delete process.env.MONGO_URI;
});

describe('slidingWindow', () => {
  const now = 1_000_000;

  it('allows requests under the limit', () => {
    const result = slidingWindow({
      hits: [now - 5000, now - 4000],
      limit: 3,
      windowMs: 60_000,
      nowMs: now,
    });
    expect(result.allowed).toBe(true);
    expect(result.retryAfter).toBe(0);
  });

  it('blocks when the window is full', () => {
    const result = slidingWindow({
      hits: [now - 5000, now - 4000, now - 3000],
      limit: 3,
      windowMs: 60_000,
      nowMs: now,
    });
    expect(result.allowed).toBe(false);
  });

  it('returns a positive retry-after computed from the oldest hit', () => {
    const result = slidingWindow({
      hits: [now - 40_000, now - 5000, now - 4000],
      limit: 3,
      windowMs: 60_000,
      nowMs: now,
    });
    expect(result.allowed).toBe(false);
    expect(result.retryAfter).toBe(20);
  });

  it('lets the window slide once old hits expire', () => {
    const result = slidingWindow({
      hits: [now - 70_000, now - 65_000, now - 5000],
      limit: 3,
      windowMs: 60_000,
      nowMs: now,
    });
    expect(result.allowed).toBe(true);
  });
});

describe('checkRateLimit (in-memory fallback)', () => {
  const requestFrom = (ip: string) =>
    new Request('https://example.com/api/test', { headers: { 'x-forwarded-for': ip } });

  it('blocks the (limit+1)th request from the same IP', async () => {
    for (let i = 0; i < 3; i++) {
      const allowed = await checkRateLimit(requestFrom('1.2.3.4'), {
        key: 'test:limit',
        limit: 3,
        windowMs: 60_000,
      });
      expect(allowed).toBeNull();
    }

    const blocked = await checkRateLimit(requestFrom('1.2.3.4'), {
      key: 'test:limit',
      limit: 3,
      windowMs: 60_000,
    });
    expect(blocked).not.toBeNull();
    expect(blocked!.status).toBe(429);
    expect(blocked!.headers.get('Retry-After')).toBeTruthy();
    expect(blocked!.headers.get('Content-Type')).toContain('application/json');
  });

  it('treats different IPs as independent buckets', async () => {
    for (let i = 0; i < 3; i++) {
      await checkRateLimit(requestFrom('1.1.1.1'), { key: 'a', limit: 3, windowMs: 60_000 });
    }

    const other = await checkRateLimit(requestFrom('2.2.2.2'), {
      key: 'a',
      limit: 3,
      windowMs: 60_000,
    });
    expect(other).toBeNull();
  });

  it('separates keys on the same IP', async () => {
    for (let i = 0; i < 3; i++) {
      await checkRateLimit(requestFrom('1.1.1.1'), { key: 'x', limit: 3, windowMs: 60_000 });
    }

    const otherKey = await checkRateLimit(requestFrom('1.1.1.1'), {
      key: 'y',
      limit: 3,
      windowMs: 60_000,
    });
    expect(otherKey).toBeNull();
  });

  it('parses the first x-forwarded-for entry', async () => {
    const blocked = await checkRateLimit(
      new Request('https://example.com/api/test', {
        headers: { 'x-forwarded-for': '9.9.9.9, 8.8.8.8' },
      }),
      { key: 'a', limit: 1, windowMs: 60_000 }
    );
    expect(blocked).toBeNull();

    const second = await checkRateLimit(
      new Request('https://example.com/api/test', {
        headers: { 'x-forwarded-for': '9.9.9.9, 8.8.8.8' },
      }),
      { key: 'a', limit: 1, windowMs: 60_000 }
    );
    expect(second).not.toBeNull();
  });
});
