import { sqliteTable, text, integer, real, index, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

// =============================================================================
// ANONYMOUS SESSIONS
// Tracks anonymous users for views, likes, and bookmarks
// =============================================================================
export const anonymousSessions = sqliteTable(
  'anonymous_sessions',
  {
    id: text('id').primaryKey(),
    fingerprint: text('fingerprint').notNull(),
    userAgent: text('user_agent'),
    ipHash: text('ip_hash'),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(new Date()),
    lastActiveAt: integer('last_active_at', { mode: 'timestamp' }).notNull().default(new Date()),
  },
  (table) => [
    index('idx_anonymous_sessions_fingerprint').on(table.fingerprint),
    index('idx_anonymous_sessions_created_at').on(table.createdAt),
  ]
);

// =============================================================================
// ARTICLE VIEWS
// Tracks page views with deduplication
// =============================================================================
export const articleViews = sqliteTable(
  'article_views',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    articleSlug: text('article_slug').notNull(),
    sessionId: text('session_id')
      .notNull()
      .references(() => anonymousSessions.id),
    viewedAt: integer('viewed_at', { mode: 'timestamp' }).notNull().default(new Date()),
    duration: integer('duration'),
    referrer: text('referrer'),
  },
  (table) => [
    index('idx_article_views_slug').on(table.articleSlug),
    index('idx_article_views_session').on(table.sessionId),
    index('idx_article_views_date').on(table.viewedAt),
    index('idx_article_views_slug_date').on(table.articleSlug, table.viewedAt),
    uniqueIndex('idx_article_views_unique_view').on(
      table.articleSlug,
      table.sessionId,
      table.viewedAt
    ),
  ]
);

// =============================================================================
// ARTICLE LIKES
// Anonymous likes with deduplication
// =============================================================================
export const articleLikes = sqliteTable(
  'article_likes',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    articleSlug: text('article_slug').notNull(),
    sessionId: text('session_id')
      .notNull()
      .references(() => anonymousSessions.id),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(new Date()),
  },
  (table) => [
    index('idx_article_likes_slug').on(table.articleSlug),
    index('idx_article_likes_session').on(table.sessionId),
    uniqueIndex('idx_article_likes_unique').on(table.articleSlug, table.sessionId),
  ]
);

// =============================================================================
// ARTICLE BOOKMARKS
// Anonymous bookmarks with local-first sync
// =============================================================================
export const articleBookmarks = sqliteTable(
  'article_bookmarks',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    articleSlug: text('article_slug').notNull(),
    sessionId: text('session_id')
      .notNull()
      .references(() => anonymousSessions.id),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(new Date()),
    syncedAt: integer('synced_at', { mode: 'timestamp' }),
  },
  (table) => [
    index('idx_article_bookmarks_slug').on(table.articleSlug),
    index('idx_article_bookmarks_session').on(table.sessionId),
    uniqueIndex('idx_article_bookmarks_unique').on(table.articleSlug, table.sessionId),
  ]
);

// =============================================================================
// COMMENTS
// Threaded comments with markdown support
// =============================================================================
export const comments = sqliteTable(
  'comments',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    articleSlug: text('article_slug').notNull(),
    sessionId: text('session_id')
      .notNull()
      .references(() => anonymousSessions.id),
    parentId: integer('parent_id').references(() => comments.id),
    content: text('content').notNull(),
    authorName: text('author_name').notNull(),
    authorEmail: text('author_email'),
    status: text('status', { enum: ['pending', 'approved', 'rejected', 'spam'] })
      .notNull()
      .default('pending'),
    isEdited: integer('is_edited', { mode: 'boolean' }).default(false),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(new Date()),
    deletedAt: integer('deleted_at', { mode: 'timestamp' }),
  },
  (table) => [
    index('idx_comments_slug').on(table.articleSlug),
    index('idx_comments_session').on(table.sessionId),
    index('idx_comments_parent').on(table.parentId),
    index('idx_comments_status').on(table.status),
    index('idx_comments_created_at').on(table.createdAt),
  ]
);

// =============================================================================
// COMMENT REACTIONS
// Emoji reactions on comments
// =============================================================================
export const commentReactions = sqliteTable(
  'comment_reactions',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    commentId: integer('comment_id')
      .notNull()
      .references(() => comments.id),
    sessionId: text('session_id')
      .notNull()
      .references(() => anonymousSessions.id),
    emoji: text('emoji').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(new Date()),
  },
  (table) => [
    index('idx_comment_reactions_comment').on(table.commentId),
    index('idx_comment_reactions_session').on(table.sessionId),
    uniqueIndex('idx_comment_reactions_unique').on(table.commentId, table.sessionId, table.emoji),
  ]
);

// =============================================================================
// COMMENT REPORTS
// Moderation reports for comments
// =============================================================================
export const commentReports = sqliteTable(
  'comment_reports',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    commentId: integer('comment_id')
      .notNull()
      .references(() => comments.id),
    sessionId: text('session_id')
      .notNull()
      .references(() => anonymousSessions.id),
    reason: text('reason', {
      enum: ['spam', 'abuse', 'off-topic', 'other'],
    }).notNull(),
    details: text('details'),
    status: text('status', { enum: ['pending', 'reviewed', 'resolved'] })
      .notNull()
      .default('pending'),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(new Date()),
    reviewedAt: integer('reviewed_at', { mode: 'timestamp' }),
  },
  (table) => [
    index('idx_comment_reports_comment').on(table.commentId),
    index('idx_comment_reports_status').on(table.status),
  ]
);

