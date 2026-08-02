import type { APIRoute } from 'astro';
import { createDatabase, type Env } from '../../../../db';
import { comments, Story } from '../../../../db/schema';
import { requireAdmin, json } from '../../../../lib/admin';

const VALID_STATUSES = ['pending', 'approved', 'rejected', 'spam'];

// =============================================================================
// GET /api/admin/comments?status=&page=&limit=
// List comments for moderation, optionally joined with story titles
// PATCH /api/admin/comments  { id, status }
// DELETE /api/admin/comments { id }
// =============================================================================
export const GET: APIRoute = async (context) => {
  const env = (context.locals as { env: Env }).env;
  if (!env) return json({ success: false, error: 'Environment not configured' }, 503);

  const admin = await requireAdmin(context);
  if (!admin) return json({ success: false, error: 'Unauthorized' }, 401);

  try {
    await createDatabase(env);

    const url = new URL(context.request.url);
    const status = url.searchParams.get('status') || '';
    const page = Math.max(parseInt(url.searchParams.get('page') || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(url.searchParams.get('limit') || '25', 10), 1), 100);

    const filter: any = {};
    if (VALID_STATUSES.includes(status)) filter.status = status;

    const [items, total] = await Promise.all([
      comments
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      comments.countDocuments(filter),
    ]);

    const slugs = [...new Set(items.map((c: any) => c.articleSlug))];
    const stories = await Story.find({ slug: { $in: slugs } })
      .select('title slug')
      .lean();
    const titleBySlug = new Map(stories.map((s: any) => [s.slug, s.title]));

    return json({
      success: true,
      data: items.map((c: any) => ({
        id: c._id.toString(),
        articleSlug: c.articleSlug,
        articleTitle: titleBySlug.get(c.articleSlug) || c.articleSlug,
        authorName: c.authorName,
        authorEmail: c.authorEmail || '',
        content: c.content,
        status: c.status,
        isEdited: !!c.isEdited,
        parentId: c.parentId ? c.parentId.toString() : null,
        createdAt: c.createdAt,
      })),
      meta: { total, page, limit, pages: Math.max(Math.ceil(total / limit), 1) },
    });
  } catch (error: any) {
    return json({ success: false, error: error.message }, 500);
  }
};

export const PATCH: APIRoute = async (context) => {
  const env = (context.locals as { env: Env }).env;
  if (!env) return json({ success: false, error: 'Environment not configured' }, 503);

  const admin = await requireAdmin(context);
  if (!admin) return json({ success: false, error: 'Unauthorized' }, 401);

  try {
    await createDatabase(env);

    const body = await context.request.json();
    const { id, status } = body;
    if (!id || !VALID_STATUSES.includes(status)) {
      return json({ success: false, error: 'Invalid id or status' }, 400);
    }

    const comment = await comments.findById(id);
    if (!comment) return json({ success: false, error: 'Comment not found' }, 404);

    comment.status = status;
    await comment.save();
    return json({ success: true, data: { id, status } });
  } catch (error: any) {
    return json({ success: false, error: error.message }, 500);
  }
};

export const DELETE: APIRoute = async (context) => {
  const env = (context.locals as { env: Env }).env;
  if (!env) return json({ success: false, error: 'Environment not configured' }, 503);

  const admin = await requireAdmin(context);
  if (!admin) return json({ success: false, error: 'Unauthorized' }, 401);

  try {
    await createDatabase(env);

    const body = await context.request.json();
    const { id } = body;
    if (!id) return json({ success: false, error: 'Missing id' }, 400);

    const comment = await comments.findById(id);
    if (!comment) return json({ success: false, error: 'Comment not found' }, 404);

    await comments.deleteOne({ _id: id });
    return json({ success: true, data: { id } });
  } catch (error: any) {
    return json({ success: false, error: error.message }, 500);
  }
};
