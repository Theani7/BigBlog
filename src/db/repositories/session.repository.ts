import type { Database } from '../index';
import { anonymousSessions, articleViews, articleLikes, articleBookmarks } from '../schema';
import type { InsertAnonymousSession, InsertArticleView, ArticleViewStats } from '../types';
import { DatabaseError } from '../../lib/errors';

export class SessionRepository {
  constructor(_db: Database) {}

  async create(data: InsertAnonymousSession) {
    try {
      return await anonymousSessions.create(data);
    } catch (_error) {
      throw new DatabaseError('Failed to create session');
    }
  }

  async findById(id: string) {
    return anonymousSessions.findOne({ id });
  }

  async findByFingerprint(fingerprint: string) {
    return anonymousSessions.findOne({ fingerprint });
  }

  async upsertByFingerprint(fingerprint: string, data: Partial<InsertAnonymousSession>) {
    const existing = await this.findByFingerprint(fingerprint);
    if (existing) {
      await anonymousSessions.updateOne(
        { _id: existing._id },
        { $set: { ...data, updatedAt: new Date(), lastActiveAt: new Date() } }
      );
      return this.findById(existing.id);
    }
    return this.create({
      id: crypto.randomUUID(),
      fingerprint,
      ...data,
    });
  }

  async updateLastActive(id: string) {
    await anonymousSessions.updateOne(
      { id },
      { $set: { lastActiveAt: new Date() } }
    );
  }
}

export class ViewsRepository {
  constructor(_db: Database) {}

  async recordView(data: InsertArticleView) {
    try {
      return await articleViews.create(data);
    } catch (_error) {
      throw new DatabaseError('Failed to record view');
    }
  }

  async getViewStats(articleSlug: string): Promise<ArticleViewStats> {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 7);
    const monthStart = new Date(todayStart);
    monthStart.setMonth(monthStart.getMonth() - 1);

    const totalViews = await articleViews.countDocuments({ articleSlug });
    const uniqueViewsResult = await articleViews.distinct('sessionId', { articleSlug });
    const uniqueViews = uniqueViewsResult.length;

    const dailyViews = await articleViews.countDocuments({ articleSlug, viewedAt: { $gte: todayStart } });
    const weeklyViews = await articleViews.countDocuments({ articleSlug, viewedAt: { $gte: weekStart } });
    const monthlyViews = await articleViews.countDocuments({ articleSlug, viewedAt: { $gte: monthStart } });

    return {
      totalViews,
      uniqueViews,
      dailyViews,
      weeklyViews,
      monthlyViews,
    };
  }

  async hasViewedToday(articleSlug: string, sessionId: string): Promise<boolean> {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const existing = await articleViews.findOne({
      articleSlug,
      sessionId,
      viewedAt: { $gte: todayStart }
    });

    return !!existing;
  }
}

export class LikesRepository {
  constructor(_db: Database) {}

  async toggleLike(
    articleSlug: string,
    sessionId: string
  ): Promise<{ liked: boolean; count: number }> {
    const existing = await articleLikes.findOne({ articleSlug, sessionId });

    if (existing) {
      await articleLikes.deleteOne({ _id: existing._id });
    } else {
      await articleLikes.create({ articleSlug, sessionId });
    }

    const count = await this.getCount(articleSlug);
    return { liked: !existing, count };
  }

  async getCount(articleSlug: string): Promise<number> {
    return articleLikes.countDocuments({ articleSlug });
  }

  async hasLiked(articleSlug: string, sessionId: string): Promise<boolean> {
    const existing = await articleLikes.findOne({ articleSlug, sessionId });
    return !!existing;
  }
}

export class BookmarksRepository {
  constructor(_db: Database) {}

  async toggleBookmark(articleSlug: string, sessionId: string): Promise<{ bookmarked: boolean }> {
    const existing = await articleBookmarks.findOne({ articleSlug, sessionId });

    if (existing) {
      await articleBookmarks.deleteOne({ _id: existing._id });
    } else {
      await articleBookmarks.create({ articleSlug, sessionId });
    }

    return { bookmarked: !existing };
  }

  async getBookmarks(sessionId: string) {
    return articleBookmarks.find({ sessionId }).sort({ createdAt: -1 });
  }

  async hasBookmarked(articleSlug: string, sessionId: string): Promise<boolean> {
    const existing = await articleBookmarks.findOne({ articleSlug, sessionId });
    return !!existing;
  }
}
