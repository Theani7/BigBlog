import type { ReportReason } from '../../../db/types';
import { getErrorMessage } from '../../../lib/errors';
import type { APIRoute, AstroCookies } from 'astro';
import mongoose from 'mongoose';
import { createDatabase, type Env } from '../../../db';
import { comments, commentReactions, commentReports, User } from '../../../db/schema';
import { getOrCreateSessionId, registerSession } from '../../../lib/session';
import { verifyAuthToken } from '../../../lib/auth';
import { checkRateLimit, getClientIp } from '../../../lib/rateLimit';
import {
  validateComment,
  sanitizeContent,
  detectSpam,
  validateReport,
} from '../../../lib/validation';

const json = (body: unknown, status = 200, extraHeaders: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
  });

const toId = (value: string) => new mongoose.Types.ObjectId(value);

async function getAuthedUser(
  cookies: AstroCookies,
  env: Env
): Promise<{ userId: string | undefined; sessionId: string }> {
  const sessionId = getOrCreateSessionId(cookies);
  const token = cookies.get('auth_token')?.value;
  const payload = token ? await verifyAuthToken(token, env) : null;
  return { userId: payload?.userId, sessionId };
}

export const GET: APIRoute = async ({ request, locals, cookies }) => {
  const env = (locals as { env: Env }).env;
  if (!env) {
    return json({ success: false, error: 'Environment not configured' }, 503);
  }

  const url = new URL(request.url);
  const slug = url.searchParams.get('slug');
  if (!slug) {
    return json({ success: false, error: 'Slug required' }, 400);
  }

  try {
    await createDatabase(env);
    const { sessionId, userId } = await getAuthedUser(cookies, env);

    const count = await comments.countDocuments({
      articleSlug: slug,
      status: 'approved',
      deletedAt: null,
    });

    if (url.searchParams.get('count') === '1') {
      return json({ success: true, data: { comments: [], count } }, 200, {
        'Cache-Control': 'public, max-age=60, s-maxage=300',
      });
    }

    const items = await comments
      .find({ articleSlug: slug, status: 'approved', deletedAt: null })
      .sort({ createdAt: 1 })
      .lean();

    const ids = items.map((c) => c._id);
    const reactions = ids.length
      ? await commentReactions.find({ commentId: { $in: ids } }).lean()
      : [];

    const reactionMap = new Map<string, Record<string, number>>();
    const myReactionMap = new Map<string, string[]>();
    for (const r of reactions) {
      const key = r.commentId.toString();
      const counts = reactionMap.get(key) || {};
      counts[r.emoji] = (counts[r.emoji] || 0) + 1;
      reactionMap.set(key, counts);
      if (String(r.sessionId) === sessionId) {
        const mine = myReactionMap.get(key) || [];
        mine.push(r.emoji);
        myReactionMap.set(key, mine);
      }
    }

    const data = items.map((c) => ({
      id: c._id.toString(),
      articleSlug: c.articleSlug,
      content: c.content,
      authorName: c.authorName,
      parentId: c.parentId ? c.parentId.toString() : null,
      status: c.status,
      isEdited: c.isEdited,
      createdAt: c.createdAt,
      isMine:
        (c.userId && String(c.userId) === userId) ||
        (!c.userId && String(c.sessionId) === sessionId),
      reactionCounts: reactionMap.get(c._id.toString()) || {},
      myReactions: myReactionMap.get(c._id.toString()) || [],
    }));

    return json({ success: true, data: { comments: data, count } });
  } catch (error: unknown) {
    return json({ success: false, error: getErrorMessage(error) }, 500);
  }
};

