import type { Database } from '../index';
import {
  SessionRepository,
  ViewsRepository,
  LikesRepository,
  BookmarksRepository,
} from './session.repository';
import {
  CommentsRepository,
  CommentReactionsRepository,
  CommentReportsRepository,
} from './comments.repository';
import { NewsletterRepository } from './newsletter.repository';
import { ReadingHistoryRepository, UserPreferencesRepository } from './user.repository';
import { AuditLogRepository } from './audit.repository';
import { AnalyticsRepository } from './analytics.repository';

export interface Repositories {
  sessions: SessionRepository;
  views: ViewsRepository;
  likes: LikesRepository;
  bookmarks: BookmarksRepository;
  comments: CommentsRepository;
  commentReactions: CommentReactionsRepository;
  commentReports: CommentReportsRepository;
  newsletter: NewsletterRepository;
  readingHistory: ReadingHistoryRepository;
  userPreferences: UserPreferencesRepository;
  auditLogs: AuditLogRepository;
  analytics: AnalyticsRepository;
}

export function createRepositories(db: Database): Repositories {
  return {
    sessions: new SessionRepository(db),
    views: new ViewsRepository(db),
    likes: new LikesRepository(db),
    bookmarks: new BookmarksRepository(db),
    comments: new CommentsRepository(db),
    commentReactions: new CommentReactionsRepository(db),
    commentReports: new CommentReportsRepository(db),
    newsletter: new NewsletterRepository(db),
    readingHistory: new ReadingHistoryRepository(db),
    userPreferences: new UserPreferencesRepository(db),
    auditLogs: new AuditLogRepository(db),
    analytics: new AnalyticsRepository(db),
  };
}

export {
  SessionRepository,
  ViewsRepository,
  LikesRepository,
  BookmarksRepository,
  CommentsRepository,
  CommentReactionsRepository,
  CommentReportsRepository,
  NewsletterRepository,
  ReadingHistoryRepository,
  UserPreferencesRepository,
  AuditLogRepository,
  AnalyticsRepository,
};
