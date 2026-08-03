import type { APIRoute } from 'astro';
import { createDatabase, type Env } from '../../../db';
import { performanceMetrics } from '../../../db/schema/analytics';
import { requireAdmin, json } from '../../../lib/admin';

// =============================================================================
// POST /api/analytics/performance
// Persist Core Web Vitals and performance metrics
// =============================================================================
export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as { env: Env }).env;
  if (!env) {
    return json({ success: false, error: 'Environment not configured' }, 503);
  }

  try {
    const body = (await request.json()) as {
      metric?: string;
      value?: number;
      page?: string;
      connection?: string;
    };
    const { metric, value, page, connection } = body;

    if (!metric || value === undefined || !page) {
      return json({ error: 'metric, value, and page are required' }, 400);
    }

    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 100000) {
      return json({ error: 'value must be a finite number' }, 400);
    }

    const cookieHeader = request.headers.get('cookie') || '';
    const sessionId = parseCookie(cookieHeader, 'bb_session');
    const userAgent = request.headers.get('user-agent') || '';

    await createDatabase(env);
    const entry: Record<string, unknown> = {
      metric: String(metric).slice(0, 64),
      value,
      page: page.slice(0, 500),
      userAgent: userAgent.slice(0, 300),
      createdAt: new Date(),
    };
    if (sessionId) entry.sessionId = sessionId;
    if (connection) entry.connection = String(connection).slice(0, 64);
    await performanceMetrics.create(entry);

    return json({ success: true });
  } catch (error) {
    console.error('Failed to track performance metric', error);
    return json({ error: 'Internal server error' }, 500);
  }
};

// =============================================================================
// GET /api/analytics/performance
// Get performance stats (admin only)
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

    const metrics = await performanceMetrics.aggregate([
      { $match: { createdAt: { $gte: start } } },
      {
        $group: {
          _id: '$metric',
          avg: { $avg: '$value' },
          min: { $min: '$value' },
          max: { $max: '$value' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return json({
      success: true,
      period: { days },
      metrics: metrics.map((m) => ({
        metric: m._id,
        avg: Math.round(m.avg * 100) / 100,
        min: Math.round(m.min * 100) / 100,
        max: Math.round(m.max * 100) / 100,
        count: m.count,
      })),
    });
  } catch (error) {
    console.error('Failed to get performance stats', error);
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
