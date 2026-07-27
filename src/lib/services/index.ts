import type { Database } from '../../db';
import { createRepositories, type Repositories } from '../../db/repositories';
import { hashIp, generateSessionId } from '../validation/index';

export class SessionService {
  private repos: Repositories;

  constructor(db: Database) {
    this.repos = createRepositories(db);
  }

  async getOrCreateSession(fingerprint: string, ip?: string, userAgent?: string): Promise<string> {
    const session = await this.repos.sessions.findByFingerprint(fingerprint);
    if (session) {
      await this.repos.sessions.updateLastActive(session.id);
      return session.id;
    }

    const ipHash = ip ? await hashIp(ip) : undefined;
    const newSession = await this.repos.sessions.create({
      id: generateSessionId(),
      fingerprint,
      userAgent,
      ipHash,
    });

    return newSession[0]!.id;
  }

  async getSession(sessionId: string) {
    return this.repos.sessions.findById(sessionId);
  }
}

export class ViewsService {
  private repos: Repositories;

  constructor(db: Database) {
    this.repos = createRepositories(db);
  }

  async trackView(articleSlug: string, sessionId: string, referrer?: string) {
    // Check if already viewed today (prevent refresh inflation)
    const hasViewed = await this.repos.views.hasViewedToday(articleSlug, sessionId);
    if (hasViewed) {
      return { recorded: false, reason: 'already_viewed_today' };
    }

    await this.repos.views.recordView({
      articleSlug,
      sessionId,
      referrer,
    });

    return { recorded: true };
  }

  async getStats(articleSlug: string) {
    return this.repos.views.getViewStats(articleSlug);
  }

  async getMultipleStats(slugs: string[]) {
    const stats = await Promise.all(
      slugs.map(async (slug) => ({
        slug,
        stats: await this.getStats(slug),
      }))
    );
    return stats.reduce(
      (acc, { slug, stats }) => {
        acc[slug] = stats;
        return acc;
      },
      {} as Record<string, Awaited<ReturnType<typeof this.getStats>>>
    );
  }
}

export class LikesService {
  private repos: Repositories;

  constructor(db: Database) {
    this.repos = createRepositories(db);
  }

  async toggle(articleSlug: string, sessionId: string) {
    return this.repos.likes.toggleLike(articleSlug, sessionId);
  }

  async getCount(articleSlug: string) {
    return this.repos.likes.getCount(articleSlug);
  }

  async hasLiked(articleSlug: string, sessionId: string) {
    return this.repos.likes.hasLiked(articleSlug, sessionId);
  }

  async getMultipleCounts(slugs: string[]) {
    const counts = await Promise.all(
      slugs.map(async (slug) => ({
        slug,
        count: await this.getCount(slug),
      }))
    );
    return counts.reduce(
      (acc, { slug, count }) => {
        acc[slug] = count;
        return acc;
      },
      {} as Record<string, number>
    );
  }
}

export class BookmarksService {
  private repos: Repositories;

  constructor(db: Database) {
    this.repos = createRepositories(db);
  }

  async toggle(articleSlug: string, sessionId: string) {
    return this.repos.bookmarks.toggleBookmark(articleSlug, sessionId);
  }

  async getBookmarks(sessionId: string) {
    return this.repos.bookmarks.getBookmarks(sessionId);
  }

  async hasBookmarked(articleSlug: string, sessionId: string) {
    return this.repos.bookmarks.hasBookmarked(articleSlug, sessionId);
  }
}

export class CommentsService {
  private repos: Repositories;

  constructor(db: Database) {
    this.repos = createRepositories(db);
  }

  async create(
    articleSlug: string,
    sessionId: string,
    data: {
      content: string;
      authorName: string;
      authorEmail?: string;
      parentId?: number;
    }
  ) {
    const comment = await this.repos.comments.create({
      articleSlug,
      sessionId,
      content: data.content,
      authorName: data.authorName,
      authorEmail: data.authorEmail,
      parentId: data.parentId,
    });

    await this.repos.auditLogs.log({
      sessionId,
      action: 'comment.created',
      entityType: 'comment',
      entityId: String(comment[0]!.id),
    });

    return comment[0]!;
  }

