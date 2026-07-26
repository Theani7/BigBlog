import { eq, and, desc, sql, gte, count } from 'drizzle-orm';
import type { Database } from '../index';
import { anonymousSessions, articleViews, articleLikes, articleBookmarks } from '../schema';
import type { InsertAnonymousSession, InsertArticleView, ArticleViewStats } from '../types';
import { DatabaseError } from '../../lib/errors';

export class SessionRepository {
  constructor(private db: Database) {}

  async create(data: InsertAnonymousSession) {
    try {
      return await this.db.insert(anonymousSessions).values(data).returning();
    } catch (_error) {
      throw new DatabaseError('Failed to create session');
    }
  }

  async findById(id: string) {
    return this.db.query.anonymousSessions.findFirst({
      where: eq(anonymousSessions.id, id),
    });
  }

  async findByFingerprint(fingerprint: string) {
    return this.db.query.anonymousSessions.findFirst({
      where: eq(anonymousSessions.fingerprint, fingerprint),
    });
  }

  async upsertByFingerprint(fingerprint: string, data: Partial<InsertAnonymousSession>) {
    const existing = await this.findByFingerprint(fingerprint);
    if (existing) {
      await this.db
        .update(anonymousSessions)
        .set({ ...data, updatedAt: new Date(), lastActiveAt: new Date() })
        .where(eq(anonymousSessions.id, existing.id));
      return this.findById(existing.id);
    }
    return this.create({
      id: crypto.randomUUID(),
      fingerprint,
      ...data,
    });
  }

  async updateLastActive(id: string) {
    await this.db
      .update(anonymousSessions)
      .set({ lastActiveAt: new Date() })
      .where(eq(anonymousSessions.id, id));
  }
}

export class ViewsRepository {
  constructor(private db: Database) {}

  async recordView(data: InsertArticleView) {
    try {
      return await this.db.insert(articleViews).values(data).returning();
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

    const [totalViews] = await this.db
      .select({ count: count() })
      .from(articleViews)
      .where(eq(articleViews.articleSlug, articleSlug));

    const [uniqueViews] = await this.db
      .select({ count: count(sql`DISTINCT ${articleViews.sessionId}`) })
      .from(articleViews)
      .where(eq(articleViews.articleSlug, articleSlug));

    const [dailyViews] = await this.db
      .select({ count: count() })
      .from(articleViews)
      .where(
        and(eq(articleViews.articleSlug, articleSlug), gte(articleViews.viewedAt, todayStart))
      );

    const [weeklyViews] = await this.db
      .select({ count: count() })
      .from(articleViews)
      .where(and(eq(articleViews.articleSlug, articleSlug), gte(articleViews.viewedAt, weekStart)));

    const [monthlyViews] = await this.db
      .select({ count: count() })
      .from(articleViews)
      .where(
        and(eq(articleViews.articleSlug, articleSlug), gte(articleViews.viewedAt, monthStart))
      );

    return {
      totalViews: totalViews?.count ?? 0,
      uniqueViews: uniqueViews?.count ?? 0,
      dailyViews: dailyViews?.count ?? 0,
      weeklyViews: weeklyViews?.count ?? 0,
      monthlyViews: monthlyViews?.count ?? 0,
    };
  }

  async hasViewedToday(articleSlug: string, sessionId: string): Promise<boolean> {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [existing] = await this.db
      .select({ id: articleViews.id })
      .from(articleViews)
      .where(
        and(
          eq(articleViews.articleSlug, articleSlug),
          eq(articleViews.sessionId, sessionId),
          gte(articleViews.viewedAt, todayStart)
        )
      )
      .limit(1);

    return !!existing;
  }
}

export class LikesRepository {
  constructor(private db: Database) {}

  async toggleLike(
    articleSlug: string,
    sessionId: string
  ): Promise<{ liked: boolean; count: number }> {
    const existing = await this.db.query.articleLikes.findFirst({
      where: and(eq(articleLikes.articleSlug, articleSlug), eq(articleLikes.sessionId, sessionId)),
    });

    if (existing) {
      await this.db
        .delete(articleLikes)
        .where(
          and(eq(articleLikes.articleSlug, articleSlug), eq(articleLikes.sessionId, sessionId))
        );
    } else {
      await this.db.insert(articleLikes).values({ articleSlug, sessionId });
    }

    const countResult = await this.getCount(articleSlug);
    return { liked: !existing, count: countResult };
  }

  async getCount(articleSlug: string): Promise<number> {
    const [result] = await this.db
      .select({ count: count() })
      .from(articleLikes)
      .where(eq(articleLikes.articleSlug, articleSlug));

    return result?.count ?? 0;
  }

  async hasLiked(articleSlug: string, sessionId: string): Promise<boolean> {
    const existing = await this.db.query.articleLikes.findFirst({
      where: and(eq(articleLikes.articleSlug, articleSlug), eq(articleLikes.sessionId, sessionId)),
    });

    return !!existing;
  }
}

export class BookmarksRepository {
  constructor(private db: Database) {}

  async toggleBookmark(articleSlug: string, sessionId: string): Promise<{ bookmarked: boolean }> {
    const existing = await this.db.query.articleBookmarks.findFirst({
      where: and(
        eq(articleBookmarks.articleSlug, articleSlug),
        eq(articleBookmarks.sessionId, sessionId)
      ),
    });

    if (existing) {
      await this.db
        .delete(articleBookmarks)
        .where(
          and(
            eq(articleBookmarks.articleSlug, articleSlug),
            eq(articleBookmarks.sessionId, sessionId)
          )
        );
    } else {
      await this.db.insert(articleBookmarks).values({ articleSlug, sessionId });
    }

    return { bookmarked: !existing };
  }

  async getBookmarks(sessionId: string) {
    return this.db.query.articleBookmarks.findMany({
      where: eq(articleBookmarks.sessionId, sessionId),
      orderBy: [desc(articleBookmarks.createdAt)],
    });
  }

  async hasBookmarked(articleSlug: string, sessionId: string): Promise<boolean> {
    const existing = await this.db.query.articleBookmarks.findFirst({
      where: and(
        eq(articleBookmarks.articleSlug, articleSlug),
        eq(articleBookmarks.sessionId, sessionId)
      ),
    });

    return !!existing;
  }
}
