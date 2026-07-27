import { eq, and, gte, lte, desc, sql, count } from 'drizzle-orm';
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

// =============================================================================
// ANALYTICS REPOSITORY
// =============================================================================
export class AnalyticsRepository {
  constructor(private db: Database) {}

  // -------------------------------------------------------------------------
  // Events
  // -------------------------------------------------------------------------
  async trackEvent(event: AnalyticsEvent): Promise<void> {
    await this.db.insert(analyticsEvents).values({
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
      metadata: event.metadata ? JSON.stringify(event.metadata) : undefined,
    });
  }

  async getEventStats(
    startDate: Date,
    endDate: Date,
    event?: string
  ): Promise<{ event: string; count: number }[]> {
    const conditions = [
      gte(analyticsEvents.createdAt, startDate),
      lte(analyticsEvents.createdAt, endDate),
    ];
    if (event) {
      conditions.push(eq(analyticsEvents.event, event));
    }

    return this.db
      .select({
        event: analyticsEvents.event,
        count: count(),
      })
      .from(analyticsEvents)
      .where(and(...conditions))
      .groupBy(analyticsEvents.event)
      .orderBy(desc(count()));
  }

  // -------------------------------------------------------------------------
  // Page Views
  // -------------------------------------------------------------------------
  async trackPageView(view: {
    page: string;
    sessionId: string;
    referrer?: string;
    country?: string;
    device?: string;
    browser?: string;
  }): Promise<void> {
    await this.db.insert(pageViews).values({
      page: view.page,
      sessionId: view.sessionId,
      referrer: view.referrer,
      country: view.country,
      device: view.device,
      browser: view.browser,
    });
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
    const conditions = [gte(pageViews.createdAt, startDate), lte(pageViews.createdAt, endDate)];
    if (page) {
      conditions.push(eq(pageViews.page, page));
    }

    const [totalResult] = await this.db
      .select({ count: count() })
      .from(pageViews)
      .where(and(...conditions));

    const [uniqueResult] = await this.db
      .select({ count: count() })
      .from(pageViews)
      .where(and(...conditions))
      .groupBy(pageViews.sessionId)
      .execute()
      .then((rows: { count: number }[]) => [{ count: rows.length }]);

    const byPage = await this.db
      .select({
        page: pageViews.page,
        views: count(),
      })
      .from(pageViews)
      .where(and(...conditions))
      .groupBy(pageViews.page)
      .orderBy(desc(count()));

    const byDay = await this.db
      .select({
        date: sql<string>`date(${pageViews.createdAt}, 'unixepoch')`,
        views: count(),
      })
      .from(pageViews)
      .where(and(...conditions))
      .groupBy(sql`date(${pageViews.createdAt}, 'unixepoch')`)
      .orderBy(sql`date(${pageViews.createdAt}, 'unixepoch')`);

    return {
      total: totalResult?.count ?? 0,
      unique: uniqueResult?.count ?? 0,
      byPage,
      byDay,
    };
  }

  // -------------------------------------------------------------------------
  // Performance Metrics
  // -------------------------------------------------------------------------
  async trackPerformance(metric: PerformanceMetric): Promise<void> {
    await this.db.insert(performanceMetrics).values({
      metric: metric.metric,
      value: metric.value,
      page: metric.page,
      sessionId: metric.sessionId,
      userAgent: metric.userAgent,
      connection: metric.connection,
      device: metric.device,
    });
  }

  async getPerformanceStats(
    startDate: Date,
    endDate: Date,
    metric?: string
  ): Promise<{
    byMetric: { metric: string; p50: number; p75: number; p90: number; p99: number }[];
    byPage: { page: string; metric: string; avg: number }[];
  }> {
    const conditions = [
      gte(performanceMetrics.createdAt, startDate),
      lte(performanceMetrics.createdAt, endDate),
    ];
    if (metric) {
      conditions.push(eq(performanceMetrics.metric, metric));
    }

    const byMetric = await this.db
      .select({
        metric: performanceMetrics.metric,
        p50: sql<number>`percentile_cont(0.5) within group (order by ${performanceMetrics.value})`,
        p75: sql<number>`percentile_cont(0.75) within group (order by ${performanceMetrics.value})`,
        p90: sql<number>`percentile_cont(0.9) within group (order by ${performanceMetrics.value})`,
        p99: sql<number>`percentile_cont(0.99) within group (order by ${performanceMetrics.value})`,
      })
      .from(performanceMetrics)
      .where(and(...conditions))
      .groupBy(performanceMetrics.metric);

    const byPage = await this.db
      .select({
        page: performanceMetrics.page,
        metric: performanceMetrics.metric,
        avg: sql<number>`avg(${performanceMetrics.value})`,
      })
      .from(performanceMetrics)
      .where(and(...conditions))
      .groupBy(performanceMetrics.page, performanceMetrics.metric)
      .orderBy(performanceMetrics.page);

    return { byMetric, byPage };
  }

