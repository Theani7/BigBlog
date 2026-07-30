import type { APIRoute } from 'astro';
import { createDatabase, type Env } from '../../../db';
import { User } from '../../../db/schema';
import { verifyAuthToken } from '../../../lib/auth';

export const GET: APIRoute = async ({ locals, cookies }) => {
  const env = (locals as { env: Env }).env;

  if (!env) {
    return new Response(JSON.stringify({ success: false, error: 'Environment not configured' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const token = cookies.get('auth_token')?.value;

    if (!token) {
      return new Response(JSON.stringify({ success: false, user: null }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const payload = await verifyAuthToken(token, env);
    if (!payload || !payload.userId) {
      return new Response(JSON.stringify({ success: false, user: null }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Connect to database
    await createDatabase(env);

    // Fetch fresh user data
    const user = await User.findById(payload.userId).select('-passwordHash');
    if (!user) {
      return new Response(JSON.stringify({ success: false, user: null }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        user: { id: user._id, email: user.email, name: user.name, role: user.role },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
