import type { AstroCookies } from 'astro';

const SESSION_COOKIE = 'bb_session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 365;

export function getOrCreateSessionId(cookies: AstroCookies): string {
  const existing = cookies.get(SESSION_COOKIE)?.value;
  if (existing) return existing;

  const sessionId = crypto.randomUUID();
  cookies.set(SESSION_COOKIE, sessionId, {
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
  });
  return sessionId;
}
