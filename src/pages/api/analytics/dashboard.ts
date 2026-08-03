import { getErrorMessage } from '../../../lib/errors';
import type { APIRoute } from 'astro';
import { createDatabase, type Env } from '../../../db';
import { requireAdmin, json } from '../../../lib/admin';
import {
  pageViews,
  performanceMetrics,
  errorLogs,
  searchEvents,
  scrollDepth,
  apiLatency,
} from '../../../db/schema/analytics';

// =============================================================================
// GET /api/analytics/dashboard?days=7
// Admin-only comprehensive analytics dashboard from real event data
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

    const [views, uniqueSessions, viewsByPage, errors, perf, search, scroll, latency] =
      await Promise.all([
        pageViews.countDocuments({ createdAt: { $gte: start } }),
        pageViews.distinct('sessionId', { createdAt: { $gte: start } }),
        pageViews.aggregate([
          { $match: { createdAt: { $gte: start } } },
          { $group: { _id: '$page', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 },
        ]),
        errorLogs
          .find({ createdAt: { $gte: start } })
          .sort({ createdAt: -1 })
          .limit(20)
          .select('level message page resolved createdAt')
          .lean(),
        performanceMetrics.aggregate([
          { $match: { createdAt: { $gte: start } } },
          { $group: { _id: '$metric', avg: { $avg: '$value' }, count: { $sum: 1 } } },
        ]),
        searchEvents.aggregate([
          { $match: { createdAt: { $gte: start } } },
          {
            $group: {
              _id: '$query',
              count: { $sum: 1 },
              noResults: { $sum: { $cond: [{ $eq: ['$results', 0] }, 1, 0] } },
            },
          },
          { $sort: { count: -1 } },
          { $limit: 10 },
        ]),
        scrollDepth.aggregate([
          { $match: { createdAt: { $gte: start } } },
          {
            $group: {
              _id: '$page',
              avgDepth: { $avg: '$maxDepth' },
              avgTime: { $avg: '$timeOnPage' },
            },
          },
          { $sort: { avgDepth: -1 } },
          { $limit: 10 },
        ]),
        apiLatency.aggregate([
          { $match: { createdAt: { $gte: start } } },
          {
            $group: {
              _id: { endpoint: '$endpoint', method: '$method' },
              avgMs: { $avg: '$latencyMs' },
              count: { $sum: 1 },
              errors: { $sum: { $cond: [{ $gte: ['$statusCode', 400] }, 1, 0] } },
            },
          },
          { $sort: { avgMs: -1 } },
          { $limit: 10 },
        ]),
      ]);

    // Views by day (fill gaps with zeros)
    const byDay = await pageViews.aggregate([
      {
        $match: {
          createdAt: { $gte: start },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const byDayMap = new Map(byDay.map((d) => [d._id, d.count]));
    const viewsByDay = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().slice(0, 10);
      viewsByDay.push({ date: key, count: byDayMap.get(key) || 0 });
    }

    const errCounts = await errorLogs.aggregate([
      { $match: { createdAt: { $gte: start } } },
      { $group: { _id: '$level', count: { $sum: 1 } } },
    ]);
    const errByLevel = errCounts.map((e) => ({ level: e._id, count: e.count }));

    return json({
      success: true,
      data: {
        period: { days, start: start.toISOString() },
        traffic: {
          totalViews: views,
          uniqueVisitors: uniqueSessions.length,
          viewsByPage: viewsByPage.map((v) => ({ page: v._id, count: v.count })),
          viewsByDay,
        },
        performance: {
          coreWebVitals: perf.map((p) => ({
            metric: p._id,
            avg: Math.round(p.avg * 100) / 100,
            count: p.count,
          })),
        },
        errors: {
          total: errByLevel.reduce((sum, e) => sum + e.count, 0),
          byLevel: errByLevel,
          recent: errors.map((e) => ({
            id: e._id.toString(),
            level: e.level,
            message: e.message,
            page: e.page || '',
            resolved: !!e.resolved,
            createdAt: e.createdAt,
          })),
        },
        search: {
          totalQueries: search.reduce((sum, s) => sum + s.count, 0),
          popularQueries: search.map((s) => ({
            query: s._id,
            count: s.count,
            noResult: s.noResults > 0,
          })),
        },
        engagement: {
          scrollDepth: scroll.map((s) => ({
            page: s._id,
            avgDepth: Math.round(s.avgDepth * 100) / 100,
            avgTime: Math.round(s.avgTime || 0),
          })),
        },
        api: {
          latencyByEndpoint: latency.map((l) => ({
            endpoint: `${l._id.method} ${l._id.endpoint}`,
            avgMs: Math.round(l.avgMs * 100) / 100,
            count: l.count,
            errorRate: l.count > 0 ? Math.round((l.errors / l.count) * 1000) / 10 : 0,
          })),
        },
      },
    });
  } catch (error: unknown) {
    return json({ success: false, error: getErrorMessage(error) }, 500);
  }
};
