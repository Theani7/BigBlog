# Sprint 7: Dynamic Features

## Overview

Sprint 7 transforms the blog from a static site into a dynamic application with Cloudflare D1 as the database and Drizzle ORM for data access.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                             │
│                    (Astro + Client JS)                      │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                       API Layer                             │
│                    (REST Endpoints)                         │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                    Service Layer                            │
│              (Business Logic + Validation)                  │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                   Repository Layer                          │
│                  (Data Access + Queries)                    │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                    Database Layer                           │
│                (Drizzle ORM + Cloudflare D1)                │
└─────────────────────────────────────────────────────────────┘
```

## Database Schema

### Tables

| Table                    | Description             | Records (Est.) |
| ------------------------ | ----------------------- | -------------- |
| `anonymous_sessions`     | Anonymous user sessions | 10K+           |
| `article_views`          | Page view tracking      | 100K+          |
| `article_likes`          | Article likes           | 10K+           |
| `article_bookmarks`      | User bookmarks          | 5K+            |
| `comments`               | Threaded comments       | 50K+           |
| `comment_reactions`      | Emoji reactions         | 20K+           |
| `comment_reports`        | Moderation reports      | 1K+            |
| `newsletter_subscribers` | Email subscribers       | 5K+            |
| `reading_history`        | Reading progress        | 50K+           |
| `user_preferences`       | User settings           | 10K+           |
| `audit_logs`             | Activity logs           | 100K+          |

### Indexes

| Table                    | Index                           | Purpose                     |
| ------------------------ | ------------------------------- | --------------------------- |
| `article_views`          | `idx_article_views_slug`        | Query by article            |
| `article_views`          | `idx_article_views_slug_date`   | Daily/weekly/monthly stats  |
| `article_views`          | `idx_article_views_unique_view` | Deduplication               |
| `article_likes`          | `idx_article_likes_unique`      | Prevent duplicate likes     |
| `article_bookmarks`      | `idx_article_bookmarks_unique`  | Prevent duplicate bookmarks |
| `comments`               | `idx_comments_slug`             | Query by article            |
| `comments`               | `idx_comments_parent`           | Thread resolution           |
| `comments`               | `idx_comments_status`           | Moderation queue            |
| `newsletter_subscribers` | `idx_newsletter_email`          | Email lookup                |
| `reading_history`        | `idx_reading_history_unique`    | Progress tracking           |
| `user_preferences`       | `idx_user_preferences_session`  | Fast lookup                 |
| `audit_logs`             | `idx_audit_logs_action`         | Action-based queries        |

## API Endpoints

### Views

| Method | Endpoint                 | Description    |
| ------ | ------------------------ | -------------- |
| `GET`  | `/api/views?slug={slug}` | Get view stats |
| `POST` | `/api/views`             | Record a view  |

**Request Body:**

```json
{
  "articleSlug": "my-article",
  "referrer": "https://twitter.com"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "recorded": true
  }
}
```

### Likes

| Method | Endpoint                 | Description               |
| ------ | ------------------------ | ------------------------- |
| `GET`  | `/api/likes?slug={slug}` | Get like count and status |
| `POST` | `/api/likes`             | Toggle like               |

**Request Body:**

```json
{
  "articleSlug": "my-article"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "liked": true,
    "count": 42
  }
}
```

### Bookmarks

| Method | Endpoint         | Description       |
| ------ | ---------------- | ----------------- |
| `GET`  | `/api/bookmarks` | Get all bookmarks |
| `POST` | `/api/bookmarks` | Toggle bookmark   |

**Request Body:**

```json
{
  "articleSlug": "my-article"
}
```

### Comments

| Method | Endpoint                    | Description           |
| ------ | --------------------------- | --------------------- |
| `GET`  | `/api/comments?slug={slug}` | Get threaded comments |
| `POST` | `/api/comments`             | Create comment        |
| `POST` | `/api/comments/edit`        | Edit comment          |
| `POST` | `/api/comments/delete`      | Delete comment        |
| `POST` | `/api/comments/react`       | Toggle reaction       |
| `POST` | `/api/comments/report`      | Report comment        |

**Create Comment Body:**

```json
{
  "articleSlug": "my-article",
  "content": "Great article!",
  "authorName": "John Doe",
  "authorEmail": "john@example.com",
  "parentId": null
}
```

### Newsletter

| Method | Endpoint                          | Description          |
| ------ | --------------------------------- | -------------------- |
| `GET`  | `/api/newsletter`                 | Get subscriber stats |
| `POST` | `/api/newsletter`                 | Subscribe            |
| `GET`  | `/api/newsletter/confirm/{token}` | Confirm subscription |

**Subscribe Body:**

```json
{
  "email": "user@example.com"
}
```

### Reading History

| Method | Endpoint                               | Description              |
| ------ | -------------------------------------- | ------------------------ |
| `GET`  | `/api/reading-history`                 | Get recent history       |
| `GET`  | `/api/reading-history?action=continue` | Get continue reading     |
| `GET`  | `/api/reading-history?slug={slug}`     | Get progress for article |
| `POST` | `/api/reading-history`                 | Update progress          |

**Update Progress Body:**

```json
{
  "articleSlug": "my-article",
  "progress": 0.75,
  "readTime": 300
}
```

### User Preferences

| Method | Endpoint           | Description        |
| ------ | ------------------ | ------------------ |
| `GET`  | `/api/preferences` | Get preferences    |
| `POST` | `/api/preferences` | Update preferences |

**Update Preferences Body:**

```json
{
  "theme": "dark",
  "fontSize": 18,
  "contentWidth": 720,
  "lineHeight": 1.8,
  "readingMode": "reader"
}
```

## Services

### SessionService

- `getOrCreateSession(fingerprint, ip, userAgent)` - Get or create anonymous session

### ViewsService

- `trackView(articleSlug, sessionId, referrer?)` - Record view with deduplication
- `getStats(articleSlug)` - Get view statistics
- `getMultipleStats(slugs)` - Batch get stats

### LikesService

- `toggle(articleSlug, sessionId)` - Toggle like
- `getCount(articleSlug)` - Get like count
- `hasLiked(articleSlug, sessionId)` - Check if liked
- `getMultipleCounts(slugs)` - Batch get counts

### BookmarksService

- `toggle(articleSlug, sessionId)` - Toggle bookmark
- `getBookmarks(sessionId)` - Get all bookmarks
- `hasBookmarked(articleSlug, sessionId)` - Check if bookmarked

### CommentsService

- `create(articleSlug, sessionId, data)` - Create comment
- `getThreaded(articleSlug)` - Get threaded comments
- `getCount(articleSlug)` - Get comment count
- `edit(commentId, sessionId, content)` - Edit comment
- `delete(commentId, sessionId)` - Soft delete comment
- `react(commentId, sessionId, emoji)` - Toggle reaction
- `report(commentId, sessionId, reason, details?)` - Report comment

### NewsletterService

- `subscribe(email, sessionId?)` - Subscribe to newsletter
- `confirm(token)` - Confirm subscription
- `unsubscribe(email)` - Unsubscribe
- `getStats()` - Get subscriber statistics

### ReadingHistoryService

- `updateProgress(articleSlug, sessionId, progress, readTime?)` - Update reading progress
- `getRecent(sessionId, limit?)` - Get recent history
- `getContinueReading(sessionId)` - Get article to continue
- `getProgress(articleSlug, sessionId)` - Get progress for article

### UserPreferencesService

- `get(sessionId)` - Get preferences
- `update(sessionId, preferences)` - Update preferences

## Client API

```typescript
import {
  viewsApi,
  likesApi,
  bookmarksApi,
  commentsApi,
  newsletterApi,
  readingHistoryApi,
  preferencesApi,
} from '../lib/api';

