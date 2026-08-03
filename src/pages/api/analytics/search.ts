import type { APIRoute } from 'astro';
import { createDatabase, type Env } from '../../../db';
import { searchEvents } from '../../../db/schema/analytics';
import { requireAdmin, json } from '../../../lib/admin';
import { checkRateLimit } from '../../../lib/rateLimit';

// =============================================================================
// POST /api/analytics/search
// Persist search queries
// =============================================================================
export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as { env: Env }).env;
  if (!env) {
    return json({ success: false, error: 'Environment not configured' }, 503);
  }

  const limited = checkRateLimit(request, {
    key: 'analytics:search',
    limit: 120,
    windowMs: 60_000,
  });
  if (limited) return limited;

  try {
    const body = (await request.json()) as {
      query?: string;
      results?: number;
      selectedSlug?: string;
    };
    const { query, results, selectedSlug } = body;

    if (!query || typeof query !== 'string') {
      return json({ error: 'query is required' }, 400);
    }

    const cookieHeader = request.headers.get('cookie') || '';
    const sessionId = parseCookie(cookieHeader, 'bb_session');

    await createDatabase(env);
    const entry: Record<string, unknown> = {
      query: query.slice(0, 200),
      results: typeof results === 'number' && Number.isFinite(results) ? results : 0,
      createdAt: new Date(),
    };
    if (selectedSlug) entry.selectedSlug = String(selectedSlug).slice(0, 300);
    if (sessionId) entry.sessionId = sessionId;
    await searchEvents.create(entry);

    return json({ success: true });
  } catch (error) {
    console.error('Failed to track search', error);
    return json({ error: 'Internal server error' }, 500);
  }
};

// =============================================================================
// GET /api/analytics/search
// Get search stats (admin only)
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
    const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [popular, noResults, withSelection] = await Promise.all([
      searchEvents.aggregate([
        { $match: { createdAt: { $gte: start } } },
        { $group: { _id: '$query', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      searchEvents.aggregate([
        { $match: { createdAt: { $gte: start }, results: 0 } },
        { $group: { _id: '$query', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      searchEvents.countDocuments({
        createdAt: { $gte: start },
        selectedSlug: { $ne: null },
      }),
    ]);

    return json({
      success: true,
      period: { days },
      total: popular.reduce((sum, p) => sum + p.count, 0),
      popular: popular.map((p) => ({ query: p._id, count: p.count })),
      noResults: noResults.map((n) => ({ query: n._id, count: n.count })),
      withSelection,
    });
  } catch (error) {
    console.error('Failed to get search stats', error);
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
