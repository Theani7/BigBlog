import type { APIRoute } from 'astro';
import mongoose from 'mongoose';
import { createDatabase, type Env } from '../../../db';
import { comments, commentReactions, commentReports, User } from '../../../db/schema';
import { getOrCreateSessionId } from '../../../lib/session';
import { verifyAuthToken } from '../../../lib/auth';
import {
  validateComment,
  sanitizeContent,
  detectSpam,
  validateReport,
} from '../../../lib/validation';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const toId = (value: string) => new mongoose.Types.ObjectId(value);

async function getAuthedUser(
  cookies: any,
  env: Env
): Promise<{ userId?: string; sessionId: string }> {
  const sessionId = getOrCreateSessionId(cookies);
  const token = cookies.get('auth_token')?.value;
  const payload = token ? await verifyAuthToken(token, env) : null;
  return { userId: payload?.userId || undefined, sessionId };
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
      return json({ success: true, data: { comments: [], count } });
    }

    const items = await comments
      .find({ articleSlug: slug, status: 'approved', deletedAt: null })
      .sort({ createdAt: 1 })
      .lean();

    const ids = items.map((c: any) => c._id);
    const reactions = ids.length
      ? await commentReactions.find({ commentId: { $in: ids } }).lean()
      : [];

    const reactionMap = new Map<string, Record<string, number>>();
    const myReactionMap = new Map<string, string[]>();
    for (const r of reactions as any[]) {
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

    const data = (items as any[]).map((c) => ({
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
  } catch (error: any) {
    return json({ success: false, error: error.message }, 500);
  }
};

export const POST: APIRoute = async ({ request, locals, cookies }) => {
  const env = (locals as { env: Env }).env;
  if (!env) {
    return json({ success: false, error: 'Environment not configured' }, 503);
  }

  const url = new URL(request.url);
  const action = url.searchParams.get('action') || 'create';

  try {
    const body = (await request.json()) as Record<string, any>;
    await createDatabase(env);
    const sessionId = getOrCreateSessionId(cookies);
    const token = cookies.get('auth_token')?.value;
    const payload = token ? await verifyAuthToken(token, env) : null;
    const userId = payload?.userId || undefined;

    switch (action) {
      case 'create': {
        if (!userId) {
          return json({ success: false, error: 'You must be signed in to comment' }, 401);
        }

        const input = {
          articleSlug: body.articleSlug,
          content: body.content,
          parentId: body.parentId,
        };

        if (!input.articleSlug || !input.content) {
          return json({ success: false, error: 'Missing required fields' }, 400);
        }

        const user = await (User as any).findById(userId).select('name email');
        if (!user) {
          return json({ success: false, error: 'Account not found' }, 401);
        }
        const authorName = (user as any).name || (user as any).email?.split('@')[0] || 'Reader';

        const validation = validateComment({
          articleSlug: input.articleSlug,
          content: input.content,
          authorName,
          authorEmail: (user as any).email,
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
          parentId: input.parentId ? toId(input.parentId) : undefined,
          content: sanitizeContent(input.content.trim()),
          authorName: sanitizeContent(authorName.trim()),
          authorEmail: (user as any).email?.trim().toLowerCase(),
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
        const { commentId, content } = body;
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
        const { commentId } = body;
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
        const { commentId, emoji } = body;
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
        const input = { commentId: body.commentId, reason: body.reason, details: body.details };
        const validation = validateReport(input as any);
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
          details: input.details,
        });

        return json({ success: true, message: 'Report submitted' });
      }

      default:
        return json({ success: false, error: 'Invalid action' }, 400);
    }
  } catch (error: any) {
    return json({ success: false, error: error.message }, 500);
  }
};