  async getThreaded(articleSlug: string) {
    return this.repos.comments.findThreaded(articleSlug);
  }

  async getCount(articleSlug: string) {
    return this.repos.comments.getCount(articleSlug);
  }

  async edit(commentId: number, sessionId: string, content: string) {
    const comment = await this.repos.comments.findById(commentId);
    if (!comment || comment.sessionId !== sessionId) {
      throw new Error('Unauthorized');
    }

    return this.repos.comments.update(commentId, content);
  }

  async delete(commentId: number, sessionId: string) {
    const comment = await this.repos.comments.findById(commentId);
    if (!comment || comment.sessionId !== sessionId) {
      throw new Error('Unauthorized');
    }

    return this.repos.comments.softDelete(commentId);
  }

  async react(commentId: number, sessionId: string, emoji: string) {
    return this.repos.commentReactions.toggle(commentId, sessionId, emoji);
  }

  async report(commentId: number, sessionId: string, reason: string, details?: string) {
    const hasReported = await this.repos.commentReports.hasReported(commentId, sessionId);
    if (hasReported) {
      throw new Error('Already reported');
    }

    return this.repos.commentReports.create({
      commentId,
      sessionId,
      reason: reason as 'spam' | 'abuse' | 'off-topic' | 'other',
      details,
    });
  }
}

export class NewsletterService {
  private repos: Repositories;

  constructor(db: Database) {
    this.repos = createRepositories(db);
  }

  async subscribe(email: string, sessionId?: string) {
    return this.repos.newsletter.subscribe(email, sessionId);
  }

  async confirm(token: string) {
    return this.repos.newsletter.confirm(token);
  }

  async unsubscribe(email: string) {
    return this.repos.newsletter.unsubscribe(email);
  }

  async getStats() {
    return this.repos.newsletter.getStats();
  }
}

export class ReadingHistoryService {
  private repos: Repositories;

  constructor(db: Database) {
    this.repos = createRepositories(db);
  }

  async updateProgress(
    articleSlug: string,
    sessionId: string,
    progress: number,
    readTime?: number
  ) {
    return this.repos.readingHistory.upsert({
      articleSlug,
      sessionId,
      progress,
      readTime,
      completedAt: progress >= 1 ? new Date() : undefined,
    });
  }

  async getRecent(sessionId: string, limit = 5) {
    return this.repos.readingHistory.getRecent(sessionId, limit);
  }

  async getContinueReading(sessionId: string) {
    return this.repos.readingHistory.getContinueReading(sessionId);
  }

  async getProgress(articleSlug: string, sessionId: string) {
    return this.repos.readingHistory.getProgress(articleSlug, sessionId);
  }
}

export class UserPreferencesService {
  private repos: Repositories;

  constructor(db: Database) {
    this.repos = createRepositories(db);
  }

  async get(sessionId: string) {
    return this.repos.userPreferences.get(sessionId);
  }

  async update(
    sessionId: string,
    preferences: {
      theme?: 'light' | 'dark' | 'system';
      fontSize?: number;
      contentWidth?: number;
      lineHeight?: number;
      readingMode?: 'default' | 'reader' | 'focused';
    }
  ) {
    return this.repos.userPreferences.upsert(sessionId, preferences);
  }
}

export class AuditService {
  private repos: Repositories;

  constructor(db: Database) {
    this.repos = createRepositories(db);
  }

  async log(data: {
    sessionId?: string;
    action: string;
    entityType: string;
    entityId?: string;
    metadata?: Record<string, unknown>;
    ip?: string;
  }) {
    const ipHash = data.ip ? await hashIp(data.ip) : undefined;
    return this.repos.auditLogs.log({
      sessionId: data.sessionId,
      action: data.action,
      entityType: data.entityType,
      entityId: data.entityId,
      metadata: data.metadata ? JSON.stringify(data.metadata) : undefined,
      ipHash,
    });
  }

  async getStats(since?: Date) {
    return this.repos.auditLogs.getStats(since);
  }
}