// Track a view
await viewsApi.track('my-article');

// Get view stats
const stats = await viewsApi.getStats('my-article');

// Toggle like
const { liked, count } = await likesApi.toggle('my-article');

// Toggle bookmark
const { bookmarked } = await bookmarksApi.toggle('my-article');

// Create a comment
const comment = await commentsApi.create({
  articleSlug: 'my-article',
  content: 'Great article!',
  authorName: 'John Doe',
});

// Subscribe to newsletter
await newsletterApi.subscribe('user@example.com');

// Update reading progress
await readingHistoryApi.update('my-article', 0.75, 300);

// Update preferences
await preferencesApi.update({ theme: 'dark', fontSize: 18 });
```

## Security Features

- **Rate Limiting**: API endpoints are rate-limited per session
- **Input Validation**: All inputs are validated and sanitized
- **XSS Prevention**: HTML content is escaped
- **Spam Detection**: Comment spam detection with confidence scoring
- **CSRF Protection**: Session-based authentication
- **IP Hashing**: IP addresses are hashed for privacy

## Performance Considerations

- **Batch Queries**: Use `getMultipleStats()` for bulk operations
- **Connection Pooling**: D1 handles connection management
- **Index Optimization**: Strategic indexes for common queries
- **Deduplication**: Prevent duplicate views/likes with unique constraints

## Deployment

### Cloudflare Workers

1. Install dependencies:

   ```bash
   npm install
   ```

2. Configure D1 in `wrangler.toml`:

   ```toml
   [[d1_databases]]
   binding = "DB"
   database_name = "bigblog-db"
   database_id = "your-database-id"
   ```

3. Run migrations:

   ```bash
   npx drizzle-kit generate
   npx wrangler d1 migrations apply bigblog-db
   ```

4. Deploy:
   ```bash
   npm run build
   npx wrangler deploy
   ```

### Local Development

1. Create local database:

   ```bash
   npx drizzle-kit generate
   npx wrangler d1 migrations apply bigblog-db --local
   ```

2. Start dev server:
   ```bash
   npm run dev
   ```

## Files Created

### Database Layer

- `src/db/schema/index.ts` - Drizzle ORM schema
- `src/db/index.ts` - Database connection
- `src/db/types.ts` - TypeScript types
- `src/db/repositories/session.repository.ts` - Session, views, likes, bookmarks
- `src/db/repositories/comments.repository.ts` - Comments, reactions, reports
- `src/db/repositories/newsletter.repository.ts` - Newsletter subscribers
- `src/db/repositories/user.repository.ts` - Reading history, preferences
- `src/db/repositories/audit.repository.ts` - Audit logs
- `src/db/repositories/index.ts` - Repository exports

### Services

- `src/lib/services/index.ts` - All service classes

### API Layer

- `src/api/middleware/index.ts` - CORS, rate limiting, session handling
- `src/api/routes/engagement.ts` - Views, likes, bookmarks, comments
- `src/api/routes/newsletter.ts` - Newsletter endpoints
- `src/api/routes/user.ts` - Reading history, preferences
- `src/api/routes/index.ts` - Route exports

### API Endpoints

- `src/pages/api/views/index.ts`
- `src/pages/api/likes/index.ts`
- `src/pages/api/bookmarks/index.ts`
- `src/pages/api/comments/index.ts` (supports create, edit, delete, react, report via action param)
- `src/pages/api/newsletter/index.ts` (supports subscribe, confirm, unsubscribe, stats via action param)
- `src/pages/api/reading-history/index.ts`
- `src/pages/api/preferences/index.ts`

### Client

- `src/lib/api.ts` - Client-side API utility

### Configuration

- `drizzle.config.ts` - Drizzle Kit configuration
- `astro.config.cloudflare.mjs` - Cloudflare adapter config

### Documentation

- `docs/SPRINT7_DYNAMIC.md` - This file

---

## Deliverables

### 1. ER Diagram Summary

```
┌─────────────────────┐     ┌─────────────────────┐
│  anonymous_sessions │     │    article_views     │
├─────────────────────┤     ├─────────────────────┤
│ id (PK)             │◄────│ session_id (FK)      │
│ fingerprint         │     │ article_slug         │
│ user_agent          │     │ viewed_at            │
│ ip_hash             │     │ duration             │
│ created_at          │     │ referrer             │
│ updated_at          │     └─────────────────────┘
│ last_active_at      │
└─────────────────────┘     ┌─────────────────────┐
        │                   │   article_likes      │
        │                   ├─────────────────────┤
        │                   │ session_id (FK)      │
        │                   │ article_slug         │
        │                   │ created_at           │
        │                   └─────────────────────┘
        │
        │                   ┌─────────────────────┐
        │                   │  article_bookmarks   │
        │                   ├─────────────────────┤
        │                   │ session_id (FK)      │
        │                   │ article_slug         │
        │                   │ created_at           │
        │                   │ synced_at            │
        │                   └─────────────────────┘
        │
        ▼                   ┌─────────────────────┐