// =============================================================================
// NEWSLETTER SUBSCRIBERS
// Email subscriptions with confirmation flow
// =============================================================================
export const newsletterSubscribers = sqliteTable(
  'newsletter_subscribers',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    email: text('email').notNull(),
    sessionId: text('session_id').references(() => anonymousSessions.id),
    status: text('status', { enum: ['pending', 'confirmed', 'unsubscribed'] })
      .notNull()
      .default('pending'),
    confirmationToken: text('confirmation_token'),
    subscribedAt: integer('subscribed_at', { mode: 'timestamp' }).notNull().default(new Date()),
    confirmedAt: integer('confirmed_at', { mode: 'timestamp' }),
    unsubscribedAt: integer('unsubscribed_at', { mode: 'timestamp' }),
  },
  (table) => [
    uniqueIndex('idx_newsletter_email').on(table.email),
    index('idx_newsletter_status').on(table.status),
    index('idx_newsletter_token').on(table.confirmationToken),
  ]
);

// =============================================================================
// READING HISTORY
// Track reading progress and continue reading
// =============================================================================
export const readingHistory = sqliteTable(
  'reading_history',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    articleSlug: text('article_slug').notNull(),
    sessionId: text('session_id')
      .notNull()
      .references(() => anonymousSessions.id),
    progress: real('progress').notNull().default(0),
    readTime: integer('read_time'),
    completedAt: integer('completed_at', { mode: 'timestamp' }),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(new Date()),
  },
  (table) => [
    index('idx_reading_history_slug').on(table.articleSlug),
    index('idx_reading_history_session').on(table.sessionId),
    index('idx_reading_history_updated').on(table.updatedAt),
    uniqueIndex('idx_reading_history_unique').on(table.articleSlug, table.sessionId),
  ]
);

// =============================================================================
// USER PREFERENCES
// Persist user settings with D1 + localStorage fallback
// =============================================================================
export const userPreferences = sqliteTable(
  'user_preferences',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    sessionId: text('session_id')
      .notNull()
      .references(() => anonymousSessions.id),
    theme: text('theme', { enum: ['light', 'dark', 'system'] }).default('system'),
    fontSize: integer('font_size').default(16),
    contentWidth: integer('content_width').default(720),
    lineHeight: real('line_height').default(1.7),
    readingMode: text('reading_mode', { enum: ['default', 'reader', 'focused'] }).default(
      'default'
    ),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(new Date()),
  },
  (table) => [uniqueIndex('idx_user_preferences_session').on(table.sessionId)]
);

// =============================================================================
// AUDIT LOGS
// Track important actions for debugging and compliance
// =============================================================================
export const auditLogs = sqliteTable(
  'audit_logs',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    sessionId: text('session_id').references(() => anonymousSessions.id),
    action: text('action').notNull(),
    entityType: text('entity_type').notNull(),
    entityId: text('entity_id'),
    metadata: text('metadata'),
    ipHash: text('ip_hash'),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(new Date()),
  },
  (table) => [
    index('idx_audit_logs_session').on(table.sessionId),
    index('idx_audit_logs_action').on(table.action),
    index('idx_audit_logs_entity').on(table.entityType, table.entityId),
    index('idx_audit_logs_created_at').on(table.createdAt),
  ]
);

// =============================================================================
// RELATIONS
// =============================================================================
export const anonymousSessionsRelations = relations(anonymousSessions, ({ many }) => ({
  views: many(articleViews),
  likes: many(articleLikes),
  bookmarks: many(articleBookmarks),
  comments: many(comments),
  readingHistory: many(readingHistory),
  preferences: many(userPreferences),
}));

export const articleViewsRelations = relations(articleViews, ({ one }) => ({
  session: one(anonymousSessions, {
    fields: [articleViews.sessionId],
    references: [anonymousSessions.id],
  }),
}));

export const articleLikesRelations = relations(articleLikes, ({ one }) => ({
  session: one(anonymousSessions, {
    fields: [articleLikes.sessionId],
    references: [anonymousSessions.id],
  }),
}));

export const articleBookmarksRelations = relations(articleBookmarks, ({ one }) => ({
  session: one(anonymousSessions, {
    fields: [articleBookmarks.sessionId],
    references: [anonymousSessions.id],
  }),
}));

export const commentsRelations = relations(comments, ({ one, many }) => ({
  session: one(anonymousSessions, {
    fields: [comments.sessionId],
    references: [anonymousSessions.id],
  }),
  parent: one(comments, {
    fields: [comments.parentId],
    references: [comments.id],
    relationName: 'commentReplies',
  }),
  replies: many(comments, { relationName: 'commentReplies' }),
  reactions: many(commentReactions),
  reports: many(commentReports),
}));

export const commentReactionsRelations = relations(commentReactions, ({ one }) => ({
  comment: one(comments, {
    fields: [commentReactions.commentId],
    references: [comments.id],
  }),
  session: one(anonymousSessions, {
    fields: [commentReactions.sessionId],
    references: [anonymousSessions.id],
  }),
}));

export const commentReportsRelations = relations(commentReports, ({ one }) => ({
  comment: one(comments, {
    fields: [commentReports.commentId],
    references: [comments.id],
  }),
  session: one(anonymousSessions, {
    fields: [commentReports.sessionId],
    references: [anonymousSessions.id],
  }),
}));

export const readingHistoryRelations = relations(readingHistory, ({ one }) => ({
  session: one(anonymousSessions, {
    fields: [readingHistory.sessionId],
    references: [anonymousSessions.id],
  }),
}));

export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  session: one(anonymousSessions, {
    fields: [userPreferences.sessionId],
    references: [anonymousSessions.id],
  }),
}));
