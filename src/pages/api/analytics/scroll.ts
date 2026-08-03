import type { APIRoute } from 'astro';
import { createDatabase, type Env } from '../../../db';
import { scrollDepth } from '../../../db/schema';
import { requireAdmin, json } from '../../../lib/admin';
import { checkRateLimit } from '../../../lib/rateLimit';

// =============================================================================
// POST /api/analytics/scroll
// Persist scroll depth
// =============================================================================
export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as { env: Env }).env;
  if (!env) {
    return json({ success: false, error: 'Environment not configured' }, 503);
  }

  const limited = checkRateLimit(request, {
    key: 'analytics:scroll',
    limit: 120,
    windowMs: 60_000,
  });
  if (limited) return limited;

  try {
    const body = (await request.json()) as {
      page?: string;
      maxDepth?: number;
      timeOnPage?: number;
    };
    const { page, maxDepth, timeOnPage } = body;

    if (!page || maxDepth === undefined) {
      return json({ error: 'page and maxDepth are required' }, 400);
    }

    if (
      typeof maxDepth !== 'number' ||
      !Number.isFinite(maxDepth) ||
      maxDepth < 0 ||
      maxDepth > 1
    ) {
      return json({ error: 'maxDepth must be a number between 0 and 1' }, 400);
    }

    const cookieHeader = request.headers.get('cookie') || '';
    const sessionId = parseCookie(cookieHeader, 'bb_session');

    if (!sessionId) {
      return json({ error: 'session required' }, 400);
    }

    await createDatabase(env);
    await scrollDepth.create({
      page: page.slice(0, 500),
      sessionId,
      maxDepth,
      timeOnPage: typeof timeOnPage === 'number' && Number.isFinite(timeOnPage) ? timeOnPage : 0,
      createdAt: new Date(),
    });

    return json({ success: true });
  } catch (error) {
    console.error('Failed to track scroll depth', error);
    return json({ error: 'Internal server error' }, 500);
  }
};

// =============================================================================
// GET /api/analytics/scroll
// Get scroll depth stats (admin only)
// =============================================================================
export const GET: APIRoute = async (context) => {
  const env = (context.locals as { env: Env }).env;
  if (!env) return json({ success: false, error: 'Environment not configured' }, 503);

  const admin = await requireAdmin(context);
  if (!admin) return json({ success: false, error: 'Unauthorized' }, 401);

  try {
    await createDatabase(env);

    const url = new URL(context.request.url);
    const days = Math.min(Math.max(parseInt(url.searchParams.get('days') || '7', 10), 1), 90);
    const page = url.searchParams.get('page');
    const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const filter: Record<string, unknown> = { createdAt: { $gte: start } };
    if (page) filter.page = page.slice(0, 500);

    const byPage = await scrollDepth.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$page',
          avgDepth: { $avg: '$maxDepth' },
          avgTime: { $avg: '$timeOnPage' },
          count: { $sum: 1 },
        },
      },
      { $sort: { avgDepth: -1 } },
      { $limit: 20 },
    ]);

    return json({
      success: true,
      period: { days, page: page || null },
      byPage: byPage.map((s) => ({
        page: s._id,
        avgDepth: Math.round(s.avgDepth * 1000) / 1000,
        avgTime: Math.round(s.avgTime || 0),
        count: s.count,
      })),
    });
  } catch (error) {
    console.error('Failed to get scroll depth stats', error);
    return json({ error: 'Internal server error' }, 500);
  }
};

// =============================================================================
// HELPERS
// =============================================================================
function parseCookie(cookieHeader: string, name: string): string | undefined {
  const match = cookieHeader.match(new RegExp(`${name}=([^;]+)`));
  return match?.[1];
}
