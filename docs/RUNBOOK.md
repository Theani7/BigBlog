# Runbook

## Overview

This runbook provides procedures for responding to incidents and common operational tasks.

## Incident Response

### 1. High Error Rate

**Symptoms:**

- Error dashboard shows elevated error rates
- Users reporting issues
- Alerts firing for error thresholds

**Diagnosis:**

1. Check `/dashboard/errors` for error types
2. Review recent deployments
3. Check API endpoint health
4. Review database connectivity

**Resolution:**

1. If deployment-related:

   ```bash
   # Rollback to previous version
   git revert HEAD
   git push
   ```

2. If database-related:

   ```bash
   # Check D1 status
   wrangler d1 execute bigblog-db --command "SELECT 1"
   ```

3. If API-related:
   - Check API latency dashboard
   - Review rate limiting
   - Check for infinite loops

### 2. Performance Regression

**Symptoms:**

- Core Web Vitals degraded
- LCP, CLS, or INP alerts firing
- Users reporting slow load times

**Diagnosis:**

1. Check `/dashboard/performance`
2. Review recent code changes
3. Check for new third-party scripts
4. Review image optimization

**Resolution:**

1. If code-related:
   - Revert recent changes
   - Profile performance bottlenecks
   - Optimize critical rendering path

2. If third-party:
   - Defer non-critical scripts
   - Use async/defer attributes
   - Consider removing heavy scripts

3. If image-related:
   - Check Cloudinary optimization
   - Verify responsive images
   - Check image formats (WebP, AVIF)

### 3. Traffic Anomaly

**Symptoms:**

- Sudden traffic drop or spike
- Unusual referrer patterns
- Bot traffic detected

**Diagnosis:**

1. Check `/dashboard/traffic`
2. Review referrer sources
3. Check for DDoS patterns
4. Verify site availability

**Resolution:**

1. If bot traffic:
   - Check robots.txt
   - Review Cloudflare bot management
   - Consider rate limiting

2. If DDoS:
   - Enable Cloudflare Under Attack mode
   - Review WAF rules
   - Contact Cloudflare support

3. If legitimate spike:
   - Monitor server resources
   - Check D1 capacity
   - Consider caching improvements

### 4. Database Issues

**Symptoms:**

- Database errors in logs
- Slow query performance
- Connection timeouts

**Diagnosis:**

1. Check D1 dashboard
2. Review query performance
3. Check storage limits
4. Review connection patterns

**Resolution:**

1. If slow queries:
   - Add missing indexes
   - Optimize query patterns
   - Consider query caching

2. If storage limits:
   - Clean up old data
   - Archive historical data
   - Consider storage expansion

3. If connection issues:
   - Check D1 status page
   - Review connection pooling
   - Consider retry logic

## Common Tasks

### Deploy Updates

```bash
# Build and deploy
npm run build
git add .
git commit -m "feat: description"
git push
```

### Check Analytics

```bash
# Quick health check
curl https://bigblog.dev/api/analytics/alerts

# Get dashboard data
curl https://bigblog.dev/api/analytics/dashboard?days=7
```

### Database Operations

```bash
# List tables
wrangler d1 execute bigblog-db --command ".tables"

# Check table sizes
wrangler d1 execute bigblog-db --command "
  SELECT name, (pages * page_count) as size_bytes
  FROM pragma_page_count(), pragma_page_size(), sqlite_master
  WHERE type='table'
"

# Cleanup old data (90 days retention)
wrangler d1 execute bigblog-db --command "
  DELETE FROM analytics_events
  WHERE created_at < unixepoch() - (90 * 24 * 60 * 60)
"
```

### Monitor Logs

```bash
# Tail Vercel logs
vercel logs

# Check for errors
vercel logs | grep -i error
```

## Performance Tuning

### Core Web Vitals

**LCP Optimization:**

- Preload critical resources
- Optimize images (WebP, AVIF)
- Use CDN for static assets
- Minimize render-blocking resources

**CLS Optimization:**

- Set explicit image dimensions
- Use CSS aspect-ratio
- Reserve space for dynamic content
- Avoid inserting content above existing content

**INP Optimization:**

- Break up long tasks
- Use web workers for heavy computation
- Optimize event handlers
- Reduce DOM size

### API Optimization

- Implement response caching
- Use connection pooling
- Optimize database queries
- Add pagination for large datasets

### Caching Strategy

- Static assets: 1 year (immutable)
- API responses: 1 hour (stale-while-revalidate)
- HTML pages: CDN-cached
- Search index: 1 hour

## Security Incident Response

### 1. Suspected Data Breach

1. **Immediately:** Rotate all secrets
2. **Assess:** Check access logs
3. **Contain:** Block suspicious IPs
4. **Notify:** Inform affected users
5. **Document:** Create incident report

### 2. DDoS Attack

1. **Enable:** Cloudflare Under Attack mode
2. **Monitor:** Check traffic patterns
3. **Block:** Malicious IPs/ranges
4. **Contact:** Cloudflare support if needed
5. **Document:** Post-incident review

### 3. Vulnerability Discovery

1. **Assess:** Severity and impact
2. **Patch:** Apply fixes immediately
3. **Test:** Verify fix works
4. **Deploy:** Push to production
5. **Document:** Security advisory

## Maintenance Tasks

### Weekly

- [ ] Review error dashboard
- [ ] Check performance metrics
- [ ] Monitor traffic patterns
- [ ] Review search analytics

### Monthly

- [ ] Database cleanup (old data)
- [ ] Performance optimization review
- [ ] Security audit
- [ ] Dependency updates

### Quarterly

- [ ] Infrastructure review
- [ ] Capacity planning
- [ ] Disaster recovery test
- [ ] Documentation updates

## Contacts

| Role               | Contact                |
| ------------------ | ---------------------- |
| Primary On-call    | [Your Name]            |
| Backup On-call     | [Backup Name]          |
| Cloudflare Support | support@cloudflare.com |
| Vercel Support     | support@vercel.com     |

## Escalation Path

1. **Level 1:** On-call engineer
2. **Level 2:** Team lead
3. **Level 3:** Engineering manager
4. **Level 4:** CTO

## Post-Incident

After any incident:

1. **Document:** What happened, when, impact
2. **Root Cause:** Why it happened
3. **Resolution:** How it was fixed
4. **Prevention:** What to do to prevent recurrence
5. **Action Items:** Tasks with owners and deadlines
