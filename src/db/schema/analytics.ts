import mongoose, { Schema, Document, Model } from 'mongoose';

// =============================================================================
// ANALYTICS EVENTS
// Privacy-first event tracking for page views, engagement, and performance
// =============================================================================
export interface IAnalyticsEvent extends Document {
  event: string;
  sessionId: string;
  page: string;
  referrer: string;
  userAgent: string;
  ipHash: string;
  country: string;
  device: string;
  browser: string;
  os: string;
  language: string;
  metadata: string;
  createdAt: Date;
}

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
  (mongoose.models.AnalyticsEvent as Model<IAnalyticsEvent>) ||
  mongoose.model<IAnalyticsEvent>('AnalyticsEvent', analyticsEventsSchema);

// =============================================================================
// PAGE VIEWS
// Deduplicated page view tracking
// =============================================================================
export interface IPageView extends Document {
  page: string;
  sessionId: string;
  referrer: string;
  country: string;
  device: string;
  browser: string;
  createdAt: Date;
}

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
  (mongoose.models.PageView as Model<IPageView>) ||
  mongoose.model<IPageView>('PageView', pageViewsSchema);

// =============================================================================
// PERFORMANCE METRICS
// Core Web Vitals and custom performance metrics
// =============================================================================
export interface IPerformanceMetric extends Document {
  metric: string;
  value: number;
  sessionId: string;
  page: string;
  userAgent: string;
  connection: string;
  device: string;
  createdAt: Date;
}

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
  (mongoose.models.PerformanceMetric as Model<IPerformanceMetric>) ||
  mongoose.model<IPerformanceMetric>('PerformanceMetric', performanceMetricsSchema);

// =============================================================================
// ERROR LOGS
// Client and server error tracking
// =============================================================================
export interface IErrorLog extends Document {
  level: string;
  message: string;
  stack: string;
  page: string;
  sessionId: string;
  userAgent: string;
  metadata: string;
  resolved: boolean;
  createdAt: Date;
}

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
  (mongoose.models.ErrorLog as Model<IErrorLog>) ||
  mongoose.model<IErrorLog>('ErrorLog', errorLogsSchema);

// =============================================================================
// SEARCH EVENTS
// Track search queries and results
// =============================================================================
export interface ISearchEvent extends Document {
  query: string;
  results: number;
  selectedSlug: string;
  sessionId: string;
  createdAt: Date;
}

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
  (mongoose.models.SearchEvent as Model<ISearchEvent>) ||
  mongoose.model<ISearchEvent>('SearchEvent', searchEventsSchema);

// =============================================================================
// API LATENCY
// Track API endpoint performance
// =============================================================================
export interface IApiLatency extends Document {
  endpoint: string;
  method: string;
  statusCode: number;
  latencyMs: number;
  sessionId: string;
  createdAt: Date;
}

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
  (mongoose.models.ApiLatency as Model<IApiLatency>) ||
  mongoose.model<IApiLatency>('ApiLatency', apiLatencySchema);

// =============================================================================
// SCROLL DEPTH
// Track how far users scroll on articles
// =============================================================================
export interface IScrollDepth extends Document {
  page: string;
  sessionId: string;
  maxDepth: number;
  timeOnPage: number;
  createdAt: Date;
}

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
  (mongoose.models.ScrollDepth as Model<IScrollDepth>) ||
  mongoose.model<IScrollDepth>('ScrollDepth', scrollDepthSchema);
