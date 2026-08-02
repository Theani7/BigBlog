import mongoose, { Schema } from 'mongoose';

// =============================================================================
// ANALYTICS EVENTS
// Privacy-first event tracking for page views, engagement, and performance
// =============================================================================
const analyticsEventsSchema = new Schema({
  event: { type: String, required: true },
  sessionId: { type: String },
  page: { type: String, required: true },
  referrer: { type: String },
  userAgent: { type: String },
  ipHash: { type: String },
  country: { type: String },
  device: { type: String },
  browser: { type: String },
  os: { type: String },
  language: { type: String },
  metadata: { type: String },
  createdAt: { type: Date, default: Date.now },
});

analyticsEventsSchema.index({ event: 1 });
analyticsEventsSchema.index({ page: 1 });
analyticsEventsSchema.index({ sessionId: 1 });
analyticsEventsSchema.index({ createdAt: 1 });
analyticsEventsSchema.index({ event: 1, page: 1 });
analyticsEventsSchema.index({ event: 1, createdAt: 1 });

export const analyticsEvents =
  mongoose.models.AnalyticsEvent || mongoose.model<any>('AnalyticsEvent', analyticsEventsSchema);

// =============================================================================
// PAGE VIEWS
// Deduplicated page view tracking
// =============================================================================
const pageViewsSchema = new Schema({
  page: { type: String, required: true },
  sessionId: { type: String, required: true },
  referrer: { type: String },
  country: { type: String },
  device: { type: String },
  browser: { type: String },
  createdAt: { type: Date, default: Date.now },
});

pageViewsSchema.index({ page: 1 });
pageViewsSchema.index({ sessionId: 1 });
pageViewsSchema.index({ createdAt: 1 });
pageViewsSchema.index({ page: 1, createdAt: 1 });

export const pageViews =
  mongoose.models.PageView || mongoose.model<any>('PageView', pageViewsSchema);

// =============================================================================
// PERFORMANCE METRICS
// Core Web Vitals and custom performance metrics
// =============================================================================
const performanceMetricsSchema = new Schema({
  metric: { type: String, required: true },
  value: { type: Number, required: true },
  sessionId: { type: String },
  page: { type: String, required: true },
  userAgent: { type: String },
  connection: { type: String },
  device: { type: String },
  createdAt: { type: Date, default: Date.now },
});

performanceMetricsSchema.index({ metric: 1 });
performanceMetricsSchema.index({ page: 1 });
performanceMetricsSchema.index({ createdAt: 1 });
performanceMetricsSchema.index({ metric: 1, createdAt: 1 });

export const performanceMetrics =
  mongoose.models.PerformanceMetric ||
  mongoose.model<any>('PerformanceMetric', performanceMetricsSchema);

// =============================================================================
// ERROR LOGS
// Client and server error tracking
// =============================================================================
const errorLogsSchema = new Schema({
  level: { type: String, enum: ['error', 'warning', 'info'], required: true, default: 'error' },
  message: { type: String, required: true },
  stack: { type: String },
  page: { type: String },
  sessionId: { type: String },
  userAgent: { type: String },
  metadata: { type: String },
  resolved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

errorLogsSchema.index({ level: 1 });
errorLogsSchema.index({ page: 1 });
errorLogsSchema.index({ createdAt: 1 });
errorLogsSchema.index({ resolved: 1 });

export const errorLogs =
  mongoose.models.ErrorLog || mongoose.model<any>('ErrorLog', errorLogsSchema);

// =============================================================================
// SEARCH EVENTS
// Track search queries and results
// =============================================================================
const searchEventsSchema = new Schema({
  query: { type: String, required: true },
  results: { type: Number, required: true },
  selectedSlug: { type: String },
  sessionId: { type: String },
  createdAt: { type: Date, default: Date.now },
});

searchEventsSchema.index({ query: 1 });
searchEventsSchema.index({ createdAt: 1 });

export const searchEvents =
  mongoose.models.SearchEvent || mongoose.model<any>('SearchEvent', searchEventsSchema);

// =============================================================================
// API LATENCY
// Track API endpoint performance
// =============================================================================
const apiLatencySchema = new Schema({
  endpoint: { type: String, required: true },
  method: { type: String, required: true },
  statusCode: { type: Number, required: true },
  latencyMs: { type: Number, required: true },
  sessionId: { type: String },
  createdAt: { type: Date, default: Date.now },
});

apiLatencySchema.index({ endpoint: 1 });
apiLatencySchema.index({ createdAt: 1 });
apiLatencySchema.index({ statusCode: 1 });

export const apiLatency =
  mongoose.models.ApiLatency || mongoose.model<any>('ApiLatency', apiLatencySchema);

// =============================================================================
// SCROLL DEPTH
// Track how far users scroll on articles
// =============================================================================
const scrollDepthSchema = new Schema({
  page: { type: String, required: true },
  sessionId: { type: String, required: true },
  maxDepth: { type: Number, required: true },
  timeOnPage: { type: Number },
  createdAt: { type: Date, default: Date.now },
});

scrollDepthSchema.index({ page: 1 });
scrollDepthSchema.index({ sessionId: 1 });
scrollDepthSchema.index({ createdAt: 1 });

export const scrollDepth =
  mongoose.models.ScrollDepth || mongoose.model<any>('ScrollDepth', scrollDepthSchema);
