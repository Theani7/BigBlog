/**
 * Privacy-First Analytics
 *
 * Features:
 * - Respects Do Not Track
 * - Cookie-free (uses sessionStorage for session ID)
 * - Anonymizes IP addresses server-side
 * - No cross-site tracking
 * - Minimal data collection
 */

// =============================================================================
// TYPES
// =============================================================================
interface AnalyticsEvent {
  event: string;
  page: string;
  referrer?: string | undefined;
  metadata?: Record<string, unknown> | undefined;
}

interface ErrorReport {
  level: 'error' | 'warning' | 'info';
  message: string;
  stack?: string | undefined;
  page?: string | undefined;
  metadata?: Record<string, unknown> | undefined;
}

// =============================================================================
// CONFIGURATION
// =============================================================================
const CONFIG = {
  endpoint: '/api/analytics/track',
  performanceEndpoint: '/api/analytics/performance',
  errorEndpoint: '/api/analytics/errors',
  batchInterval: 5000, // 5 seconds
  maxBatchSize: 10,
  enabled: true,
};

// =============================================================================
// PRIVACY CHECK
// =============================================================================
function isTrackingAllowed(): boolean {
  // Respect Do Not Track
  if (navigator.doNotTrack === '1') {
    return false;
  }

  // Check if tracking is disabled
  if (!CONFIG.enabled) {
    return false;
  }

  // Allow opt-out via localStorage
  if (localStorage.getItem('analytics-opt-out') === 'true') {
    return false;
  }

  return true;
}

// =============================================================================
// EVENT QUEUE
// =============================================================================
const eventQueue: AnalyticsEvent[] = [];
let batchTimer: ReturnType<typeof setTimeout> | null = null;

async function flushEvents(): Promise<void> {
  if (eventQueue.length === 0) return;

  const events = [...eventQueue];
  eventQueue.length = 0;

  try {
    await Promise.all(
      events.map((event) =>
        fetch(CONFIG.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(event),
          keepalive: true,
        })
      )
    );
  } catch {
    // Silently fail - analytics should never break the app
  }
}

function queueEvent(event: AnalyticsEvent): void {
  if (!isTrackingAllowed()) return;

  eventQueue.push(event);

  if (eventQueue.length >= CONFIG.maxBatchSize) {
    flushEvents();
    return;
  }

  if (!batchTimer) {
    batchTimer = setTimeout(() => {
      flushEvents();
      batchTimer = null;
    }, CONFIG.batchInterval);
  }
}

// =============================================================================
// PUBLIC API
// =============================================================================
export function trackEvent(event: string, metadata?: Record<string, unknown>): void {
  queueEvent({
    event,
    page: window.location.pathname,
    referrer: document.referrer || undefined,
    metadata,
  });
}

export function trackPageView(): void {
  trackEvent('page_view');
}

export function trackScroll(depth: number): void {
  trackEvent('scroll_depth', { depth });
}

export function trackSearch(query: string, results: number, selectedSlug?: string): void {
  trackEvent('search', { query, results, selectedSlug });
}

export function trackEngagement(action: string, target: string): void {
  trackEvent('engagement', { action, target });
}

// =============================================================================
// PERFORMANCE MONITORING
// =============================================================================
export function trackPerformance(metric: string, value: number): void {
  if (!isTrackingAllowed()) return;

  fetch(CONFIG.performanceEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      metric,
      value,
      page: window.location.pathname,
    }),
    keepalive: true,
  }).catch(() => {
    // Silently fail
  });
}

// =============================================================================
// ERROR MONITORING
// =============================================================================
export function trackError(error: ErrorReport): void {
  if (!isTrackingAllowed()) return;

  fetch(CONFIG.errorEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...error,
      page: error.page || window.location.pathname,
    }),
    keepalive: true,
  }).catch(() => {
    // Silently fail
  });
}

