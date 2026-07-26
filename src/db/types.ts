import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import type {
  anonymousSessions,
  articleViews,
  articleLikes,
  articleBookmarks,
  comments,
  commentReactions,
  commentReports,
  newsletterSubscribers,
  readingHistory,
  userPreferences,
  auditLogs,
} from '../db/schema';

// =============================================================================
// SESSION TYPES
// =============================================================================
export type AnonymousSession = InferSelectModel<typeof anonymousSessions>;
export type InsertAnonymousSession = InferInsertModel<typeof anonymousSessions>;

// =============================================================================
// ARTICLE VIEW TYPES
// =============================================================================
export type ArticleView = InferSelectModel<typeof articleViews>;
export type InsertArticleView = InferInsertModel<typeof articleViews>;

export interface ArticleViewStats {
  totalViews: number;
  uniqueViews: number;
  dailyViews: number;
  weeklyViews: number;
  monthlyViews: number;
}

// =============================================================================
// ARTICLE LIKE TYPES
// =============================================================================
export type ArticleLike = InferSelectModel<typeof articleLikes>;
export type InsertArticleLike = InferInsertModel<typeof articleLikes>;

// =============================================================================
// ARTICLE BOOKMARK TYPES
// =============================================================================
export type ArticleBookmark = InferSelectModel<typeof articleBookmarks>;
export type InsertArticleBookmark = InferInsertModel<typeof articleBookmarks>;

// =============================================================================
// COMMENT TYPES
// =============================================================================
export type Comment = InferSelectModel<typeof comments>;
export type InsertComment = InferInsertModel<typeof comments>;

export type CommentStatus = 'pending' | 'approved' | 'rejected' | 'spam';

export interface CommentWithReplies extends Comment {
  replies?: CommentWithReplies[];
  reactionCounts?: Record<string, number>;
}

// =============================================================================
// COMMENT REACTION TYPES
// =============================================================================
export type CommentReaction = InferSelectModel<typeof commentReactions>;
export type InsertCommentReaction = InferInsertModel<typeof commentReactions>;

// =============================================================================
// COMMENT REPORT TYPES
// =============================================================================
export type CommentReport = InferSelectModel<typeof commentReports>;
export type InsertCommentReport = InferInsertModel<typeof commentReports>;

export type ReportReason = 'spam' | 'abuse' | 'off-topic' | 'other';

// =============================================================================
// NEWSLETTER TYPES
// =============================================================================
export type NewsletterSubscriber = InferSelectModel<typeof newsletterSubscribers>;
export type InsertNewsletterSubscriber = InferInsertModel<typeof newsletterSubscribers>;

export type NewsletterStatus = 'pending' | 'confirmed' | 'unsubscribed';

// =============================================================================
// READING HISTORY TYPES
// =============================================================================
export type ReadingHistoryEntry = InferSelectModel<typeof readingHistory>;
export type InsertReadingHistory = InferInsertModel<typeof readingHistory>;

// =============================================================================
// USER PREFERENCE TYPES
// =============================================================================
export type UserPreference = InferSelectModel<typeof userPreferences>;
export type InsertUserPreference = InferInsertModel<typeof userPreferences>;

export type Theme = 'light' | 'dark' | 'system';
export type ReadingMode = 'default' | 'reader' | 'focused';

// =============================================================================
// AUDIT LOG TYPES
// =============================================================================
export type AuditLog = InferSelectModel<typeof auditLogs>;
export type InsertAuditLog = InferInsertModel<typeof auditLogs>;

// =============================================================================
// API RESPONSE TYPES
// =============================================================================
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// =============================================================================
// VALIDATION TYPES
// =============================================================================
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface CommentInput {
  articleSlug: string;
  content: string;
  authorName: string;
  authorEmail?: string;
  parentId?: number;
}

export interface NewsletterInput {
  email: string;
}

export interface ReportInput {
  commentId: number;
  reason: ReportReason;
  details?: string;
}
