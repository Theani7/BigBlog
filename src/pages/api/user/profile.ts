import { getErrorMessage } from '../../../lib/errors';
import type { APIRoute } from 'astro';
import { createDatabase, type Env } from '../../../db';
import { Story, User } from '../../../db/schema';
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
    void Story;
    const body = await request.json();

    const updateData: Record<string, unknown> = {};

    if (body.name !== undefined) {
      if (typeof body.name !== 'string') {
        return new Response(JSON.stringify({ success: false, error: 'Name must be a string' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      const trimmedName = body.name.trim();
      if (trimmedName.length === 0) {
        return new Response(
          JSON.stringify({ success: false, error: 'Name must be a non-empty string' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
      if (trimmedName.length > 100) {
        return new Response(
          JSON.stringify({ success: false, error: 'Name must not exceed 100 characters' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
      updateData.name = trimmedName;
    }

    if (body.bio !== undefined) {
      if (typeof body.bio !== 'string') {
        return new Response(JSON.stringify({ success: false, error: 'Bio must be a string' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      if (body.bio.length > 500) {
        return new Response(
          JSON.stringify({ success: false, error: 'Bio must not exceed 500 characters' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
      updateData.bio = body.bio.trim();
    }

    const sanitizeFields = ['pronouns', 'website', 'twitter', 'github', 'linkedin'];
    for (const field of sanitizeFields) {
      if (body[field] !== undefined) {
        if (typeof body[field] !== 'string') {
          return new Response(
            JSON.stringify({ success: false, error: `${field} must be a string` }),
            {
              status: 400,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        }
        const trimmedField = body[field].trim();
        if (trimmedField.length > 200) {
          return new Response(
            JSON.stringify({ success: false, error: `${field} must not exceed 200 characters` }),
            {
              status: 400,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        }
        updateData[field] = trimmedField;
      }
    }

    if (body.avatar !== undefined) {
      if (typeof body.avatar !== 'string') {
        return new Response(JSON.stringify({ success: false, error: 'Avatar must be a string' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      updateData.avatar = body.avatar.trim();
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
  } catch (error: unknown) {
    return new Response(JSON.stringify({ success: false, error: getErrorMessage(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
