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
  const type = url.searchParams.get('type');

  if (!authorId) {
    return json({ success: false, error: 'Author ID required' }, 400);
  }

  if (!type || (type !== 'followers' && type !== 'following')) {
    return json({ success: false, error: 'Type must be "followers" or "following"' }, 400);
  }

  try {
    await createDatabase(env);

    let authorObjectId: mongoose.Types.ObjectId;
    try {
      authorObjectId = new mongoose.Types.ObjectId(authorId);
    } catch {
      return json({ success: false, error: 'Invalid author ID' }, 400);
    }

    const authorExists = await User.exists({ _id: authorObjectId });
    if (!authorExists) {
      return json({ success: false, error: 'Author not found' }, 404);
    }

    const sessionId = getOrCreateSessionId(cookies);
    const token = cookies.get('auth_token')?.value;
    const payload = token ? await verifyAuthToken(token, env) : null;
    const currentUserId = payload?.userId ? new mongoose.Types.ObjectId(payload.userId) : null;

    let items: any[] = [];
    if (type === 'followers') {
      items = await authorFollows
        .find({ authorId: authorObjectId })
        .populate('userId', 'name avatar bio pronouns role')
        .lean();
    } else {
      items = await authorFollows
        .find({ userId: authorObjectId })
        .populate('authorId', 'name avatar bio pronouns role')
        .lean();
    }

    // Extract populated user/author objects
    const rawAuthors: any[] = [];
    for (const item of items) {
      const populated = type === 'followers' ? item.userId : item.authorId;
      if (populated && typeof populated === 'object' && populated._id) {
        rawAuthors.push(populated);
      }
    }

    // Collect ObjectIds of extracted authors to check follow status in bulk
    const targetAuthorIds = rawAuthors.map((a) => a._id);

    const followedAuthorIdSet = new Set<string>();
    if (targetAuthorIds.length > 0) {
      const followConditions: any[] = [{ sessionId }];
      if (currentUserId) {
        followConditions.push({ userId: currentUserId });
      }

      const myFollows = await authorFollows
        .find({
          authorId: { $in: targetAuthorIds },
          $or: followConditions,
        })
        .select('authorId')
        .lean();

      myFollows.forEach((f: any) => {
        if (f.authorId) {
          followedAuthorIdSet.add(f.authorId.toString());
        }
      });
    }

    const data = rawAuthors.map((author) => {
      const id = author._id.toString();
      return {
        id,
        name: author.name || 'Anonymous',
        avatar: author.avatar || '',
        bio: author.bio || '',
        pronouns: author.pronouns || '',
        role: author.role || 'AUTHOR',
        isFollowing: followedAuthorIdSet.has(id),
      };
    });

    return json({
      success: true,
      data,
    });
  } catch (error: any) {
    return json({ success: false, error: error.message }, 500);
  }
};
