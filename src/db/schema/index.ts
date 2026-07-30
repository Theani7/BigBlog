import mongoose, { Schema } from 'mongoose';

// Re-export analytics tables
export * from './analytics';
export * from './user';

// =============================================================================
// ANONYMOUS SESSIONS
// =============================================================================
const anonymousSessionsSchema = new Schema({
  _id: { type: String, required: true },
  fingerprint: { type: String, required: true },
  userAgent: { type: String },
  ipHash: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  lastActiveAt: { type: Date, default: Date.now },
});

anonymousSessionsSchema.index({ fingerprint: 1 });
anonymousSessionsSchema.index({ createdAt: 1 });

export const anonymousSessions =
  mongoose.models.AnonymousSession ||
  mongoose.model<any>('AnonymousSession', anonymousSessionsSchema);

// =============================================================================
// ARTICLE VIEWS
// =============================================================================
const articleViewsSchema = new Schema({
  articleSlug: { type: String, required: true },
  sessionId: { type: String, required: true, ref: 'AnonymousSession' },
  viewedAt: { type: Date, default: Date.now },
  duration: { type: Number },
  referrer: { type: String },
});

articleViewsSchema.index({ articleSlug: 1 });
articleViewsSchema.index({ sessionId: 1 });
articleViewsSchema.index({ viewedAt: 1 });
articleViewsSchema.index({ articleSlug: 1, viewedAt: 1 });
articleViewsSchema.index({ articleSlug: 1, sessionId: 1, viewedAt: 1 }, { unique: true });

export const articleViews =
  mongoose.models.ArticleView || mongoose.model<any>('ArticleView', articleViewsSchema);

// =============================================================================
// ARTICLE LIKES
// =============================================================================
const articleLikesSchema = new Schema({
  articleSlug: { type: String, required: true },
  sessionId: { type: String, required: true, ref: 'AnonymousSession' },
  createdAt: { type: Date, default: Date.now },
});

articleLikesSchema.index({ articleSlug: 1 });
articleLikesSchema.index({ sessionId: 1 });
articleLikesSchema.index({ articleSlug: 1, sessionId: 1 }, { unique: true });

export const articleLikes =
  mongoose.models.ArticleLike || mongoose.model<any>('ArticleLike', articleLikesSchema);

// =============================================================================
// ARTICLE BOOKMARKS
// =============================================================================
const articleBookmarksSchema = new Schema({
  articleSlug: { type: String, required: true },
  sessionId: { type: String, required: true, ref: 'AnonymousSession' },
  createdAt: { type: Date, default: Date.now },
  syncedAt: { type: Date },
});

articleBookmarksSchema.index({ articleSlug: 1 });
articleBookmarksSchema.index({ sessionId: 1 });
articleBookmarksSchema.index({ articleSlug: 1, sessionId: 1 }, { unique: true });

export const articleBookmarks =
  mongoose.models.ArticleBookmark || mongoose.model<any>('ArticleBookmark', articleBookmarksSchema);

// =============================================================================
// COMMENTS
// =============================================================================
const commentsSchema = new Schema({
  articleSlug: { type: String, required: true },
  sessionId: { type: String, required: true, ref: 'AnonymousSession' },
  parentId: { type: Schema.Types.ObjectId, ref: 'Comment' },
  content: { type: String, required: true },
  authorName: { type: String, required: true },
  authorEmail: { type: String },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'spam'],
    required: true,
    default: 'pending',
  },
  isEdited: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  deletedAt: { type: Date },
});

commentsSchema.index({ articleSlug: 1 });
commentsSchema.index({ sessionId: 1 });
commentsSchema.index({ parentId: 1 });
commentsSchema.index({ status: 1 });
commentsSchema.index({ createdAt: 1 });

export const comments = mongoose.models.Comment || mongoose.model<any>('Comment', commentsSchema);