// =============================================================================
// CORE WEB VITALS
// =============================================================================
function observeLCP(): void {
  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      if (lastEntry) {
        trackPerformance('LCP', lastEntry.startTime);
      }
    });
    observer.observe({ type: 'largest-contentful-paint', buffered: true });
  } catch {
    // Not supported
  }
}

function observeCLS(): void {
  try {
    let clsValue = 0;
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      }
    });
    observer.observe({ type: 'layout-shift', buffered: true });

    // Report CLS on page hide
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        trackPerformance('CLS', clsValue);
      }
    });
  } catch {
    // Not supported
  }
}

function observeINP(): void {
  try {
    let maxINP = 0;
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const inp = (entry as any).duration;
        if (inp > maxINP) {
          maxINP = inp;
        }
      }
    });
    observer.observe({ type: 'event', buffered: true });

    // Report INP on page hide
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        trackPerformance('INP', maxINP);
      }
    });
  } catch {
    // Not supported
  }
}

function observeTTFB(): void {
  try {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      trackPerformance('TTFB', navigation.responseStart - navigation.requestStart);
    }
  } catch {
    // Not supported
  }
}

function observeFCP(): void {
  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      if (lastEntry) {
        trackPerformance('FCP', lastEntry.startTime);
      }
    });
    observer.observe({ type: 'paint', buffered: true });
  } catch {
    // Not supported
  }
}

// =============================================================================
// SCROLL DEPTH TRACKING
// =============================================================================
let maxScrollDepth = 0;
let scrollTrackingEnabled = false;

function initScrollTracking(): void {
  if (scrollTrackingEnabled || !isTrackingAllowed()) return;
  scrollTrackingEnabled = true;

  const article = document.querySelector('article');
  if (!article) return;

  const updateScrollDepth = () => {
    const rect = article.getBoundingClientRect();
    const articleHeight = article.offsetHeight;
    const viewportHeight = window.innerHeight;

    const scrolled = Math.max(0, -rect.top);
    const depth = Math.min(1, scrolled / (articleHeight - viewportHeight));

    if (depth > maxScrollDepth) {
      maxScrollDepth = depth;
    }
  };

  let scrollTimeout: ReturnType<typeof setTimeout>;
  window.addEventListener(
    'scroll',
    () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(updateScrollDepth, 100);
    },
    { passive: true }
  );

  // Report on page hide
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && maxScrollDepth > 0) {
      trackScroll(maxScrollDepth);
    }
  });
}

// =============================================================================
// ERROR HANDLING
// =============================================================================
function initErrorHandling(): void {
  // Global error handler
  window.addEventListener('error', (event) => {
    trackError({
      level: 'error',
      message: event.message,
      stack: event.error?.stack,
      metadata: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      },
    });
  });

  // Unhandled promise rejection
  window.addEventListener('unhandledrejection', (event) => {
    trackError({
      level: 'error',
      message: `Unhandled Promise Rejection: ${event.reason}`,
      metadata: {
        type: 'unhandledrejection',
      },
    });
  });
}

// =============================================================================
// COMMAND PALETTE TRACKING
// =============================================================================
export function trackCommandPaletteUsage(
  action: 'open' | 'close' | 'select',
  query?: string
): void {
  trackEvent('command_palette', { action, query });
}

// =============================================================================
// INITIALIZATION
// =============================================================================
export function initAnalytics(): void {
  if (!isTrackingAllowed()) return;

  // Track page view
  trackPageView();

  // Initialize Core Web Vitals observers
  observeLCP();
  observeCLS();
  observeINP();
  observeTTFB();
  observeFCP();

  // Initialize scroll tracking
  initScrollTracking();

  // Initialize error handling
  initErrorHandling();

  // Flush events before page unload
  window.addEventListener('beforeunload', () => {
    flushEvents();
  });
}

// Auto-initialize when DOM is ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAnalytics);
  } else {
    initAnalytics();
  }
}
