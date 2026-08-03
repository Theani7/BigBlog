// Analytics bootstrap: queues events client-side and flushes them in ONE
// POST per endpoint (previously one fetch per event). Re-runs on every
// astro:page-load so view transitions are counted too.

const CONFIG = {
  trackEndpoint: '/api/analytics/track',
  performanceEndpoint: '/api/analytics/performance',
  errorEndpoint: '/api/analytics/errors',
  batchInterval: 5000,
  maxBatchSize: 10,
};

type QueuedEvent = {
  endpoint: string;
  body: Record<string, unknown>;
};

function isTrackingAllowed(): boolean {
  if (navigator.doNotTrack === '1' || (window as { doNotTrack?: string }).doNotTrack === '1')
    return false;
  try {
    if (localStorage.getItem('analytics-opt-out') === 'true') return false;
  } catch {
    /* storage unavailable */
  }
  return true;
}

function getSessionId(): string {
  const meta = document.querySelector<HTMLMetaElement>('meta[name="bb-session"]');
  return meta?.content || '';
}

const eventQueue: QueuedEvent[] = [];
let batchTimer: number | undefined;

async function flushEvents(): Promise<void> {
  if (eventQueue.length === 0) return;
  const events = eventQueue.splice(0, eventQueue.length);

  // Group by endpoint so a full flush is at most 3 requests, not N.
  const groups = new Map<string, QueuedEvent[]>();
  for (const ev of events) {
    const list = groups.get(ev.endpoint) || [];
    list.push(ev);
    groups.set(ev.endpoint, list);
  }

  const sends: Promise<Response>[] = [];
  for (const [endpoint, batch] of groups) {
    sends.push(
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: batch.map((b) => b.body) }),
        keepalive: true,
      }).catch(() => new Response())
    );
  }
  await Promise.all(sends);
}

function queueEvent(endpoint: string, body: Record<string, unknown>): void {
  if (!isTrackingAllowed()) return;
  eventQueue.push({ endpoint, body });
  if (eventQueue.length >= CONFIG.maxBatchSize) {
    void flushEvents();
    return;
  }
  if (batchTimer === undefined) {
    batchTimer = window.setTimeout(() => {
      batchTimer = undefined;
      void flushEvents();
    }, CONFIG.batchInterval);
  }
}

function trackEvent(event: string, metadata?: Record<string, unknown>): void {
  const sessionId = getSessionId();
  queueEvent(CONFIG.trackEndpoint, {
    event,
    page: window.location.pathname,
    referrer: document.referrer || undefined,
    ...(sessionId ? { sessionId } : {}),
    ...(metadata ? { metadata } : {}),
  });
}

function trackPerformance(metric: string, value: number): void {
  const sessionId = getSessionId();
  queueEvent(CONFIG.performanceEndpoint, {
    metric,
    value,
    page: window.location.pathname,
    ...(sessionId ? { sessionId } : {}),
  });
}

function trackError(message: string, stack?: string, metadata?: Record<string, unknown>): void {
  const sessionId = getSessionId();
  queueEvent(CONFIG.errorEndpoint, {
    level: 'error',
    message,
    ...(stack ? { stack } : {}),
    page: window.location.pathname,
    ...(sessionId ? { sessionId } : {}),
    ...(metadata ? { metadata } : {}),
  });
}

function observeLCP(): void {
  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      if (lastEntry) trackPerformance('LCP', lastEntry.startTime);
    });
    observer.observe({ type: 'largest-contentful-paint', buffered: true });
  } catch {
    /* unsupported */
  }
}

function observeCLS(): void {
  try {
    let clsValue = 0;
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const shift = entry as unknown as { hadRecentInput?: boolean; value?: number };
        if (!shift.hadRecentInput) clsValue += shift.value ?? 0;
      }
    });
    observer.observe({ type: 'layout-shift', buffered: true });
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') trackPerformance('CLS', clsValue);
    });
  } catch {
    /* unsupported */
  }
}

function observeINP(): void {
  try {
    let maxINP = 0;
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > maxINP) maxINP = entry.duration;
      }
    });
    observer.observe({ type: 'event', buffered: true });
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') trackPerformance('INP', maxINP);
    });
  } catch {
    /* unsupported */
  }
}

function observeTTFB(): void {
  try {
    const navigation = performance.getEntriesByType('navigation')[0] as
      PerformanceNavigationTiming | undefined;
    if (navigation) trackPerformance('TTFB', navigation.responseStart - navigation.requestStart);
  } catch {
    /* unsupported */
  }
}

function observeFCP(): void {
  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      if (lastEntry) trackPerformance('FCP', lastEntry.startTime);
    });
    observer.observe({ type: 'paint', buffered: true });
  } catch {
    /* unsupported */
  }
}

function initScrollTracking(): void {
  if (!isTrackingAllowed()) return;
  const article = document.querySelector('article');
  if (!article) return;

  let maxScrollDepth = 0;
  const updateScrollDepth = () => {
    const rect = article.getBoundingClientRect();
    const articleHeight = article.offsetHeight;
    const viewportHeight = window.innerHeight;
    const scrolled = Math.max(0, -rect.top);
    const depth = Math.min(1, scrolled / Math.max(1, articleHeight - viewportHeight));
    if (depth > maxScrollDepth) maxScrollDepth = depth;
  };
  let scrollTimeout: number | undefined;
  window.addEventListener(
    'scroll',
    () => {
      window.clearTimeout(scrollTimeout);
      scrollTimeout = window.setTimeout(updateScrollDepth, 100);
    },
    { passive: true }
  );
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && maxScrollDepth > 0) {
      trackEvent('scroll_depth', { depth: maxScrollDepth });
    }
  });
}

function initErrorHandling(): void {
  window.addEventListener('error', (event) => {
    trackError(event.message, event.error?.stack, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });
  window.addEventListener('unhandledrejection', (event) => {
    trackError('Unhandled Promise Rejection: ' + String(event.reason), undefined, {
      type: 'unhandledrejection',
    });
  });
}

let observersInitialized = false;

function init(): void {
  if (!isTrackingAllowed()) return;
  if (!observersInitialized) {
    observersInitialized = true;
    observeLCP();
    observeCLS();
    observeINP();
    observeTTFB();
    observeFCP();
    initScrollTracking();
    initErrorHandling();
    window.addEventListener('beforeunload', () => void flushEvents());
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') void flushEvents();
    });
  }
  trackEvent('page_view');
}

// ClientRouter fires astro:page-load on initial load AND every view
// transition, so page views are counted per navigation.
document.addEventListener('astro:page-load', () => init());
