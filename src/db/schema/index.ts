import mongoose, { Schema, Document, Model } from 'mongoose';

// Re-export analytics tables
export * from './analytics';
export * from './user';
export * from './story';
export * from './repost';

// =============================================================================
// ANONYMOUS SESSIONS
// =============================================================================
export interface IAnonymousSession extends Document {
  fingerprint: string;
  userAgent: string;
  ipHash: string;
  createdAt: Date;
  updatedAt: Date;
  lastActiveAt: Date;
}

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
  (mongoose.models.AnonymousSession as Model<IAnonymousSession>) ||
  mongoose.model<IAnonymousSession>('AnonymousSession', anonymousSessionsSchema);

// =============================================================================
// ARTICLE VIEWS
// =============================================================================
export interface IArticleView extends Document {
  articleSlug: string;
  sessionId: string;
  viewedAt: Date;
  duration: number;
  referrer: string;
}

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
  (mongoose.models.ArticleView as Model<IArticleView>) ||
  mongoose.model<IArticleView>('ArticleView', articleViewsSchema);

// =============================================================================
// ARTICLE LIKES
// =============================================================================
export interface IArticleLike extends Document {
  articleSlug: string;
  sessionId: string;
  createdAt: Date;
}

const articleLikesSchema = new Schema({
  articleSlug: { type: String, required: true },
  sessionId: { type: String, required: true, ref: 'AnonymousSession' },
  createdAt: { type: Date, default: Date.now },
});

articleLikesSchema.index({ articleSlug: 1 });
articleLikesSchema.index({ sessionId: 1 });
articleLikesSchema.index({ articleSlug: 1, sessionId: 1 }, { unique: true });

export const articleLikes =
  (mongoose.models.ArticleLike as Model<IArticleLike>) ||
  mongoose.model<IArticleLike>('ArticleLike', articleLikesSchema);

// =============================================================================
// ARTICLE BOOKMARKS
// =============================================================================
export interface IArticleBookmark extends Document {
  articleSlug: string;
  sessionId: string;
  createdAt: Date;
  syncedAt: Date;
}

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
  (mongoose.models.ArticleBookmark as Model<IArticleBookmark>) ||
  mongoose.model<IArticleBookmark>('ArticleBookmark', articleBookmarksSchema);

// =============================================================================
// COMMENTS
// =============================================================================
export interface IComment extends Document {
  articleSlug: string;
  sessionId: string;
  userId: mongoose.Types.ObjectId;
  parentId: mongoose.Types.ObjectId;
  content: string;
  authorName: string;
  authorEmail: string;
  status: string;
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}

