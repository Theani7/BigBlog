import type { AstroCookies } from 'astro';
import crypto from 'node:crypto';
import { createDatabase, type Env } from '../db';
import { sessions } from '../db/schema/session';

const SESSION_COOKIE = 'bb_session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 365;

// Server issues UUID v4 session ids; anything else is a forged/legacy value.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidSessionId(value: string): boolean {
  return UUID_RE.test(value);
}

export function getOrCreateSessionId(cookies: AstroCookies): string {
  const existing = cookies.get(SESSION_COOKIE)?.value;
  if (existing && isValidSessionId(existing)) return existing;

  const sessionId = crypto.randomUUID();
  cookies.set(SESSION_COOKIE, sessionId, {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
  });
  return sessionId;
}

export function hashIp(ip?: string): string {
  if (!ip) return '';
  return crypto.createHash('sha256').update(ip).digest('hex').slice(0, 32);
}

/**
 * Record a session in the registry. Idempotent and non-fatal: dedup routes
 * call this before writing a view/like/follow so only server-known sessions
 * can consume unique-index rows.
 */
export async function registerSession(
  env: Env,
  sessionId: string,
  opts: { userId?: string; userAgent?: string; ip?: string } = {}
): Promise<void> {
  if (!isValidSessionId(sessionId)) return;
  try {
    await createDatabase(env);
    const update: Record<string, unknown> = { lastSeenAt: new Date() };
    if (opts.userAgent) update.userAgent = String(opts.userAgent).slice(0, 300);
    if (opts.ip) update.ipHash = hashIp(opts.ip);
    if (opts.userId) update.userId = opts.userId;
    await sessions.updateOne(
      { _id: sessionId },
      { $set: update, $setOnInsert: { createdAt: new Date() } },
      { upsert: true }
    );
  } catch {
    // Session registration must never break the request.
  }
}

/**
 * True when the session id is known to the server. Used to reject forged
 * cookie values before they consume dedup rows.
 */
export async function sessionExists(env: Env, sessionId: string): Promise<boolean> {
  if (!isValidSessionId(sessionId)) return false;
  try {
    await createDatabase(env);
    return (await sessions.exists({ _id: sessionId })) !== null;
  } catch {
    return false;
  }
}