┌─────────────────────┐     │      comments        │
│  reading_history    │     ├─────────────────────┤
├─────────────────────┤     │ session_id (FK)      │
│ session_id (FK)     │     │ article_slug         │
│ article_slug        │     │ parent_id (FK)       │
│ progress            │     │ content              │
│ read_time           │     │ author_name          │
│ completed_at        │     │ author_email         │
│ created_at          │     │ status               │
│ updated_at          │     │ is_edited            │
└─────────────────────┘     │ created_at           │
                            │ updated_at           │
┌─────────────────────┐     │ deleted_at           │
│  user_preferences   │     └─────────────────────┘
├─────────────────────┤              │
│ session_id (FK)     │              ▼
│ theme               │     ┌─────────────────────┐
│ font_size           │     │  comment_reactions   │
│ content_width       │     ├─────────────────────┤
│ line_height         │     │ comment_id (FK)      │
│ reading_mode        │     │ session_id (FK)      │
│ created_at          │     │ emoji                │
│ updated_at          │     │ created_at           │
└─────────────────────┘     └─────────────────────┘
                            │
┌─────────────────────┐     │  comment_reports     │
│ newsletter_subscribers│    ├─────────────────────┤
├─────────────────────┤     │ comment_id (FK)      │
│ email               │     │ session_id (FK)      │
│ session_id (FK)     │     │ reason               │
│ status              │     │ details              │
│ confirmation_token  │     │ status               │
│ subscribed_at       │     │ created_at           │
│ confirmed_at        │     │ reviewed_at          │
│ unsubscribed_at     │     └─────────────────────┘
└─────────────────────┘
                            ┌─────────────────────┐
                            │     audit_logs       │
                            ├─────────────────────┤
                            │ session_id (FK)      │
                            │ action               │
                            │ entity_type          │
                            │ entity_id            │
                            │ metadata             │
                            │ ip_hash              │
                            │ created_at           │
                            └─────────────────────┘
