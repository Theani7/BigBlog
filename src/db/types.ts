import type { InferSchemaType } from 'mongoose';

import {
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
} from './schema';

// =============================================================================
// SESSION TYPES
// =============================================================================
export type AnonymousSession = InferSchemaType<typeof anonymousSessions.schema>;
export type InsertAnonymousSession = Partial<AnonymousSession>;

// =============================================================================
// ARTICLE VIEW TYPES
// =============================================================================
export type ArticleView = InferSchemaType<typeof articleViews.schema>;
export type InsertArticleView = Partial<ArticleView>;

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
export type ArticleLike = InferSchemaType<typeof articleLikes.schema>;
export type InsertArticleLike = Partial<ArticleLike>;

// =============================================================================
// ARTICLE BOOKMARK TYPES
// =============================================================================
export type ArticleBookmark = InferSchemaType<typeof articleBookmarks.schema>;
export type InsertArticleBookmark = Partial<ArticleBookmark>;

// =============================================================================
// COMMENT TYPES
// =============================================================================
export type Comment = InferSchemaType<typeof comments.schema>;
export type InsertComment = Partial<Comment>;

export type CommentStatus = 'pending' | 'approved' | 'rejected' | 'spam';

export interface CommentWithReplies extends Comment {
  replies?: CommentWithReplies[];
  reactionCounts?: Record<string, number>;
}

// =============================================================================
// COMMENT REACTION TYPES
// =============================================================================
export type CommentReaction = InferSchemaType<typeof commentReactions.schema>;
export type InsertCommentReaction = Partial<CommentReaction>;

// =============================================================================
// COMMENT REPORT TYPES
// =============================================================================
export type CommentReport = InferSchemaType<typeof commentReports.schema>;
export type InsertCommentReport = Partial<CommentReport>;

export type ReportReason = 'spam' | 'abuse' | 'off-topic' | 'other';

// =============================================================================
// NEWSLETTER TYPES
// =============================================================================
export type NewsletterSubscriber = InferSchemaType<typeof newsletterSubscribers.schema>;
export type InsertNewsletterSubscriber = Partial<NewsletterSubscriber>;

export type NewsletterStatus = 'pending' | 'confirmed' | 'unsubscribed';

// =============================================================================
// READING HISTORY TYPES
// =============================================================================
export type ReadingHistoryEntry = InferSchemaType<typeof readingHistory.schema>;
export type InsertReadingHistory = Partial<ReadingHistoryEntry>;

// =============================================================================
// USER PREFERENCE TYPES
// =============================================================================
export type UserPreference = InferSchemaType<typeof userPreferences.schema>;
export type InsertUserPreference = Partial<UserPreference>;

export type Theme = 'light' | 'dark' | 'system';
export type ReadingMode = 'default' | 'reader' | 'focused';

// =============================================================================
// AUDIT LOG TYPES
// =============================================================================
export type AuditLog = InferSchemaType<typeof auditLogs.schema>;
export type InsertAuditLog = Partial<AuditLog>;

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
  parentId?: number | string;
}

export interface NewsletterInput {
  email: string;
}

export interface ReportInput {
  commentId: string;
  reason: ReportReason;
  details?: string;
}
