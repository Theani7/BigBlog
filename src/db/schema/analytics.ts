import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

// =============================================================================
// ANALYTICS EVENTS
// Privacy-first event tracking for page views, engagement, and performance
// =============================================================================
export const analyticsEvents = sqliteTable(
  'analytics_events',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    event: text('event').notNull(),
    sessionId: text('session_id'),
    page: text('page').notNull(),
    referrer: text('referrer'),
    userAgent: text('user_agent'),
    ipHash: text('ip_hash'),
    country: text('country'),
    device: text('device'),
    browser: text('browser'),
    os: text('os'),
    language: text('language'),
    metadata: text('metadata'),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(new Date()),
  },
  (table) => [
    index('idx_analytics_events_event').on(table.event),
    index('idx_analytics_events_page').on(table.page),
    index('idx_analytics_events_session').on(table.sessionId),
    index('idx_analytics_events_created_at').on(table.createdAt),
    index('idx_analytics_events_event_page').on(table.event, table.page),
    index('idx_analytics_events_event_created').on(table.event, table.createdAt),
  ]
);

// =============================================================================
// PAGE VIEWS
// Deduplicated page view tracking
// =============================================================================
export const pageViews = sqliteTable(
  'page_views',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    page: text('page').notNull(),
    sessionId: text('session_id').notNull(),
    referrer: text('referrer'),
    country: text('country'),
    device: text('device'),
    browser: text('browser'),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(new Date()),
  },
  (table) => [
    index('idx_page_views_page').on(table.page),
    index('idx_page_views_session').on(table.sessionId),
    index('idx_page_views_created_at').on(table.createdAt),
    index('idx_page_views_page_created').on(table.page, table.createdAt),
  ]
);

// =============================================================================
// PERFORMANCE METRICS
// Core Web Vitals and custom performance metrics
// =============================================================================
export const performanceMetrics = sqliteTable(
  'performance_metrics',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    metric: text('metric').notNull(),
    value: real('value').notNull(),
    sessionId: text('session_id'),
    page: text('page').notNull(),
    userAgent: text('user_agent'),
    connection: text('connection'),
    device: text('device'),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(new Date()),
  },
  (table) => [
    index('idx_performance_metrics_metric').on(table.metric),
    index('idx_performance_metrics_page').on(table.page),
    index('idx_performance_metrics_created_at').on(table.createdAt),
    index('idx_performance_metrics_metric_created').on(table.metric, table.createdAt),
  ]
);

// =============================================================================
// ERROR LOGS
// Client and server error tracking
// =============================================================================
export const errorLogs = sqliteTable(
  'error_logs',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    level: text('level', { enum: ['error', 'warning', 'info'] })
      .notNull()
      .default('error'),
    message: text('message').notNull(),
    stack: text('stack'),
    page: text('page'),
    sessionId: text('session_id'),
    userAgent: text('user_agent'),
    metadata: text('metadata'),
    resolved: integer('resolved', { mode: 'boolean' }).default(false),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(new Date()),
  },
  (table) => [
    index('idx_error_logs_level').on(table.level),
    index('idx_error_logs_page').on(table.page),
    index('idx_error_logs_created_at').on(table.createdAt),
    index('idx_error_logs_resolved').on(table.resolved),
  ]
);

// =============================================================================
// SEARCH EVENTS
// Track search queries and results
// =============================================================================
export const searchEvents = sqliteTable(
  'search_events',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    query: text('query').notNull(),
    results: integer('results').notNull(),
    selectedSlug: text('selected_slug'),
    sessionId: text('session_id'),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(new Date()),
  },
  (table) => [
    index('idx_search_events_query').on(table.query),
    index('idx_search_events_created_at').on(table.createdAt),
  ]
);

// =============================================================================
// API LATENCY
// Track API endpoint performance
// =============================================================================
export const apiLatency = sqliteTable(
  'api_latency',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    endpoint: text('endpoint').notNull(),
    method: text('method').notNull(),
    statusCode: integer('status_code').notNull(),
    latencyMs: integer('latency_ms').notNull(),
    sessionId: text('session_id'),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(new Date()),
  },
  (table) => [
    index('idx_api_latency_endpoint').on(table.endpoint),
    index('idx_api_latency_created_at').on(table.createdAt),
    index('idx_api_latency_status').on(table.statusCode),
  ]
);

// =============================================================================
// SCROLL DEPTH
// Track how far users scroll on articles
// =============================================================================
export const scrollDepth = sqliteTable(
  'scroll_depth',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    page: text('page').notNull(),
    sessionId: text('session_id').notNull(),
    maxDepth: real('max_depth').notNull(),
    timeOnPage: integer('time_on_page'),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(new Date()),
  },
  (table) => [
    index('idx_scroll_depth_page').on(table.page),
    index('idx_scroll_depth_session').on(table.sessionId),
    index('idx_scroll_depth_created_at').on(table.createdAt),
  ]
);

// =============================================================================
// RELATIONS
// =============================================================================
export const analyticsEventsRelations = relations(analyticsEvents, ({ one }) => ({
  session: one(analyticsEvents, {
    fields: [analyticsEvents.sessionId],
    references: [analyticsEvents.sessionId],
    relationName: 'analyticsSession',
  }),
}));
