# Monitoring Guide

## Overview

BigBlog uses a multi-layered monitoring approach to ensure site reliability, performance, and user experience.

## Monitoring Stack

### 1. Client-Side Monitoring

**Core Web Vitals:**

- LCP (Largest Contentful Paint)
- CLS (Cumulative Layout Shift)
- INP (Interaction to Next Paint)
- TTFB (Time to First Byte)
- FCP (First Contentful Paint)

**Error Tracking:**

- Unhandled exceptions
- Unhandled promise rejections
- Resource loading errors

**User Engagement:**

- Page views
- Scroll depth
- Time on page

### 2. Server-Side Monitoring

**API Performance:**

- Request latency (p50, p95, p99)
- Error rates
- Throughput

**Database Performance:**

- Query latency
- Connection pool usage
- Storage usage

### 3. Infrastructure Monitoring

**Vercel:**

- Build status
- Deployment status
- Edge function performance

**Cloudflare D1:**

- Database availability
- Query performance
- Storage limits

## Alert Rules

### Critical Alerts

| Alert              | Condition       | Window | Action                   |
| ------------------ | --------------- | ------ | ------------------------ |
| High Error Rate    | API errors > 5% | 5 min  | Immediate investigation  |
| Client Error Spike | > 50 errors     | 5 min  | Check for regressions    |
| Slow LCP           | p75 > 4000ms    | 15 min | Performance optimization |
| High CLS           | p75 > 0.25      | 15 min | Layout stability fix     |
| Slow INP           | p75 > 500ms     | 15 min | Interaction optimization |
| Slow TTFB          | p75 > 1800ms    | 15 min | Server optimization      |

### Warning Alerts

| Alert                 | Condition         | Window | Action             |
| --------------------- | ----------------- | ------ | ------------------ |
| Elevated Error Rate   | API errors > 2%   | 10 min | Monitor closely    |
| LCP Needs Improvement | p75 > 2500ms      | 15 min | Review performance |
| High API Latency      | p95 > 2000ms      | 10 min | Optimize endpoints |
| Traffic Drop          | 50% below average | 60 min | Investigate cause  |

### Info Alerts

| Alert               | Condition  | Window | Action           |
| ------------------- | ---------- | ------ | ---------------- |
| Traffic Spike       | 3x average | 60 min | Monitor capacity |
| High No-Result Rate | > 30%      | 60 min | Improve search   |

## Dashboards

### Overview Dashboard (`/dashboard`)

Key metrics at a glance:

- Total views and unique visitors
- Core Web Vitals summary
- Error count and rate
- Search analytics
- Top pages

### Traffic Dashboard (`/dashboard/traffic`)

Detailed traffic insights:

- Views over time (chart)
- Top pages by views
- Referrer sources
- Device types
- Browser distribution

### Performance Dashboard (`/dashboard/performance`)

Core Web Vitals details:

- LCP, CLS, INP, TTFB with percentiles
- Performance by page
- API latency by endpoint
- Performance trends

### Errors Dashboard (`/dashboard/errors`)

Error monitoring:

- Error summary
- Errors by level (error/warning/info)
- Recent errors with counts
- Errors by page
- Error trends

### Content Dashboard (`/dashboard/content`)

Content performance:

- Top content by views
- Engagement metrics
- Scroll depth distribution

### Search Dashboard (`/dashboard/search`)

Search analytics:

- Total queries and selection rate
- Popular searches
- No-result searches
- Search recommendations

## Logging

### Structured Logging

All logs use structured format:

```
[2024-01-15T10:30:00.000Z] [INFO] [req:abc123] [corr:def456] Request processed successfully
```

### Log Levels

| Level   | Usage                        |
| ------- | ---------------------------- |
| `debug` | Development debugging        |
| `info`  | Normal operations            |
| `warn`  | Potential issues             |
| `error` | Failures requiring attention |
| `fatal` | Critical failures            |

### Request IDs

Every request gets a unique ID for tracing:

- Format: 8-character hex string
- Propagated through logs and errors
- Used for correlation across services

### Correlation IDs

Group related operations:

- Format: 12-character hex string
- Links related requests (e.g., form submission + validation)

## Health Checks

### API Health

```bash
# Check API status
curl https://bigblog.dev/api/analytics/alerts

# Response
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "checkedRules": 15,
  "triggeredAlerts": [],
  "status": "healthy"
}
```

### Database Health

```bash
# Check database connectivity
curl https://bigblog.dev/api/analytics/dashboard?days=1

# Response should include traffic data
```

## Monitoring Checklist

### Daily

- [ ] Check error dashboard for new errors
- [ ] Review performance metrics
- [ ] Monitor traffic patterns

### Weekly

- [ ] Review alert history
- [ ] Analyze search queries
- [ ] Check content performance
- [ ] Review API latency trends

### Monthly

- [ ] Performance optimization review
- [ ] Error trend analysis
- [ ] Search optimization
- [ ] Content strategy review

## Troubleshooting

### High Error Rate

1. Check error dashboard for specific errors
2. Review recent deployments
3. Check API endpoint health
4. Review database connectivity

### Performance Regression

1. Check Core Web Vitals dashboard
2. Review recent code changes
3. Check for new third-party scripts
4. Review image optimization

### Traffic Anomaly

1. Check traffic dashboard
2. Review referrer sources
3. Check for bot traffic
4. Verify site availability

## Data Retention

| Data Type           | Retention | Cleanup   |
| ------------------- | --------- | --------- |
| Analytics events    | 90 days   | Automated |
| Performance metrics | 90 days   | Automated |
| Error logs          | 90 days   | Automated |
| Search events       | 90 days   | Automated |
| API latency         | 90 days   | Automated |

## Privacy Compliance

All monitoring respects user privacy:

- Do Not Track is honored
- IP addresses are hashed
- No cookies for analytics
- Minimal data collection
- User opt-out supported
