import { getErrorMessage } from '../../../lib/errors';
import type { APIRoute } from 'astro';
import { createDatabase, type Env } from '../../../db';
import { User } from '../../../db/schema';
import { verifyAuthToken, verifyPassword, hashPassword } from '../../../lib/auth';
import { checkRateLimit } from '../../../lib/rateLimit';

export const POST: APIRoute = async ({ locals, cookies, request }) => {
  const env = (locals as { env: Env }).env;
  if (!env) {
    return new Response(JSON.stringify({ success: false, error: 'Environment not configured' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const limited = checkRateLimit(request, {
    key: 'auth:change-password',
    limit: 10,
    windowMs: 15 * 60_000,
  });
  if (limited) return limited;

  const token = cookies.get('auth_token')?.value;
  if (!token) {
    return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const payload = await verifyAuthToken(token, env);
  if (!payload?.userId) {
    return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    await createDatabase(env);

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return new Response(
        JSON.stringify({ success: false, error: 'Current and new password are required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (typeof newPassword !== 'string' || newPassword.length < 8) {
      return new Response(
        JSON.stringify({ success: false, error: 'New password must be at least 8 characters' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const user = await User.findById(payload.userId);
    if (!user) {
      return new Response(JSON.stringify({ success: false, error: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (user.suspended) {
      return new Response(
        JSON.stringify({ success: false, error: 'This account has been suspended' }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const isValid = await verifyPassword(currentPassword, user.passwordHash);
    if (!isValid) {
      return new Response(
        JSON.stringify({ success: false, error: 'Current password is incorrect' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const isSame = await verifyPassword(newPassword, user.passwordHash);
    if (isSame) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'New password must be different from the current one',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    user.passwordHash = await hashPassword(newPassword);
    await user.save();

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    return new Response(JSON.stringify({ success: false, error: getErrorMessage(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
