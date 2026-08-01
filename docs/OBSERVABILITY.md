# Observability Guide

## Overview

BigBlog uses a privacy-first observability platform that collects performance metrics, error tracking, and usage analytics without compromising user privacy.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Side                              │
├─────────────────────────────────────────────────────────────────┤
│  Analytics Script (privacy-first)                               │
│  ├── Page view tracking                                         │
│  ├── Core Web Vitals (LCP, CLS, INP, TTFB, FCP)               │
│  ├── Scroll depth tracking                                      │
│  ├── Error boundary                                             │
│  └── Batched event queue                                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        API Layer                                │
├─────────────────────────────────────────────────────────────────┤
│  /api/analytics/*                                              │
│  ├── POST /track        - Generic event tracking               │
│  ├── POST /performance  - Core Web Vitals                      │
│  ├── POST /errors       - Error reporting                      │
│  ├── POST /search       - Search analytics                     │
│  ├── POST /scroll       - Scroll depth                         │
│  ├── GET  /dashboard    - Dashboard data                       │
│  └── GET  /alerts       - Alert status                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Data Layer                                 │
├─────────────────────────────────────────────────────────────────┤
│  Cloudflare D1 (SQLite)                                        │
│  ├── analytics_events     - Generic event tracking             │
│  ├── page_views           - Deduplicated page views            │
│  ├── performance_metrics  - Core Web Vitals                    │
│  ├── error_logs           - Error tracking                     │
│  ├── search_events        - Search queries                     │
│  ├── api_latency          - API performance                    │
│  └── scroll_depth         - Article engagement                 │
└─────────────────────────────────────────────────────────────────┘
```

## Privacy Principles

1. **Do Not Track**: Respects `navigator.doNotTrack` and `window.doNotTrack`
2. **Cookie-free**: Uses `sessionStorage` for session ID, not cookies
3. **IP Anonymization**: IP addresses are hashed server-side before storage
4. **No Cross-site Tracking**: No third-party cookies or tracking pixels
5. **Opt-out**: Users can opt out via `localStorage.setItem('analytics-opt-out', 'true')`
6. **Minimal Data**: Only collects what's necessary for insights

## Metrics Inventory

### Reader Analytics

| Metric          | Description        | Privacy Impact         |
| --------------- | ------------------ | ---------------------- |
| Page views      | Total page loads   | Low - anonymized       |
| Unique visitors | Unique sessions    | Low - session ID only  |
| Scroll depth    | How far users read | Low - percentage only  |
| Time on page    | Reading duration   | Low - aggregate only   |
| Referrers       | Traffic sources    | Low - no personal data |

### Performance Metrics

| Metric | Description               | Thresholds                 |
| ------ | ------------------------- | -------------------------- |
| LCP    | Largest Contentful Paint  | Good: <2.5s, Poor: >4s     |
| CLS    | Cumulative Layout Shift   | Good: <0.1, Poor: >0.25    |
| INP    | Interaction to Next Paint | Good: <200ms, Poor: >500ms |
| TTFB   | Time to First Byte        | Good: <800ms, Poor: >1.8s  |
| FCP    | First Contentful Paint    | Good: <1.8s, Poor: >3s     |

### Engagement Metrics

| Metric             | Description          |
| ------------------ | -------------------- |
| Bookmarks          | Save for later       |
| Likes              | Article appreciation |
| Comments           | User discussions     |
| Newsletter signups | Subscriber growth    |
| Search queries     | What users look for  |

## Dashboard Access

Dashboards are available at:

- `/dashboard` - Overview
- `/dashboard/traffic` - Traffic analytics
- `/dashboard/performance` - Core Web Vitals
- `/dashboard/errors` - Error monitoring
- `/dashboard/content` - Content performance
- `/dashboard/search` - Search analytics

**Note**: Dashboards are noindex to prevent search engine indexing.

## Data Retention

| Data Type           | Retention Period |
| ------------------- | ---------------- |
| Page views          | 90 days          |
| Performance metrics | 90 days          |
| Error logs          | 90 days          |
| Search events       | 90 days          |
| Scroll depth        | 90 days          |

## Opt-out Mechanism

Users can opt out of analytics by:

1. **Do Not Track**: Enable DNT in browser settings
2. **Local Storage**: Run `localStorage.setItem('analytics-opt-out', 'true')`
3. **Browser Extension**: Use privacy-focused extensions that block tracking

## Troubleshooting

### No Data Appearing

1. Check if analytics is disabled via opt-out
2. Verify API endpoints are accessible
3. Check browser console for errors
4. Ensure D1 database is properly configured

### Performance Impact

The analytics script is designed to be lightweight:

- <5KB gzipped
- Non-blocking initialization
- Batched event sending
- No impact on Core Web Vitals

### Privacy Concerns

If you have privacy concerns:

1. Review what data is collected (see Metrics Inventory)
2. Test opt-out mechanism
3. Verify IP hashing is working
4. Check that no cookies are set
