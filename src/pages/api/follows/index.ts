import type { APIRoute } from 'astro';
import mongoose from 'mongoose';
import { createDatabase, type Env } from '../../../db';
import { authorFollows, User } from '../../../db/schema';
import { getOrCreateSessionId } from '../../../lib/session';
import { verifyAuthToken } from '../../../lib/auth';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

export const GET: APIRoute = async ({ request, locals, cookies }) => {
  const env = (locals as { env: Env }).env;
  if (!env) {
    return json({ success: false, error: 'Environment not configured' }, 503);
  }

  const url = new URL(request.url);
  const authorId = url.searchParams.get('authorId');
  if (!authorId) {
    return json({ success: false, error: 'Author ID required' }, 400);
  }

  try {
    await createDatabase(env);
    const sessionId = getOrCreateSessionId(cookies);

    let authorObjectId: mongoose.Types.ObjectId;
    try {
      authorObjectId = new mongoose.Types.ObjectId(authorId);
    } catch {
      return json({ success: false, error: 'Invalid author ID' }, 400);
    }

    const author = await User.exists({ _id: authorObjectId });
    if (!author) {
      return json({ success: false, error: 'Author not found' }, 404);
    }

    const count = await authorFollows.countDocuments({ authorId: authorObjectId });
    const following =
      (await authorFollows.exists({ authorId: authorObjectId, sessionId })) !== null;

    return json({
      success: true,
      data: { count, following },
      count,
      following,
      isFollowing: following,
    });
  } catch (error: any) {
    return json({ success: false, error: error.message }, 500);
  }
};

export const POST: APIRoute = async ({ request, locals, cookies }) => {
  const env = (locals as { env: Env }).env;
  if (!env) {
    return json({ success: false, error: 'Environment not configured' }, 503);
  }

  try {
    const body = (await request.json()) as { authorId?: string };
    const authorId = body.authorId;
    if (!authorId) {
      return json({ success: false, error: 'Author ID required' }, 400);
    }

    await createDatabase(env);
    const sessionId = getOrCreateSessionId(cookies);

    let authorObjectId: mongoose.Types.ObjectId;
    try {
      authorObjectId = new mongoose.Types.ObjectId(authorId);
    } catch {
      return json({ success: false, error: 'Invalid author ID' }, 400);
    }

    const author = await User.exists({ _id: authorObjectId });
    if (!author) {
      return json({ success: false, error: 'Author not found' }, 404);
    }

    const token = cookies.get('auth_token')?.value;
    const payload = token ? await verifyAuthToken(token, env) : null;
    const userId = payload?.userId ? new mongoose.Types.ObjectId(payload.userId) : undefined;

    const existing = await authorFollows.findOne({ authorId: authorObjectId, sessionId });
    if (existing) {
      await authorFollows.deleteOne({ _id: existing._id });
    } else {
      await authorFollows.create({ authorId: authorObjectId, sessionId, userId });
    }

    const count = await authorFollows.countDocuments({ authorId: authorObjectId });
    const isFollowing = !existing;

    return json({
      success: true,
      data: { following: isFollowing, count },
      count,
      following: isFollowing,
      isFollowing,
    });
  } catch (error: any) {
    return json({ success: false, error: error.message }, 500);
  }
};