```

### 2. Table Inventory

| Table                    | Purpose               | Records Est. | Retention |
| ------------------------ | --------------------- | ------------ | --------- |
| `anonymous_sessions`     | Track anonymous users | 10K+         | 90 days   |
| `article_views`          | Page view tracking    | 100K+        | 1 year    |
| `article_likes`          | Article likes         | 10K+         | Forever   |
| `article_bookmarks`      | User bookmarks        | 5K+          | Forever   |
| `comments`               | User comments         | 50K+         | Forever   |
| `comment_reactions`      | Emoji reactions       | 20K+         | Forever   |
| `comment_reports`        | Moderation reports    | 1K+          | 1 year    |
| `newsletter_subscribers` | Email subscribers     | 5K+          | Forever   |
| `reading_history`        | Reading progress      | 50K+         | 90 days   |
| `user_preferences`       | User settings         | 10K+         | Forever   |
| `audit_logs`             | Activity logs         | 100K+        | 1 year    |

### 3. Index Inventory

| Table                    | Index                                | Columns                               | Purpose            |
| ------------------------ | ------------------------------------ | ------------------------------------- | ------------------ |
| `anonymous_sessions`     | `idx_anonymous_sessions_fingerprint` | `fingerprint`                         | Fast lookup        |
| `anonymous_sessions`     | `idx_anonymous_sessions_created_at`  | `created_at`                          | Cleanup            |
| `article_views`          | `idx_article_views_slug`             | `article_slug`                        | Query by article   |
| `article_views`          | `idx_article_views_session`          | `session_id`                          | Query by session   |
| `article_views`          | `idx_article_views_date`             | `viewed_at`                           | Date range queries |
| `article_views`          | `idx_article_views_slug_date`        | `article_slug, viewed_at`             | Stats queries      |
| `article_views`          | `idx_article_views_unique_view`      | `article_slug, session_id, viewed_at` | Dedup              |
| `article_likes`          | `idx_article_likes_slug`             | `article_slug`                        | Query by article   |
| `article_likes`          | `idx_article_likes_session`          | `session_id`                          | Query by session   |
| `article_likes`          | `idx_article_likes_unique`           | `article_slug, session_id`            | Prevent dupes      |
| `article_bookmarks`      | `idx_article_bookmarks_slug`         | `article_slug`                        | Query by article   |
| `article_bookmarks`      | `idx_article_bookmarks_session`      | `session_id`                          | Query by session   |
| `article_bookmarks`      | `idx_article_bookmarks_unique`       | `article_slug, session_id`            | Prevent dupes      |
| `comments`               | `idx_comments_slug`                  | `article_slug`                        | Query by article   |
| `comments`               | `idx_comments_session`               | `session_id`                          | Query by session   |
| `comments`               | `idx_comments_parent`                | `parent_id`                           | Thread resolution  |
| `comments`               | `idx_comments_status`                | `status`                              | Moderation queue   |
| `comments`               | `idx_comments_created_at`            | `created_at`                          | Sorting            |
| `comment_reactions`      | `idx_comment_reactions_comment`      | `comment_id`                          | Query by comment   |
| `comment_reactions`      | `idx_comment_reactions_session`      | `session_id`                          | Query by session   |
| `comment_reactions`      | `idx_comment_reactions_unique`       | `comment_id, session_id, emoji`       | Prevent dupes      |
| `comment_reports`        | `idx_comment_reports_comment`        | `comment_id`                          | Query by comment   |
| `comment_reports`        | `idx_comment_reports_status`         | `status`                              | Moderation queue   |
| `newsletter_subscribers` | `idx_newsletter_email`               | `email`                               | Email lookup       |
| `newsletter_subscribers` | `idx_newsletter_status`              | `status`                              | Status queries     |
| `newsletter_subscribers` | `idx_newsletter_token`               | `confirmation_token`                  | Token lookup       |
| `reading_history`        | `idx_reading_history_slug`           | `article_slug`                        | Query by article   |
| `reading_history`        | `idx_reading_history_session`        | `session_id`                          | Query by session   |
| `reading_history`        | `idx_reading_history_updated`        | `updated_at`                          | Recent activity    |
| `reading_history`        | `idx_reading_history_unique`         | `article_slug, session_id`            | Progress tracking  |
| `user_preferences`       | `idx_user_preferences_session`       | `session_id`                          | Fast lookup        |
| `audit_logs`             | `idx_audit_logs_session`             | `session_id`                          | Query by session   |
| `audit_logs`             | `idx_audit_logs_action`              | `action`                              | Action queries     |
| `audit_logs`             | `idx_audit_logs_entity`              | `entity_type, entity_id`              | Entity queries     |
| `audit_logs`             | `idx_audit_logs_created_at`          | `created_at`                          | Date range queries |

### 4. API Inventory

| Endpoint               | Methods   | Rate Limit | Auth    |
| ---------------------- | --------- | ---------- | ------- |
| `/api/views`           | GET, POST | 100/min    | Session |
| `/api/likes`           | GET, POST | 50/min     | Session |
| `/api/bookmarks`       | GET, POST | None       | Session |
| `/api/comments`        | GET, POST | 10/min     | Session |
| `/api/newsletter`      | GET, POST | 5/hour     | None    |
| `/api/reading-history` | GET, POST | None       | Session |
| `/api/preferences`     | GET, POST | None       | Session |

### 5. Performance Considerations

- **Batch Queries**: Use `getMultipleStats()` for bulk operations
- **Connection Pooling**: D1 handles connection management automatically
- **Index Optimization**: Strategic indexes for common query patterns
- **Deduplication**: Unique constraints prevent duplicate records
- **Read Replicas**: D1 automatically handles read scaling
- **Write Batching**: Batch inserts where possible

### 6. Security Review

| Concern       | Mitigation                               |
| ------------- | ---------------------------------------- |
| SQL Injection | Drizzle ORM parameterized queries        |
| XSS           | Content sanitization, escaped output     |
| CSRF          | Session-based authentication             |
| Rate Limiting | Per-session rate limits on writes        |
| Spam          | Content analysis with confidence scoring |
| Privacy       | IP hashing, anonymous sessions           |
| Data Exposure | Minimal data collection                  |

### 7. Remaining Work Before Sprint 8

1. **Cloudflare Deployment**
   - Configure `wrangler.toml` with D1 bindings
   - Run database migrations
   - Deploy to Cloudflare Workers

2. **Frontend Integration**
   - Add view tracking to article pages
   - Add like/bookmark buttons
   - Add comment section to articles
   - Add newsletter signup form
   - Add reading progress tracking

3. **Testing**
   - Unit tests for repositories
   - Integration tests for services
   - API endpoint tests
   - Load testing for performance

4. **Monitoring**
   - Add logging for audit trails
   - Set up error tracking
   - Monitor database performance

5. **Documentation**
   - API documentation with OpenAPI
   - Database schema documentation
   - Deployment guide
