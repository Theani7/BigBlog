import { getErrorMessage } from '../../../lib/errors';
import type { APIRoute } from 'astro';
import { createDatabase, type Env } from '../../../db';
import { Repost, Story, User } from '../../../db/schema';
import { verifyAuthToken } from '../../../lib/auth';

export const GET: APIRoute = async ({ request, locals }) => {
  const env = (locals as { env: Env }).env;
  if (!env) {
    return new Response(JSON.stringify({ success: false, error: 'Environment not configured' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const url = new URL(request.url);
  const userId = url.searchParams.get('userId');

  if (!userId) {
    return new Response(JSON.stringify({ success: false, error: 'userId parameter is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    await createDatabase(env);
    // Ensure Story and User models are registered for populate
    void Story;
    void User;

    const reposts = await Repost.find({ userId })
      .populate({
        path: 'storyId',
        populate: { path: 'authorId', select: '-passwordHash' },
      })
      .sort({ createdAt: -1 })
      .lean();

    return new Response(JSON.stringify({ success: true, reposts }), {
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

export const POST: APIRoute = async ({ request, locals, cookies }) => {
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
    const { storyId } = body;

    if (!storyId) {
      return new Response(JSON.stringify({ success: false, error: 'storyId is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const targetStory = await Story.findById(storyId);
    if (!targetStory) {
      return new Response(JSON.stringify({ success: false, error: 'Story not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const existing = await Repost.findOne({ userId: payload.userId, storyId });
    if (existing) {
      await Repost.deleteOne({ _id: existing._id });
      return new Response(JSON.stringify({ success: true, reposted: false }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      await Repost.create({ userId: payload.userId, storyId });
      return new Response(JSON.stringify({ success: true, reposted: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (error: unknown) {
    return new Response(JSON.stringify({ success: false, error: getErrorMessage(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