  // -------------------------------------------------------------------------
  // Error Logs
  // -------------------------------------------------------------------------
  async logError(error: ErrorLog): Promise<void> {
    await this.db.insert(errorLogs).values({
      level: error.level,
      message: error.message,
      stack: error.stack,
      page: error.page,
      sessionId: error.sessionId,
      userAgent: error.userAgent,
      metadata: error.metadata ? JSON.stringify(error.metadata) : undefined,
    });
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
    const conditions = [gte(errorLogs.createdAt, startDate), lte(errorLogs.createdAt, endDate)];
    if (level) {
      conditions.push(eq(errorLogs.level, level));
    }

    const [totalResult] = await this.db
      .select({ count: count() })
      .from(errorLogs)
      .where(and(...conditions));

    const byLevel = await this.db
      .select({
        level: errorLogs.level,
        count: count(),
      })
      .from(errorLogs)
      .where(and(...conditions))
      .groupBy(errorLogs.level);

    const byPage = await this.db
      .select({
        page: errorLogs.page,
        count: count(),
      })
      .from(errorLogs)
      .where(and(...conditions))
      .groupBy(errorLogs.page)
      .orderBy(desc(count()));

    // Cast nullable page to string
    const byPageTyped = byPage.map((row) => ({
      page: row.page || 'unknown',
      count: row.count,
    }));

    const recent = await this.db
      .select({
        message: errorLogs.message,
        count: count(),
        lastSeen: sql<Date>`max(${errorLogs.createdAt})`,
      })
      .from(errorLogs)
      .where(and(...conditions))
      .groupBy(errorLogs.message)
      .orderBy(desc(count()))
      .limit(10);

    return {
      total: totalResult?.count ?? 0,
      byLevel,
      byPage: byPageTyped,
      recent,
    };
  }

  // -------------------------------------------------------------------------
  // Search Events
  // -------------------------------------------------------------------------
  async trackSearch(event: SearchEvent): Promise<void> {
    await this.db.insert(searchEvents).values({
      query: event.query,
      results: event.results,
      selectedSlug: event.selectedSlug,
      sessionId: event.sessionId,
    });
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
    const conditions = [
      gte(searchEvents.createdAt, startDate),
      lte(searchEvents.createdAt, endDate),
    ];

    const [totalResult] = await this.db
      .select({ count: count() })
      .from(searchEvents)
      .where(and(...conditions));

    const noResults = await this.db
      .select({
        query: searchEvents.query,
        count: count(),
      })
      .from(searchEvents)
      .where(and(...conditions, eq(searchEvents.results, 0)))
      .groupBy(searchEvents.query)
      .orderBy(desc(count()))
      .limit(10);

    const popular = await this.db
      .select({
        query: searchEvents.query,
        count: count(),
      })
      .from(searchEvents)
      .where(and(...conditions))
      .groupBy(searchEvents.query)
      .orderBy(desc(count()))
      .limit(10);

    const [withSelectionResult] = await this.db
      .select({ count: count() })
      .from(searchEvents)
      .where(and(...conditions, sql`${searchEvents.selectedSlug} is not null`));

    return {
      total: totalResult?.count ?? 0,
      noResults,
      popular,
      withSelection: withSelectionResult?.count ?? 0,
    };
  }

  // -------------------------------------------------------------------------
  // API Latency
  // -------------------------------------------------------------------------
  async trackApiLatency(event: ApiLatencyEvent): Promise<void> {
    await this.db.insert(apiLatency).values({
      endpoint: event.endpoint,
      method: event.method,
      statusCode: event.statusCode,
      latencyMs: event.latencyMs,
      sessionId: event.sessionId,
    });
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
    const conditions = [gte(apiLatency.createdAt, startDate), lte(apiLatency.createdAt, endDate)];

    const byEndpoint = await this.db
      .select({
        endpoint: apiLatency.endpoint,
        method: apiLatency.method,
        p50: sql<number>`percentile_cont(0.5) within group (order by ${apiLatency.latencyMs})`,
        p95: sql<number>`percentile_cont(0.95) within group (order by ${apiLatency.latencyMs})`,
        p99: sql<number>`percentile_cont(0.99) within group (order by ${apiLatency.latencyMs})`,
        count: count(),
      })
      .from(apiLatency)
      .where(and(...conditions))
      .groupBy(apiLatency.endpoint, apiLatency.method)
      .orderBy(desc(count()));

    const [totalResult] = await this.db
      .select({ count: count() })
      .from(apiLatency)
      .where(and(...conditions));

    const [errorResult] = await this.db
      .select({ count: count() })
      .from(apiLatency)
      .where(and(...conditions, sql`${apiLatency.statusCode} >= 400`));

    const total = totalResult?.count ?? 0;
    const errors = errorResult?.count ?? 0;

    return {
      byEndpoint,
      errorRate: total > 0 ? errors / total : 0,
    };
  }

  // -------------------------------------------------------------------------
  // Scroll Depth
  // -------------------------------------------------------------------------
  async trackScrollDepth(event: ScrollDepthEvent): Promise<void> {
    await this.db.insert(scrollDepth).values({
      page: event.page,
      sessionId: event.sessionId,
      maxDepth: event.maxDepth,
      timeOnPage: event.timeOnPage,
    });
  }

  async getScrollDepthStats(
    startDate: Date,
    endDate: Date,
    page?: string
  ): Promise<{
    byPage: { page: string; avgDepth: number; avgTime: number; count: number }[];
  }> {
    const conditions = [gte(scrollDepth.createdAt, startDate), lte(scrollDepth.createdAt, endDate)];
    if (page) {
      conditions.push(eq(scrollDepth.page, page));
    }

    const byPage = await this.db
      .select({
        page: scrollDepth.page,
        avgDepth: sql<number>`avg(${scrollDepth.maxDepth})`,
        avgTime: sql<number>`avg(${scrollDepth.timeOnPage})`,
        count: count(),
      })
      .from(scrollDepth)
      .where(and(...conditions))
      .groupBy(scrollDepth.page)
      .orderBy(desc(count()));

    return { byPage };
  }
}

export function createAnalyticsRepository(db: Database): AnalyticsRepository {
  return new AnalyticsRepository(db);
}
