import { getErrorMessage } from '../../../lib/errors';
import type { APIRoute } from 'astro';
import { createDatabase, type Env } from '../../../db';
import { User, Story, comments, authorFollows, pageViews } from '../../../db/schema';
import { errorLogs } from '../../../db/schema/analytics';
import { requireAdmin, json } from '../../../lib/admin';

// =============================================================================
// GET /api/admin/overview
// Admin dashboard overview: platform counts, pending moderation, recent issues
// =============================================================================
export const GET: APIRoute = async (context) => {
  const env = (context.locals as { env: Env }).env;
  if (!env) return json({ success: false, error: 'Environment not configured' }, 503);

  const admin = await requireAdmin(context);
  if (!admin) return json({ success: false, error: 'Unauthorized' }, 401);

  try {
    await createDatabase(env);

    const [userCount, authorCount, storyCount, publishedCount, pendingComments, totalViews] =
      await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: 'AUTHOR' }),
        Story.countDocuments(),
        Story.countDocuments({ status: 'PUBLISHED' }),
        comments.countDocuments({ status: 'pending' }),
        pageViews.countDocuments(),
      ]);

    const [followCount, recentErrors] = await Promise.all([
      authorFollows.countDocuments(),
      errorLogs
        .find({ level: 'error' })
        .sort({ createdAt: -1 })
        .limit(8)
        .select('message page level createdAt resolved')
        .lean(),
    ]);

    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const views7d = await pageViews.countDocuments({ createdAt: { $gte: last7Days } });

    return json({
      success: true,
      data: {
        counts: {
          users: userCount,
          authors: authorCount,
          stories: storyCount,
          published: publishedCount,
          pendingComments,
          follows: followCount,
          totalViews,
          views7d,
        },
        recentErrors: recentErrors.map((e) => ({
          id: e._id.toString(),
          message: e.message,
          page: e.page || '',
          level: e.level,
          resolved: !!e.resolved,
          createdAt: e.createdAt,
        })),
      },
    });
  } catch (error: unknown) {
    return json({ success: false, error: getErrorMessage(error) }, 500);
  }
};
