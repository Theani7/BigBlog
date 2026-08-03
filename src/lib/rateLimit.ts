/**
 * In-memory sliding-window rate limiter.
 *
 * Runs per-isolate/per-function: it is not a distributed lock, but it is
 * cheap and stops naive brute-force / spam floods. Apply it to every
 * mutating endpoint.
 */

const WINDOWS = new Map<string, number[]>();
const MAX_KEYS = 10000;

function now(): number {
  return Date.now();
}

export function rateLimit(opts: { ip: string; key: string; limit: number; windowMs: number }): {
  allowed: boolean;
  retryAfter: number;
} {
  const { ip, key, limit, windowMs } = opts;
  const bucketKey = `${ip}:${key}`;
  const windowStart = now() - windowMs;

  const hits = (WINDOWS.get(bucketKey) || []).filter((t) => t > windowStart);
  const retryAfter = hits.length >= limit ? Math.ceil((hits[0]! + windowMs - now()) / 1000) : 0;

  if (hits.length >= limit) {
    WINDOWS.set(bucketKey, hits);
    return { allowed: false, retryAfter };
  }

  hits.push(now());
  WINDOWS.set(bucketKey, hits);

  if (WINDOWS.size > MAX_KEYS) {
    for (const [k, times] of WINDOWS) {
      if (times.every((t) => t <= windowStart)) WINDOWS.delete(k);
      if (WINDOWS.size <= MAX_KEYS / 2) break;
    }
  }

  return { allowed: true, retryAfter };
}

export function getClientIp(request: Request): string {
  const fwd = request.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0]!.trim();
  return request.headers.get('x-real-ip') || request.headers.get('cf-connecting-ip') || 'unknown';
}

export function rateLimitedResponse(retryAfter: number): Response {
  return new Response(JSON.stringify({ success: false, error: 'Rate limit exceeded' }), {
    status: 429,
    headers: {
      'Content-Type': 'application/json',
      'Retry-After': String(Math.max(1, retryAfter)),
    },
  });
}

/**
 * Convenience guard: returns a 429 Response when the limit is hit,
 * otherwise null. Usage: `const limited = checkRateLimit(request, {...}); if (limited) return limited;`
 */
export function checkRateLimit(
  request: Request,
  opts: { key: string; limit: number; windowMs: number }
): Response | null {
  const { allowed, retryAfter } = rateLimit({
    ip: getClientIp(request),
    key: opts.key,
    limit: opts.limit,
    windowMs: opts.windowMs,
  });
  return allowed ? null : rateLimitedResponse(retryAfter);
}
