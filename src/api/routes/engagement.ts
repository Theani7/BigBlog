import { createApiContext, handleCors, rateLimit, parseBody } from '../middleware';
import { createDatabase, type Env } from '../../db';
import { ViewsService } from '../../lib/services';
import { successResponse, errorResponse } from '../../lib/errors';
import { validateComment } from '../../lib/validation';

export async function handleViews(request: Request, env: Env): Promise<Response> {
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  try {
    const db = createDatabase(env);
    const ctx = await createApiContext(request, db);
    const viewsService = new ViewsService(db);

    if (request.method === 'POST') {
      const body = await parseBody<{ articleSlug: string; referrer?: string }>(request);

      // Rate limit: 100 views per minute per session
      const { allowed, retryAfter } = rateLimit(`views:${ctx.sessionId}`, 60000, 100);
      if (!allowed) {
        return errorResponse(new Error(`Rate limit exceeded. Retry after ${retryAfter}s`));
      }

      const result = await viewsService.trackView(body.articleSlug, ctx.sessionId, body.referrer);
      return successResponse(result);
    }

    if (request.method === 'GET') {
      const slug = ctx.url.searchParams.get('slug');
      if (!slug) {
        return errorResponse(new Error('Article slug is required'));
      }

      const stats = await viewsService.getStats(slug);
      return successResponse(stats);
    }

    return errorResponse(new Error('Method not allowed'));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function handleLikes(request: Request, env: Env): Promise<Response> {
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  try {
    const db = createDatabase(env);
    const ctx = await createApiContext(request, db);
    const { LikesService } = await import('../../lib/services');
    const likesService = new LikesService(db);

    if (request.method === 'POST') {
      const body = await parseBody<{ articleSlug: string }>(request);

      const { allowed, retryAfter } = rateLimit(`likes:${ctx.sessionId}`, 60000, 50);
      if (!allowed) {
        return errorResponse(new Error(`Rate limit exceeded. Retry after ${retryAfter}s`));
      }

      const result = await likesService.toggle(body.articleSlug, ctx.sessionId);
      return successResponse(result);
    }

    if (request.method === 'GET') {
      const slug = ctx.url.searchParams.get('slug');
      if (!slug) {
        return errorResponse(new Error('Article slug is required'));
      }

      const [count, liked] = await Promise.all([
        likesService.getCount(slug),
        likesService.hasLiked(slug, ctx.sessionId),
      ]);

      return successResponse({ count, liked });
    }

    return errorResponse(new Error('Method not allowed'));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function handleBookmarks(request: Request, env: Env): Promise<Response> {
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  try {
    const db = createDatabase(env);
    const ctx = await createApiContext(request, db);
    const { BookmarksService } = await import('../../lib/services');
    const bookmarksService = new BookmarksService(db);

    if (request.method === 'POST') {
      const body = await parseBody<{ articleSlug: string }>(request);

      const result = await bookmarksService.toggle(body.articleSlug, ctx.sessionId);
      return successResponse(result);
    }

    if (request.method === 'GET') {
      const bookmarks = await bookmarksService.getBookmarks(ctx.sessionId);
      return successResponse(bookmarks);
    }

    return errorResponse(new Error('Method not allowed'));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function handleComments(request: Request, env: Env): Promise<Response> {
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  try {
    const db = createDatabase(env);
    const ctx = await createApiContext(request, db);
    const { CommentsService } = await import('../../lib/services');
    const commentsService = new CommentsService(db);

    if (request.method === 'POST') {
      const body = await parseBody<{
        articleSlug: string;
        content: string;
        authorName: string;
        authorEmail?: string;
        parentId?: number;
      }>(request);

      // Rate limit: 10 comments per minute
      const { allowed, retryAfter } = rateLimit(`comments:${ctx.sessionId}`, 60000, 10);
      if (!allowed) {
        return errorResponse(new Error(`Rate limit exceeded. Retry after ${retryAfter}s`));
      }

      // Validate input
      const validation = validateComment(body);
      if (!validation.valid) {
        return errorResponse(new Error(validation.errors.join(', ')));
      }

      const commentData: {
        content: string;
        authorName: string;
        authorEmail?: string;
        parentId?: number;
      } = {
        content: body.content,
        authorName: body.authorName,
      };
      if (body.authorEmail !== undefined) commentData.authorEmail = body.authorEmail;
      if (body.parentId !== undefined) commentData.parentId = body.parentId;

      const comment = await commentsService.create(body.articleSlug, ctx.sessionId, commentData);

      return successResponse(comment, 'Comment submitted for moderation', 201);
    }

    if (request.method === 'GET') {
      const slug = ctx.url.searchParams.get('slug');
      if (!slug) {
        return errorResponse(new Error('Article slug is required'));
      }

      const comments = await commentsService.getThreaded(slug);
      const count = await commentsService.getCount(slug);

      return successResponse({ comments, count });
    }

    return errorResponse(new Error('Method not allowed'));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function handleCommentActions(
  request: Request,
  env: Env,
  action: string
): Promise<Response> {
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  try {
    const db = createDatabase(env);
    const ctx = await createApiContext(request, db);
    const { CommentsService } = await import('../../lib/services');
    const commentsService = new CommentsService(db);

    const body = await parseBody<{
      commentId: number;
      content?: string;
      emoji?: string;
      reason?: string;
      details?: string;
    }>(request);

    switch (action) {
      case 'edit': {
        if (!body.content) {
          return errorResponse(new Error('Content is required'));
        }
        const result = await commentsService.edit(body.commentId, ctx.sessionId, body.content);
        return successResponse(result);
      }

      case 'delete': {
        const result = await commentsService.delete(body.commentId, ctx.sessionId);
        return successResponse(result);
      }

      case 'react': {
        if (!body.emoji) {
          return errorResponse(new Error('Emoji is required'));
        }
        const result = await commentsService.react(body.commentId, ctx.sessionId, body.emoji);
        return successResponse(result);
      }

      case 'report': {
        if (!body.reason) {
          return errorResponse(new Error('Reason is required'));
        }
        const result = await commentsService.report(
          body.commentId,
          ctx.sessionId,
          body.reason,
          body.details
        );
        return successResponse(result, 'Report submitted');
      }

      default:
        return errorResponse(new Error('Invalid action'));
    }
  } catch (error) {
    return errorResponse(error);
  }
}
