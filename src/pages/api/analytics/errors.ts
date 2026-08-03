import type { APIRoute } from 'astro';
import { createDatabase, type Env } from '../../../db';
import { errorLogs } from '../../../db/schema/analytics';
import { requireAdmin, json } from '../../../lib/admin';

// =============================================================================
// POST /api/analytics/errors
// Persist client and server errors
// =============================================================================
export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as { env: Env }).env;
  if (!env) {
    return json({ success: false, error: 'Environment not configured' }, 503);
  }

  try {
    const body = (await request.json()) as {
      level?: string;
      message?: string;
      stack?: string;
      page?: string;
      metadata?: Record<string, unknown>;
    };
    const { level, message, stack, page, metadata } = body;

    if (!message || typeof message !== 'string') {
      return json({ error: 'message is required' }, 400);
    }

    const cookieHeader = request.headers.get('cookie') || '';
    const sessionId = parseCookie(cookieHeader, 'bb_session');
    const userAgent = request.headers.get('user-agent') || '';

    await createDatabase(env);
    const entry: Record<string, unknown> = {
      level: level === 'warning' || level === 'info' ? level : 'error',
      message: message.slice(0, 2000),
      userAgent: userAgent.slice(0, 300),
      createdAt: new Date(),
    };
    if (stack) entry.stack = String(stack).slice(0, 4000);
    if (page) entry.page = page.slice(0, 500);
    if (sessionId) entry.sessionId = sessionId;
    if (metadata) entry.metadata = JSON.stringify(metadata).slice(0, 2000);
    await errorLogs.create(entry);

    return json({ success: true });
  } catch (error) {
    console.error('Failed to track error', error);
    return json({ error: 'Internal server error' }, 500);
  }
};

// =============================================================================
// GET /api/analytics/errors
// Get error stats (admin only)
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
    const level = url.searchParams.get('level');
    const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const filter: Record<string, unknown> = { createdAt: { $gte: start } };
    if (level === 'error' || level === 'warning' || level === 'info') filter.level = level;

    const [total, byLevel, recent] = await Promise.all([
      errorLogs.countDocuments(filter),
      errorLogs.aggregate([{ $match: filter }, { $group: { _id: '$level', count: { $sum: 1 } } }]),
      errorLogs.find(filter).sort({ createdAt: -1 }).limit(20).lean(),
    ]);

    return json({
      success: true,
      period: { days, level: level || null },
      total,
      byLevel: byLevel.map((e) => ({ level: e._id, count: e.count })),
      byPage: [],
      recent: recent.map((e) => ({
        id: e._id.toString(),
        level: e.level,
        message: e.message,
        page: e.page || '',
        resolved: !!e.resolved,
        createdAt: e.createdAt,
      })),
    });
  } catch (error) {
    console.error('Failed to get error stats', error);
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
