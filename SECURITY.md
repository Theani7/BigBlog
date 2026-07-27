# Security Policy

## Overview

BigBlog implements defense-in-depth security across all layers.

## Input Validation

### Server-Side

- **Email validation**: Regex-based + length check (max 254 chars)
- **Comment validation**: Content length (max 5000), author name length (max 100)
- **Report validation**: Valid comment ID, valid reason enum
- **Newsletter validation**: Email format validation

### Client-Side

- **Safe URL validation**: Blocks `javascript:`, `data:`, `vbscript:` protocols
- **HTML sanitization**: Escapes `<`, `>`, `"`, `'`, `&` characters

## XSS Prevention

All user-generated content is sanitized before rendering:

- HTML entities escaped
- Script tags neutralized
- Event handlers disabled

## Rate Limiting

| Endpoint   | Limit      | Window      |
| ---------- | ---------- | ----------- |
| Views      | 100/minute | Per session |
| Likes      | 50/minute  | Per session |
| Comments   | 10/minute  | Per session |
| Newsletter | 5/hour     | Per IP      |

## Session Management

- Anonymous sessions with fingerprinting
- Session IDs: 32-character hex strings (crypto.getRandomValues)
- IP hashing for privacy (SHA-256)
- No personally identifiable information stored

## Spam Detection

Multi-signal spam detection:

- Excessive links (>3)
- Repeated characters
- ALL CAPS ratio
- Known spam keywords

## Headers (Vercel)

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

## Caching

- Immutable assets: 1 year cache
- HTML pages: 1 hour + stale-while-revalidate
- API responses: 1 hour + stale-while-revalidate

## Dependencies

Run `npm audit` regularly to check for known vulnerabilities.

## Reporting

Report security issues to the project maintainers.
