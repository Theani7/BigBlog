import type { APIRoute } from 'astro';
import { createDatabase, type Env } from '../../../db';
import { performanceMetrics } from '../../../db/schema/analytics';
import { requireAdmin, json } from '../../../lib/admin';
import { checkRateLimit } from '../../../lib/rateLimit';

// =============================================================================
// POST /api/analytics/performance
// Persist Core Web Vitals and performance metrics
// =============================================================================
export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as { env: Env }).env;
  if (!env) {
    return json({ success: false, error: 'Environment not configured' }, 503);
  }

  const limited = checkRateLimit(request, {
    key: 'analytics:performance',
    limit: 120,
    windowMs: 60_000,
  });
  if (limited) return limited;

  try {
    const body = (await request.json()) as {
      metric?: string;
      value?: number;
      page?: string;
      connection?: string;
      sessionId?: string;
      events?: Array<{
        metric?: string;
        value?: number;
        page?: string;
        connection?: string;
        sessionId?: string;
      }>;
    };
    const rawEvents = Array.isArray(body.events) ? body.events : [body];

    const cookieHeader = request.headers.get('cookie') || '';
    const cookieSession = parseCookie(cookieHeader, 'bb_session');
    const userAgent = request.headers.get('user-agent') || '';

    await createDatabase(env);

    const docs: Array<Record<string, unknown>> = [];
    for (const raw of rawEvents) {
      const { metric, value, page } = raw;
      if (!metric || value === undefined || !page) continue;

      if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 100000) {
        continue;
      }

      const entry: Record<string, unknown> = {
        metric: String(metric).slice(0, 64),
        value,
        page: page.slice(0, 500),
        userAgent: userAgent.slice(0, 300),
        createdAt: new Date(),
      };
      const sessionId = raw.sessionId || cookieSession || '';
      if (sessionId) entry.sessionId = sessionId;
      if (raw.connection) entry.connection = String(raw.connection).slice(0, 64);
      docs.push(entry);
    }

    if (docs.length > 0) await performanceMetrics.insertMany(docs);
    return json({ success: true, recorded: docs.length });
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
