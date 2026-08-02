import type { APIRoute } from 'astro';
import { createDatabase, type Env } from '../../../../db';
import { Story } from '../../../../db/schema';
import { requireAdmin, json } from '../../../../lib/admin';

const VALID_STATUSES = ['DRAFT', 'PUBLISHED', 'SCHEDULED', 'UNLISTED'];

// =============================================================================
// GET /api/admin/stories?status=&search=&page=&limit=
// PATCH /api/admin/stories  { id, status }
// DELETE /api/admin/stories { id }
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
    const search = url.searchParams.get('search')?.trim() || '';
    const page = Math.max(parseInt(url.searchParams.get('page') || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(url.searchParams.get('limit') || '25', 10), 1), 100);

    const filter: any = {};
    if (VALID_STATUSES.includes(status)) filter.status = status;
    if (search) filter.title = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

    const [stories, total] = await Promise.all([
      Story.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('authorId', 'name email')
        .lean(),
      Story.countDocuments(filter),
    ]);

    return json({
      success: true,
      data: stories.map((s: any) => ({
        id: s._id.toString(),
        title: s.title,
        slug: s.slug,
        excerpt: s.excerpt || '',
        status: s.status,
        category: s.category || '',
        views: s.views || 0,
        reads: s.reads || 0,
        publishedAt: s.publishedAt || null,
        createdAt: s.createdAt,
        author: s.authorId
          ? { id: s.authorId._id.toString(), name: s.authorId.name || s.authorId.email }
          : null,
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

    const story = await Story.findById(id);
    if (!story) return json({ success: false, error: 'Story not found' }, 404);

    story.status = status;
    if (status === 'PUBLISHED' && !story.publishedAt) story.publishedAt = new Date();
    await story.save();

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

    const story = await Story.findById(id);
    if (!story) return json({ success: false, error: 'Story not found' }, 404);

    await Story.deleteOne({ _id: id });
    return json({ success: true, data: { id } });
  } catch (error: any) {
    return json({ success: false, error: error.message }, 500);
  }
};
