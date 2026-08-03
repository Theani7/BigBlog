import { getErrorMessage } from '../../../../lib/errors';
import type { APIRoute } from 'astro';
import { createDatabase, type Env } from '../../../../db';
import { User, Story } from '../../../../db/schema';
import { requireAdmin, json } from '../../../../lib/admin';

// =============================================================================
// GET /api/admin/users?search=&role=&suspended=&page=&limit=
// List users with optional filtering
// PATCH /api/admin/users  { id, action: 'role'|'suspend', value }
// DELETE /api/admin/users { id }
// =============================================================================
export const GET: APIRoute = async (context) => {
  const env = (context.locals as { env: Env }).env;
  if (!env) return json({ success: false, error: 'Environment not configured' }, 503);

  const admin = await requireAdmin(context);
  if (!admin) return json({ success: false, error: 'Unauthorized' }, 401);

  try {
    await createDatabase(env);

    const url = new URL(context.request.url);
    const search = url.searchParams.get('search')?.trim() || '';
    const role = url.searchParams.get('role') || '';
    const suspended = url.searchParams.get('suspended');
    const page = Math.max(parseInt(url.searchParams.get('page') || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(url.searchParams.get('limit') || '25', 10), 1), 100);

    const filter: Record<string, unknown> = {};
    if (search) {
      const re = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ name: re }, { email: re }];
    }
    if (role === 'ADMIN' || role === 'AUTHOR') filter.role = role;
    if (suspended === 'true') filter.suspended = true;
    if (suspended === 'false') filter.suspended = false;

    const [users, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select('-passwordHash')
        .lean(),
      User.countDocuments(filter),
    ]);

    const storyCounts = await Story.aggregate([
      { $group: { _id: '$authorId', count: { $sum: 1 } } },
    ]);
    const countByAuthor = new Map(storyCounts.map((s) => [s._id.toString(), s.count]));

    return json({
      success: true,
      data: users.map((u) => ({
        id: u._id.toString(),
        email: u.email,
        name: u.name || '',
        avatar: u.avatar || '',
        bio: u.bio || '',
        role: u.role,
        suspended: !!u.suspended,
        storyCount: countByAuthor.get(u._id.toString()) || 0,
        createdAt: u.createdAt,
      })),
      meta: { total, page, limit, pages: Math.max(Math.ceil(total / limit), 1) },
    });
  } catch (error: unknown) {
    return json({ success: false, error: getErrorMessage(error) }, 500);
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
    const { id, action, value } = body;
    if (!id || !action) return json({ success: false, error: 'Missing id or action' }, 400);

    if (id === admin._id && action !== 'suspend') {
      return json({ success: false, error: 'You cannot change your own role' }, 400);
    }
    if (id === admin._id && action === 'suspend' && value) {
      return json({ success: false, error: 'You cannot suspend yourself' }, 400);
    }

    const target = await User.findById(id);
    if (!target) return json({ success: false, error: 'User not found' }, 404);

    if (action === 'role') {
      if (value !== 'ADMIN' && value !== 'AUTHOR') {
        return json({ success: false, error: 'Invalid role' }, 400);
      }
      if (target.role === 'ADMIN' && value === 'AUTHOR') {
        const adminCount = await User.countDocuments({ role: 'ADMIN' });
        if (adminCount <= 1) {
          return json({ success: false, error: 'Cannot demote the last admin' }, 400);
        }
      }
      target.role = value;
      await target.save();
      return json({ success: true, data: { id, role: value } });
    }

    if (action === 'suspend') {
      target.suspended = !!value;
      await target.save();
      return json({ success: true, data: { id, suspended: target.suspended } });
    }

    return json({ success: false, error: 'Unknown action' }, 400);
  } catch (error: unknown) {
    return json({ success: false, error: getErrorMessage(error) }, 500);
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

    if (id === admin._id) return json({ success: false, error: 'You cannot delete yourself' }, 400);

    const target = await User.findById(id);
    if (!target) return json({ success: false, error: 'User not found' }, 404);

    if (target.role === 'ADMIN') {
      const adminCount = await User.countDocuments({ role: 'ADMIN' });
      if (adminCount <= 1) {
        return json({ success: false, error: 'Cannot delete the last admin' }, 400);
      }
    }

    await User.deleteOne({ _id: id });
    await Story.deleteMany({ authorId: id });

    return json({ success: true, data: { id } });
  } catch (error: unknown) {
    return json({ success: false, error: getErrorMessage(error) }, 500);
  }
};