// =============================================================================
// COMMENT REACTIONS
// =============================================================================
const commentReactionsSchema = new Schema({
  commentId: { type: Schema.Types.ObjectId, required: true, ref: 'Comment' },
  sessionId: { type: String, required: true, ref: 'AnonymousSession' },
  emoji: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

commentReactionsSchema.index({ commentId: 1 });
commentReactionsSchema.index({ sessionId: 1 });
commentReactionsSchema.index({ commentId: 1, sessionId: 1, emoji: 1 }, { unique: true });

export const commentReactions =
  mongoose.models.CommentReaction || mongoose.model<any>('CommentReaction', commentReactionsSchema);

// =============================================================================
// COMMENT REPORTS
// =============================================================================
const commentReportsSchema = new Schema({
  commentId: { type: Schema.Types.ObjectId, required: true, ref: 'Comment' },
  sessionId: { type: String, required: true, ref: 'AnonymousSession' },
  reason: { type: String, enum: ['spam', 'abuse', 'off-topic', 'other'], required: true },
  details: { type: String },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved'],
    required: true,
    default: 'pending',
  },
  createdAt: { type: Date, default: Date.now },
  reviewedAt: { type: Date },
});

commentReportsSchema.index({ commentId: 1 });
commentReportsSchema.index({ status: 1 });

export const commentReports =
  mongoose.models.CommentReport || mongoose.model<any>('CommentReport', commentReportsSchema);

// =============================================================================
// NEWSLETTER SUBSCRIBERS
// =============================================================================
const newsletterSubscribersSchema = new Schema({
  email: { type: String, required: true },
  sessionId: { type: String, ref: 'AnonymousSession' },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'unsubscribed'],
    required: true,
    default: 'pending',
  },
  confirmationToken: { type: String },
  subscribedAt: { type: Date, default: Date.now },
  confirmedAt: { type: Date },
  unsubscribedAt: { type: Date },
});

newsletterSubscribersSchema.index({ email: 1 }, { unique: true });
newsletterSubscribersSchema.index({ status: 1 });
newsletterSubscribersSchema.index({ confirmationToken: 1 });

export const newsletterSubscribers =
  mongoose.models.NewsletterSubscriber ||
  mongoose.model<any>('NewsletterSubscriber', newsletterSubscribersSchema);

// =============================================================================
// READING HISTORY
// =============================================================================
const readingHistorySchema = new Schema({
  articleSlug: { type: String, required: true },
  sessionId: { type: String, required: true, ref: 'AnonymousSession' },
  progress: { type: Number, required: true, default: 0 },
  readTime: { type: Number },
  completedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

readingHistorySchema.index({ articleSlug: 1 });
readingHistorySchema.index({ sessionId: 1 });
readingHistorySchema.index({ updatedAt: 1 });
readingHistorySchema.index({ articleSlug: 1, sessionId: 1 }, { unique: true });

export const readingHistory =
  mongoose.models.ReadingHistory || mongoose.model<any>('ReadingHistory', readingHistorySchema);

// =============================================================================
// USER PREFERENCES
// =============================================================================
const userPreferencesSchema = new Schema({
  sessionId: { type: String, required: true, ref: 'AnonymousSession' },
  theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
  fontSize: { type: Number, default: 16 },
  contentWidth: { type: Number, default: 720 },
  lineHeight: { type: Number, default: 1.7 },
  readingMode: { type: String, enum: ['default', 'reader', 'focused'], default: 'default' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

userPreferencesSchema.index({ sessionId: 1 }, { unique: true });

export const userPreferences =
  mongoose.models.UserPreference || mongoose.model<any>('UserPreference', userPreferencesSchema);

// =============================================================================
// AUDIT LOGS
// =============================================================================
const auditLogsSchema = new Schema({
  sessionId: { type: String, ref: 'AnonymousSession' },
  action: { type: String, required: true },
  entityType: { type: String, required: true },
  entityId: { type: String },
  metadata: { type: String },
  ipHash: { type: String },
  createdAt: { type: Date, default: Date.now },
});

auditLogsSchema.index({ sessionId: 1 });
auditLogsSchema.index({ action: 1 });
auditLogsSchema.index({ entityType: 1, entityId: 1 });
auditLogsSchema.index({ createdAt: 1 });

export const auditLogs =
  mongoose.models.AuditLog || mongoose.model<any>('AuditLog', auditLogsSchema);