const commentsSchema = new Schema({
  articleSlug: { type: String, required: true },
  sessionId: { type: String, required: true, ref: 'AnonymousSession' },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
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

export const comments =
  (mongoose.models.Comment as Model<IComment>) ||
  mongoose.model<IComment>('Comment', commentsSchema);

// =============================================================================
// COMMENT REACTIONS
// =============================================================================
export interface ICommentReaction extends Document {
  commentId: mongoose.Types.ObjectId;
  sessionId: string;
  emoji: string;
  createdAt: Date;
}

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
  (mongoose.models.CommentReaction as Model<ICommentReaction>) ||
  mongoose.model<ICommentReaction>('CommentReaction', commentReactionsSchema);

// =============================================================================
// COMMENT REPORTS
// =============================================================================
export interface ICommentReport extends Document {
  commentId: mongoose.Types.ObjectId;
  sessionId: string;
  reason: string;
  details: string;
  status: string;
  createdAt: Date;
  reviewedAt: Date;
}

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
  (mongoose.models.CommentReport as Model<ICommentReport>) ||
  mongoose.model<ICommentReport>('CommentReport', commentReportsSchema);

// =============================================================================
// STORY REPOSTS
// =============================================================================
export interface IStoryRepost extends Document {
  articleSlug: string;
  sessionId: string;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const storyRepostsSchema = new Schema({
  articleSlug: { type: String, required: true },
  sessionId: { type: String, required: true, ref: 'AnonymousSession' },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
});

storyRepostsSchema.index({ articleSlug: 1 });
storyRepostsSchema.index({ sessionId: 1 });
storyRepostsSchema.index({ articleSlug: 1, sessionId: 1 }, { unique: true });

export const storyReposts =
  (mongoose.models.StoryRepost as Model<IStoryRepost>) ||
  mongoose.model<IStoryRepost>('StoryRepost', storyRepostsSchema);

// =============================================================================
// AUTHOR FOLLOWS
// =============================================================================
export interface IAuthorFollow extends Document {
  authorId: mongoose.Types.ObjectId;
  sessionId: string;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const authorFollowsSchema = new Schema({
  authorId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  sessionId: { type: String, required: true, ref: 'AnonymousSession' },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
});

authorFollowsSchema.index({ authorId: 1 });
authorFollowsSchema.index({ sessionId: 1 });
authorFollowsSchema.index({ authorId: 1, sessionId: 1 }, { unique: true });

export const authorFollows =
  (mongoose.models.AuthorFollow as Model<IAuthorFollow>) ||
  mongoose.model<IAuthorFollow>('AuthorFollow', authorFollowsSchema);

// =============================================================================
// NEWSLETTER SUBSCRIBERS
// =============================================================================
export interface INewsletterSubscriber extends Document {
  email: string;
  sessionId: string;
  status: string;
  confirmationToken: string;
  subscribedAt: Date;
  confirmedAt: Date;
  unsubscribedAt: Date;
}

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
  (mongoose.models.NewsletterSubscriber as Model<INewsletterSubscriber>) ||
  mongoose.model<INewsletterSubscriber>('NewsletterSubscriber', newsletterSubscribersSchema);

// =============================================================================
// READING HISTORY
// =============================================================================
export interface IReadingHistory extends Document {
  articleSlug: string;
  sessionId: string;
  progress: number;
  readTime: number;
  completedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

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
  (mongoose.models.ReadingHistory as Model<IReadingHistory>) ||
  mongoose.model<IReadingHistory>('ReadingHistory', readingHistorySchema);

// =============================================================================
// USER PREFERENCES
// =============================================================================
export interface IUserPreference extends Document {
  sessionId: string;
  theme: string;
  fontSize: number;
  contentWidth: number;
  lineHeight: number;
  readingMode: string;
  createdAt: Date;
  updatedAt: Date;
}

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
  (mongoose.models.UserPreference as Model<IUserPreference>) ||
  mongoose.model<IUserPreference>('UserPreference', userPreferencesSchema);

// =============================================================================
// AUDIT LOGS
// =============================================================================
export interface IAuditLog extends Document {
  sessionId: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata: string;
  ipHash: string;
  createdAt: Date;
}

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
  (mongoose.models.AuditLog as Model<IAuditLog>) ||
  mongoose.model<IAuditLog>('AuditLog', auditLogsSchema);

// =============================================================================
// SITE SETTINGS
// Key/value store for site-wide admin configuration
// =============================================================================
export interface ISiteSetting extends Document {
  key: string;
  value: unknown;
  updatedAt: Date;
}

const siteSettingsSchema = new Schema({
  key: { type: String, required: true, unique: true },
  value: { type: Schema.Types.Mixed, required: true },
  updatedAt: { type: Date, default: Date.now },
});

export const siteSettings =
  (mongoose.models.SiteSetting as Model<ISiteSetting>) ||
  mongoose.model<ISiteSetting>('SiteSetting', siteSettingsSchema);

export const DEFAULT_SETTINGS = {
  siteName: 'BigBlog',
  siteTagline: 'A home for long-form writing.',
  allowRegistrations: true,
  newsletterEnabled: true,
  commentsModeration: 'approved',
  maintenanceMode: false,
} as const;

export async function getSiteSettings(): Promise<Record<string, unknown>> {
  const rows: ISiteSetting[] = await siteSettings.find().lean();
  const stored: Record<string, unknown> = {};
  for (const row of rows) stored[row.key] = row.value;
  return { ...DEFAULT_SETTINGS, ...stored };
}

export async function setSiteSettings(entries: Record<string, unknown>): Promise<void> {
  for (const [key, value] of Object.entries(entries)) {
    if (!(key in DEFAULT_SETTINGS)) continue;
    await siteSettings.findOneAndUpdate(
      { key },
      { key, value, updatedAt: new Date() },
      { upsert: true }
    );
  }
}
