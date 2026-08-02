import type { APIRoute } from 'astro';
import { createDatabase, type Env } from '../../../db';
import { User } from '../../../db/schema';
import { verifyAuthToken } from '../../../lib/auth';

export const PUT: APIRoute = async ({ locals, cookies, request }) => {
  const env = (locals as { env: Env }).env;
  if (!env) {
    return new Response(JSON.stringify({ success: false, error: 'Environment not configured' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

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

    const allowedUpdates = [
      'name',
      'bio',
      'avatar',
      'pronouns',
      'website',
      'twitter',
      'github',
      'linkedin',
    ];
    const updateData: Record<string, any> = {};
    for (const key of allowedUpdates) {
      if (body[key] !== undefined) {
        updateData[key] = body[key];
      }
    }
    updateData.updatedAt = new Date();

    const updatedUser = await User.findByIdAndUpdate(payload.userId, updateData, {
      new: true,
    }).select('-passwordHash');

    if (!updatedUser) {
      return new Response(JSON.stringify({ success: false, error: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, user: updatedUser }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Internal error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