export const POST: APIRoute = async ({ request, locals, cookies }) => {
  const env = (locals as { env: Env }).env;
  if (!env) {
    return json({ success: false, error: 'Environment not configured' }, 503);
  }

  const url = new URL(request.url);
  const action = url.searchParams.get('action') || 'create';

  const limited = await checkRateLimit(request, {
    key: 'comments:post',
    limit: 30,
    windowMs: 60_000,
  });
  if (limited) return limited;

  try {
    const body = (await request.json()) as {
      articleSlug?: unknown;
      content?: unknown;
      parentId?: unknown;
      commentId?: unknown;
      emoji?: unknown;
      reason?: unknown;
      details?: unknown;
    };
    await createDatabase(env);
    const sessionId = getOrCreateSessionId(cookies);
    await registerSession(env, sessionId, {
      userAgent: request.headers.get('user-agent') || '',
      ip: getClientIp(request),
    });
    const token = cookies.get('auth_token')?.value;
    const payload = token ? await verifyAuthToken(token, env) : null;
    const userId = payload?.userId || undefined;

    switch (action) {
      case 'create': {
        if (!userId) {
          return json({ success: false, error: 'You must be signed in to comment' }, 401);
        }

        const input = {
          articleSlug: typeof body.articleSlug === 'string' ? body.articleSlug : '',
          content: typeof body.content === 'string' ? body.content : '',
          parentId: typeof body.parentId === 'string' ? body.parentId : undefined,
        };

        if (!input.articleSlug || !input.content) {
          return json({ success: false, error: 'Missing required fields' }, 400);
        }

        const user = await User.findById(userId).select('name email').lean();
        if (!user) {
          return json({ success: false, error: 'Account not found' }, 401);
        }
        const authorName = user?.name || user?.email?.split('@')[0] || 'Reader';

        const validation = validateComment({
          articleSlug: input.articleSlug,
          content: input.content,
          authorName,
          authorEmail: user?.email,
        });
        if (!validation.valid) {
          return json({ success: false, error: validation.errors[0] }, 400);
        }

        const spam = detectSpam(input.content);
        const status = spam.isSpam ? 'spam' : 'approved';

        const doc = await comments.create({
          articleSlug: input.articleSlug,
          sessionId,
          userId: toId(userId),
          ...(input.parentId ? { parentId: toId(input.parentId) } : {}),
          content: sanitizeContent(input.content.trim()),
          authorName: sanitizeContent(authorName.trim()),
          ...(user?.email ? { authorEmail: user.email.trim().toLowerCase() } : {}),
          status,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        return json(
          {
            success: true,
            data: {
              id: doc._id.toString(),
              articleSlug: doc.articleSlug,
              content: doc.content,
              authorName: doc.authorName,
              parentId: doc.parentId ? doc.parentId.toString() : null,
              status: doc.status,
              createdAt: doc.createdAt,
              isMine: true,
              reactionCounts: {},
              myReactions: [],
            },
            message: spam.isSpam
              ? 'Comment flagged as spam and hidden'
              : 'Comment posted successfully',
          },
          201
        );
      }

      case 'edit': {
        const commentId = typeof body.commentId === 'string' ? body.commentId : '';
        const content = typeof body.content === 'string' ? body.content : '';
        if (!commentId || !content) {
          return json({ success: false, error: 'Comment ID and content required' }, 400);
        }
        if (content.length > 5000) {
          return json(
            { success: false, error: 'Comment content must be less than 5000 characters' },
            400
          );
        }

        const existing = await comments.findById(toId(commentId));
        const ownsComment =
          existing &&
          ((existing.userId && String(existing.userId) === userId) ||
            (!existing.userId && String(existing.sessionId) === sessionId));
        if (!existing || !ownsComment) {
          return json({ success: false, error: 'Not authorized to edit this comment' }, 403);
        }

        await comments.updateOne(
          { _id: existing._id },
          {
            $set: {
              content: sanitizeContent(content.trim()),
              isEdited: true,
              updatedAt: new Date(),
            },
          }
        );

        return json({
          success: true,
          data: { id: commentId, content: sanitizeContent(content.trim()), isEdited: true },
        });
      }

      case 'delete': {
        const commentId = typeof body.commentId === 'string' ? body.commentId : '';
        if (!commentId) {
          return json({ success: false, error: 'Comment ID required' }, 400);
        }

        const existing = await comments.findById(toId(commentId));
        const ownsComment =
          existing &&
          ((existing.userId && String(existing.userId) === userId) ||
            (!existing.userId && String(existing.sessionId) === sessionId));
        if (!existing || !ownsComment) {
          return json({ success: false, error: 'Not authorized to delete this comment' }, 403);
        }

        await comments.updateOne(
          { _id: existing._id },
          { $set: { deletedAt: new Date(), status: 'rejected' } }
        );
        await commentReactions.deleteMany({ commentId: existing._id });

        return json({ success: true, message: 'Comment deleted' });
      }

      case 'react': {
        const commentId = typeof body.commentId === 'string' ? body.commentId : '';
        const emoji = typeof body.emoji === 'string' ? body.emoji : '';
        if (!commentId || !emoji) {
          return json({ success: false, error: 'Comment ID and emoji required' }, 400);
        }

        const comment = await comments.findById(toId(commentId));
        if (!comment) {
          return json({ success: false, error: 'Comment not found' }, 404);
        }

        const existing = await commentReactions.findOne({
          commentId: comment._id,
          sessionId,
          emoji,
        });

        let added: boolean;
        if (existing) {
          await commentReactions.deleteOne({ _id: existing._id });
          added = false;
        } else {
          await commentReactions.create({ commentId: comment._id, sessionId, emoji });
          added = true;
        }

        const count = await commentReactions.countDocuments({ commentId: comment._id, emoji });
        return json({ success: true, data: { added, count } });
      }

      case 'report': {
        const input = {
          commentId: typeof body.commentId === 'string' ? body.commentId : '',
          reason: typeof body.reason === 'string' ? body.reason : '',
          details: typeof body.details === 'string' ? body.details : undefined,
        };
        const validation = validateReport({
          commentId: String(input.commentId),
          reason: input.reason as ReportReason,
          ...(typeof input.details === 'string' ? { details: input.details } : {}),
        });
        if (!validation.valid) {
          return json({ success: false, error: validation.errors[0] }, 400);
        }

        const comment = await comments.findById(toId(input.commentId));
        if (!comment) {
          return json({ success: false, error: 'Comment not found' }, 404);
        }

        const already = await commentReports.exists({
          commentId: comment._id,
          sessionId,
        });
        if (already) {
          return json({ success: false, error: 'You already reported this comment' }, 400);
        }

        await commentReports.create({
          commentId: comment._id,
          sessionId,
          reason: input.reason,
          ...(input.details ? { details: input.details } : {}),
        });

        return json({ success: true, message: 'Report submitted' });
      }

      default:
        return json({ success: false, error: 'Invalid action' }, 400);
    }
  } catch (error: unknown) {
    return json({ success: false, error: getErrorMessage(error) }, 500);
  }
};
