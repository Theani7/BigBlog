# Testing Guide

## Overview

BigBlog uses **Vitest** for unit/integration testing and **Playwright** for end-to-end testing.

## Quick Start

```bash
# Run all unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests (requires dev server)
npm run test:e2e

# Run all tests
npm run test:all
```

## Test Structure

```
tests/
├── unit/                    # Pure function tests (no side effects)
│   ├── utils.test.ts        # cn, formatDate, readingTime, slugify, etc.
│   ├── content-utils.test.ts # readingTime, slugify, pagination, etc.
│   ├── content-engine.test.ts # filterDrafts, sortPosts, getRelatedPosts, etc.
│   ├── validation.test.ts   # isValidEmail, sanitizeContent, validateComment, etc.
│   ├── errors.test.ts       # AppError classes and error handling
│   ├── media.test.ts        # Cloudinary URL generation
│   ├── media-responsive.test.ts # srcset/sizes generation
│   └── canonical.test.ts    # URL canonical helpers
├── integration/             # Multi-module integration tests
│   ├── seo-rss-sitemap.test.ts # RSS, sitemap, search index, JSON-LD
│   ├── api-endpoints.test.ts   # API request/response contracts
│   └── security.test.ts     # XSS prevention, URL safety, spam detection
└── e2e/                     # Browser-based end-to-end tests
    └── homepage.spec.ts     # Full user flows across viewports
```

## Writing Tests

### Unit Tests

Unit tests test pure functions with no side effects:

```typescript
import { describe, it, expect } from 'vitest';
import { slugify } from '../../src/utils/content';

describe('slugify', () => {
  it('creates URL-safe slugs', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });
});
```

### Integration Tests

Integration tests verify module interactions:

```typescript
import { describe, it, expect } from 'vitest';
import { detectSpam, isValidEmail } from '../../src/lib/validation/index';

describe('Security', () => {
  it('blocks XSS via email', () => {
    expect(isValidEmail('<script>alert(1)</script>')).toBe(false);
  });
});
```

### E2E Tests

E2E tests run in a real browser via Playwright:

```typescript
import { test, expect } from '@playwright/test';

test('homepage loads', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/BigBlog/);
});
```

## Coverage

Coverage is generated via `@vitest/coverage-v8`:

```bash
npm run test:coverage
```

Output goes to `coverage/` directory with HTML and LCOV reports.

## Configuration

- **Vitest**: `vitest.config.ts`
- **Playwright**: `playwright.config.ts`

## CI Integration

All tests should run in CI:

```yaml
- name: Test
  run: |
    npm run typecheck
    npm run lint
    npm test
    npm run test:e2e
```
