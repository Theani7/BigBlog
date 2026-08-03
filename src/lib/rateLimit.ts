/**
 * Sliding-window rate limiter.
 *
 * Default storage is a MongoDB collection shared across serverless
 * instances, so limits are durable and cold-start safe. When the database
 * is unavailable (or no env is provided, e.g. in tests) it falls back to a
 * per-isolate in-memory window so requests still get limited.
 */

import { createDatabase, type Env } from '../db';
import { RateLimitHit } from '../db/schema/rateLimit';

// ---------------------------------------------------------------------------
// Pure window logic (unit-testable)
// ---------------------------------------------------------------------------

export function slidingWindow(opts: {
  hits: number[];
  limit: number;
  windowMs: number;
  nowMs: number;
}): { allowed: boolean; retryAfter: number } {
  const { hits, limit, windowMs, nowMs } = opts;
  const inWindow = hits.filter((t) => t > nowMs - windowMs);
  if (inWindow.length < limit) {
    return { allowed: true, retryAfter: 0 };
  }
  const oldest = inWindow[0]!;
  return { allowed: false, retryAfter: Math.ceil((oldest + windowMs - nowMs) / 1000) };
}

// ---------------------------------------------------------------------------
// In-memory fallback (per isolate, resets on cold start)
// ---------------------------------------------------------------------------

const MEMORY = new Map<string, number[]>();
const MAX_KEYS = 10_000;

function memoryCheck(key: string, limit: number, windowMs: number) {
  const nowMs = Date.now();
  const hits = MEMORY.get(key) || [];
  const result = slidingWindow({ hits, limit, windowMs, nowMs });

  if (!result.allowed) {
    MEMORY.set(key, hits);
    return result;
  }

  hits.push(nowMs);
  MEMORY.set(key, hits);

  if (MEMORY.size > MAX_KEYS) {
    for (const [k, times] of MEMORY) {
      if (times.every((t) => t <= nowMs - windowMs)) MEMORY.delete(k);
      if (MEMORY.size <= MAX_KEYS / 2) break;
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// MongoDB-backed check (durable across instances)
// ---------------------------------------------------------------------------

async function mongoCheck(
  env: Env,
  key: string,
  limit: number,
  windowMs: number
): Promise<{ allowed: boolean; retryAfter: number }> {
  await createDatabase(env);
  const nowMs = Date.now();
  const cutoff = nowMs - windowMs;
  const count = await RateLimitHit.countDocuments({ key, ts: { $gt: cutoff } });

  if (count >= limit) {
    const oldest = await RateLimitHit.findOne({ key, ts: { $gt: cutoff } }).sort({ ts: 1 });
    const retryAfter = oldest
      ? Math.ceil((oldest.ts + windowMs - nowMs) / 1000)
      : Math.ceil(windowMs / 1000);
    return { allowed: false, retryAfter };
  }

  await RateLimitHit.insertOne({ key, ts: nowMs });
  return { allowed: true, retryAfter: 0 };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

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
 * otherwise null. Usage:
 * `const limited = await checkRateLimit(request, {...}); if (limited) return limited;`
 *
 * When `env` is omitted it is derived from `process.env` (the serverless
 * runtime exposes MONGO_URI there); tests that don't want a database simply
 * call without a MONGO_URI and get the in-memory fallback.
 */
export async function checkRateLimit(
  request: Request,
  opts: { key: string; limit: number; windowMs: number },
  env?: Env
): Promise<Response | null> {
  const resolvedEnv: Env | undefined =
    env || (process.env.MONGO_URI ? { MONGO_URI: process.env.MONGO_URI } : undefined);
  const key = `${getClientIp(request)}:${opts.key}`;

  let result: { allowed: boolean; retryAfter: number };
  if (resolvedEnv?.MONGO_URI) {
    try {
      result = await mongoCheck(resolvedEnv, key, opts.limit, opts.windowMs);
    } catch {
      result = memoryCheck(key, opts.limit, opts.windowMs);
    }
  } else {
    result = memoryCheck(key, opts.limit, opts.windowMs);
  }

  return result.allowed ? null : rateLimitedResponse(result.retryAfter);
}
