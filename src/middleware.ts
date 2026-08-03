import { defineMiddleware } from 'astro:middleware';

import type { Env } from './db';
import { verifyAuthToken } from './lib/auth';
import { getOrCreateSessionId } from './lib/session';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role: string;
}

/**
 * Astro middleware that:
 * 1. Injects environment variables into locals.env so API routes can access
 *    MONGO_URI, JWT_SECRET, etc.
 * 2. Issues (or reuses) the anonymous session cookie on every response.
 * 3. Verifies the auth token once per request and exposes locals.user so
 *    pages render authenticated UI server-side instead of fetching /api/auth/me.
 */
export const onRequest = defineMiddleware(async ({ locals, cookies }, next) => {
  const withEnv = locals as unknown as { env: Env; user?: AuthUser };
  // Populate locals.env from process.env / import.meta.env
  withEnv.env = {
    MONGO_URI: import.meta.env.MONGO_URI || process.env.MONGO_URI || '',
    JWT_SECRET: import.meta.env.JWT_SECRET || process.env.JWT_SECRET || '',
    CLOUDINARY_CLOUD_NAME:
      import.meta.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME || '',
    CLOUDINARY_API_KEY: import.meta.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY || '',
    CLOUDINARY_API_SECRET:
      import.meta.env.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_API_SECRET || '',
  };

  // Ensure every visitor has a server-issued session cookie (no DB write).
  getOrCreateSessionId(cookies);

  const token = cookies.get('auth_token')?.value;
  if (token) {
    const payload = await verifyAuthToken(token, withEnv.env);
    if (payload?.userId) {
      withEnv.user = {
        id: payload.userId,
        email: payload.email,
        name: payload.name || '',
        role: payload.role,
      };
    }
  }

  return next();
});
