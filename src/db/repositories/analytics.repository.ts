import type { Database } from '../index';
import {
  analyticsEvents,
  pageViews,
  performanceMetrics,
  errorLogs,
  searchEvents,
  apiLatency,
  scrollDepth,
} from '../schema/analytics';

export interface AnalyticsEvent {
  event: string;
  page: string;
  sessionId?: string;
  referrer?: string;
  userAgent?: string;
  ipHash?: string;
  country?: string;
  device?: string;
  browser?: string;
  os?: string;
  language?: string;
  metadata?: Record<string, unknown>;
}

export interface PerformanceMetric {
  metric: string;
  value: number;
  page: string;
  sessionId?: string;
  userAgent?: string;
  connection?: string;
  device?: string;
}

export interface ErrorLog {
  level: 'error' | 'warning' | 'info';
  message: string;
  stack?: string;
  page?: string;
  sessionId?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

export interface SearchEvent {
  query: string;
  results: number;
  selectedSlug?: string;
  sessionId?: string;
}

export interface ApiLatencyEvent {
  endpoint: string;
  method: string;
  statusCode: number;
  latencyMs: number;
  sessionId?: string;
}

export interface ScrollDepthEvent {
  page: string;
  sessionId: string;
  maxDepth: number;
  timeOnPage?: number;
}

export class AnalyticsRepository {
  constructor(_db: Database) {}

  async trackEvent(event: AnalyticsEvent): Promise<void> {
    await analyticsEvents.create({
      event: event.event,
      sessionId: event.sessionId,
      page: event.page,
      referrer: event.referrer,
      userAgent: event.userAgent,
      ipHash: event.ipHash,
      country: event.country,
      device: event.device,
      browser: event.browser,
      os: event.os,
      language: event.language,
      metadata: event.metadata,
    });
  }

  async getEventStats(
    startDate: Date,
    endDate: Date,
    event?: string
  ): Promise<{ event: string; count: number }[]> {
    const match: any = {
      createdAt: { $gte: startDate, $lte: endDate },
    };
    if (event) match.event = event;

    return analyticsEvents.aggregate([
      { $match: match },
      { $group: { _id: '$event', count: { $sum: 1 } } },
      { $project: { event: '$_id', count: 1, _id: 0 } },
      { $sort: { count: -1 } }
    ]);
  }

  async trackPageView(view: {
    page: string;
    sessionId: string;
    referrer?: string;
    country?: string;
    device?: string;
    browser?: string;
  }): Promise<void> {
    await pageViews.create(view);
  }

