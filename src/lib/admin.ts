import type { APIContext } from 'astro';
import { createDatabase, type Env } from '../db';
import { User } from '../db/schema';
import { verifyAuthToken } from './auth';

/**
 * Resolve the current user from the auth cookie, or null when not authenticated.
 */
export async function getAuthUser(context: APIContext) {
  const env = (context.locals as { env: Env }).env;
  if (!env) return null;

  const token = context.cookies.get('auth_token')?.value;
  if (!token) return null;

  const payload = await verifyAuthToken(token, env);
  if (!payload?.userId) return null;

  await createDatabase(env);
  const user = await User.findById(payload.userId).lean();
  if (!user) return null;

  return { ...user, _id: user._id.toString() };
}

/**
 * Require an ADMIN session. Returns the admin user or null.
 */
export async function requireAdmin(context: APIContext) {
  const user = await getAuthUser(context);
  if (!user) return null;
  if (user.role !== 'ADMIN') return null;
  if (user.suspended) return null;
  return user;
}

/**
 * Standard JSON response helper used across admin endpoints.
 */
export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
