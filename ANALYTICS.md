# Analytics Guide

## Overview

BigBlog's analytics system provides privacy-first insights into user behavior, content performance, and site health.

## Getting Started

### Client-Side Analytics

The analytics script is automatically loaded in the Layout component. It tracks:

- Page views
- Core Web Vitals (LCP, CLS, INP, TTFB, FCP)
- Scroll depth
- Errors
- Search queries

### API Endpoints

| Endpoint                     | Method | Purpose                   |
| ---------------------------- | ------ | ------------------------- |
| `/api/analytics/track`       | POST   | Track custom events       |
| `/api/analytics/performance` | POST   | Track performance metrics |
| `/api/analytics/errors`      | POST   | Report errors             |
| `/api/analytics/search`      | POST   | Track search queries      |
| `/api/analytics/scroll`      | POST   | Track scroll depth        |
| `/api/analytics/dashboard`   | GET    | Get dashboard data        |
| `/api/analytics/alerts`      | GET    | Check alert status        |

## Tracking Events

### Basic Event Tracking

```javascript
// Track a page view
trackEvent('page_view');

// Track with metadata
trackEvent('newsletter_signup', { source: 'footer' });

// Track engagement
trackEngagement('like', 'my-article-slug');
```

### Performance Metrics

Performance metrics are automatically tracked. To manually report:

```javascript
trackPerformance('LCP', 2500); // LCP in milliseconds
trackPerformance('CLS', 0.05); // CLS score
```

### Error Reporting

Errors are automatically caught. To manually report:

```javascript
trackError({
  level: 'error',
  message: 'Something went wrong',
  stack: error.stack,
  metadata: { component: 'NewsletterForm' },
});
```

### Search Analytics

Search queries are tracked via the Command Palette. To manually track:

```javascript
trackSearch('query', 5, 'selected-slug');
// query: search term
// results: number of results
// selectedSlug: slug of selected result (optional)
```

## Privacy Settings

### Do Not Track

The analytics system respects the Do Not Track browser setting. If DNT is enabled, no data is collected.

### Opt-out

Users can opt out by setting:

```javascript
localStorage.setItem('analytics-opt-out', 'true');
```

To opt back in:

```javascript
localStorage.removeItem('analytics-opt-out');
```

### Data Collected

| Data Type           | Purpose                 | Storage             |
| ------------------- | ----------------------- | ------------------- |
| Page URL            | Content analytics       | D1                  |
| Referrer            | Traffic sources         | D1                  |
| User Agent          | Device/browser stats    | D1                  |
| IP Hash             | Geographic analytics    | D1 (hashed)         |
| Session ID          | Unique visitor counting | D1 + sessionStorage |
| Performance metrics | Core Web Vitals         | D1                  |
| Errors              | Bug tracking            | D1                  |
| Search queries      | Search optimization     | D1                  |

## Dashboard

Access the analytics dashboard at `/dashboard`.

### Dashboard Pages

| Page        | Description                          |
| ----------- | ------------------------------------ |
| Overview    | Key metrics at a glance              |
| Traffic     | Page views, visitors, referrers      |
| Performance | Core Web Vitals, API latency         |
| Errors      | Error tracking and trends            |
| Content     | Content performance                  |
| Search      | Search analytics and recommendations |

### Dashboard Security

- Dashboards are `noindex` to prevent search engine indexing
- Consider adding authentication for production use
- Dashboards are client-side rendered with API data

## API Reference

### POST /api/analytics/track

Track a custom event.

**Request Body:**

```json
{
  "event": "page_view",
  "page": "/blog/my-post",
  "referrer": "https://google.com",
  "metadata": {}
}
```

**Response:**

```json
{
  "success": true
}
```

### POST /api/analytics/performance

Track a performance metric.

**Request Body:**

```json
{
  "metric": "LCP",
  "value": 2500,
  "page": "/blog/my-post",
  "connection": "4g"
}
```

### POST /api/analytics/errors

Report an error.

**Request Body:**

```json
{
  "level": "error",
  "message": "Failed to load resource",
  "stack": "Error: ...",
  "page": "/blog/my-post",
  "metadata": {}
}
```

### GET /api/analytics/dashboard

Get dashboard data.

**Query Parameters:**

- `days`: Number of days to look back (default: 7)

**Response:**

```json
{
  "period": { "days": 7, "start": "...", "end": "..." },
  "traffic": { "totalViews": 1000, "uniqueVisitors": 500, ... },
  "performance": { "coreWebVitals": [...], "byPage": [...] },
  "errors": { "total": 10, "byLevel": [...], "recent": [...] },
  "search": { "totalQueries": 100, "popularQueries": [...], ... },
  "engagement": { "scrollDepth": [...] },
  "api": { "latencyByEndpoint": [...], "errorRate": 0.01 }
}
```

## Data Retention

Analytics data is retained for 90 days by default. To adjust:

1. Update the `RETENTION_DAYS` constant in the analytics repository
2. Create a cleanup job to delete old data
3. Consider archiving important data before deletion

## Troubleshooting

### No Data Appearing

1. Check browser console for errors
2. Verify API endpoints are accessible
3. Check if analytics is disabled via opt-out
4. Ensure D1 database is properly configured

### Performance Impact

The analytics script is designed to be lightweight:

- <5KB gzipped
- Non-blocking initialization
- Batched event sending (5s intervals, max 10 events per batch)
- No impact on Core Web Vitals

### Privacy Concerns

Review the data collected in the Privacy Settings section. All data is anonymized and no cookies are used.