  async getPageViewStats(
    startDate: Date,
    endDate: Date,
    page?: string
  ): Promise<{
    total: number;
    unique: number;
    byPage: { page: string; views: number }[];
    byDay: { date: string; views: number }[];
  }> {
    const match: any = { createdAt: { $gte: startDate, $lte: endDate } };
    if (page) match.page = page;

    const total = await pageViews.countDocuments(match);
    const uniqueResult = await pageViews.distinct('sessionId', match);
    const unique = uniqueResult.length;

    const byPage = await pageViews.aggregate([
      { $match: match },
      { $group: { _id: '$page', views: { $sum: 1 } } },
      { $project: { page: '$_id', views: 1, _id: 0 } },
      { $sort: { views: -1 } }
    ]);

    const byDay = await pageViews.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          views: { $sum: 1 }
        }
      },
      { $project: { date: '$_id', views: 1, _id: 0 } },
      { $sort: { date: 1 } }
    ]);

    return { total, unique, byPage, byDay };
  }

  async trackPerformance(metric: PerformanceMetric): Promise<void> {
    await performanceMetrics.create(metric);
  }

  async getPerformanceStats(
    startDate: Date,
    endDate: Date,
    metric?: string
  ): Promise<{
    byMetric: { metric: string; p50: number; p75: number; p90: number; p99: number }[];
    byPage: { page: string; metric: string; avg: number }[];
  }> {
    const match: any = { createdAt: { $gte: startDate, $lte: endDate } };
    if (metric) match.metric = metric;

    // Approximating percentiles with averages for simplicity as exact percentiles are complex in standard MongoDB aggregate without atlas search or specific functions.
    // In a real Mongoose setup you'd either use a specialized tool, calculate it in memory, or use $percentile if MongoDB >= 7.0
    // We'll calculate simple averages here for the mock, or we can use the $percentile operator assuming MongoDB 7.0+
    const byMetric = await performanceMetrics.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$metric',
          values: { $push: '$value' }
        }
      }
    ]).then(results => results.map(r => {
      const sorted = r.values.sort((a: number, b: number) => a - b);
      const getP = (p: number) => sorted[Math.floor(sorted.length * p)] || 0;
      return {
        metric: r._id,
        p50: getP(0.5),
        p75: getP(0.75),
        p90: getP(0.9),
        p99: getP(0.99)
      };
    }));

    const byPage = await performanceMetrics.aggregate([
      { $match: match },
      { $group: { _id: { page: '$page', metric: '$metric' }, avg: { $avg: '$value' } } },
      { $project: { page: '$_id.page', metric: '$_id.metric', avg: 1, _id: 0 } },
      { $sort: { page: 1 } }
    ]);

    return { byMetric, byPage };
  }

  async logError(error: ErrorLog): Promise<void> {
    await errorLogs.create(error);
  }

  async getErrorStats(
    startDate: Date,
    endDate: Date,
    level?: 'error' | 'warning' | 'info'
  ): Promise<{
    total: number;
    byLevel: { level: string; count: number }[];
    byPage: { page: string; count: number }[];
    recent: { message: string; count: number; lastSeen: Date }[];
  }> {
    const match: any = { createdAt: { $gte: startDate, $lte: endDate } };
    if (level) match.level = level;

    const total = await errorLogs.countDocuments(match);

    const byLevel = await errorLogs.aggregate([
      { $match: match },
      { $group: { _id: '$level', count: { $sum: 1 } } },
      { $project: { level: '$_id', count: 1, _id: 0 } }
    ]);

    const byPage = await errorLogs.aggregate([
      { $match: match },
      { $group: { _id: '$page', count: { $sum: 1 } } },
      { $project: { page: { $ifNull: ['$_id', 'unknown'] }, count: 1, _id: 0 } },
      { $sort: { count: -1 } }
    ]);

    const recent = await errorLogs.aggregate([
      { $match: match },
      { $group: { _id: '$message', count: { $sum: 1 }, lastSeen: { $max: '$createdAt' } } },
      { $project: { message: '$_id', count: 1, lastSeen: 1, _id: 0 } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    return { total, byLevel, byPage, recent };
  }

  async trackSearch(event: SearchEvent): Promise<void> {
    await searchEvents.create(event);
  }

  async getSearchStats(
    startDate: Date,
    endDate: Date
  ): Promise<{
    total: number;
    noResults: { query: string; count: number }[];
    popular: { query: string; count: number }[];
    withSelection: number;
  }> {
    const match: any = { createdAt: { $gte: startDate, $lte: endDate } };
    const total = await searchEvents.countDocuments(match);

    const noResults = await searchEvents.aggregate([
      { $match: { ...match, results: 0 } },
      { $group: { _id: '$query', count: { $sum: 1 } } },
      { $project: { query: '$_id', count: 1, _id: 0 } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    const popular = await searchEvents.aggregate([
      { $match: match },
      { $group: { _id: '$query', count: { $sum: 1 } } },
      { $project: { query: '$_id', count: 1, _id: 0 } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    const withSelection = await searchEvents.countDocuments({ ...match, selectedSlug: { $ne: null } });

    return { total, noResults, popular, withSelection };
  }

  async trackApiLatency(event: ApiLatencyEvent): Promise<void> {
    await apiLatency.create(event);
  }

  async getApiLatencyStats(
    startDate: Date,
    endDate: Date
  ): Promise<{
    byEndpoint: {
      endpoint: string;
      method: string;
      p50: number;
      p95: number;
      p99: number;
      count: number;
    }[];
    errorRate: number;
  }> {
    const match: any = { createdAt: { $gte: startDate, $lte: endDate } };

    const byEndpoint = await apiLatency.aggregate([
      { $match: match },
      {
        $group: {
          _id: { endpoint: '$endpoint', method: '$method' },
          latencies: { $push: '$latencyMs' },
          count: { $sum: 1 }
        }
      }
    ]).then(results => results.map(r => {
      const sorted = r.latencies.sort((a: number, b: number) => a - b);
      const getP = (p: number) => sorted[Math.floor(sorted.length * p)] || 0;
      return {
        endpoint: r._id.endpoint,
        method: r._id.method,
        p50: getP(0.5),
        p95: getP(0.95),
        p99: getP(0.99),
        count: r.count
      };
    })).then(results => results.sort((a, b) => b.count - a.count));

    const total = await apiLatency.countDocuments(match);
    const errors = await apiLatency.countDocuments({ ...match, statusCode: { $gte: 400 } });

    return {
      byEndpoint,
      errorRate: total > 0 ? errors / total : 0,
    };
  }

  async trackScrollDepth(event: ScrollDepthEvent): Promise<void> {
    await scrollDepth.create(event);
  }

  async getScrollDepthStats(
    startDate: Date,
    endDate: Date,
    page?: string
  ): Promise<{
    byPage: { page: string; avgDepth: number; avgTime: number; count: number }[];
  }> {
    const match: any = { createdAt: { $gte: startDate, $lte: endDate } };
    if (page) match.page = page;

    const byPage = await scrollDepth.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$page',
          avgDepth: { $avg: '$maxDepth' },
          avgTime: { $avg: '$timeOnPage' },
          count: { $sum: 1 }
        }
      },
      { $project: { page: '$_id', avgDepth: 1, avgTime: 1, count: 1, _id: 0 } },
      { $sort: { count: -1 } }
    ]);

    return { byPage };
  }
}

export function createAnalyticsRepository(db: Database): AnalyticsRepository {
  return new AnalyticsRepository(db);
}
