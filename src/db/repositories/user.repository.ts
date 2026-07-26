import { eq, and, desc, sql } from 'drizzle-orm';
import type { Database } from '../index';
import { readingHistory, userPreferences } from '../schema';
import type { InsertReadingHistory, InsertUserPreference, Theme, ReadingMode } from '../types';
import { DatabaseError } from '../../lib/errors';

export class ReadingHistoryRepository {
  constructor(private db: Database) {}

  async upsert(data: InsertReadingHistory) {
    try {
      const existing = await this.db.query.readingHistory.findFirst({
        where: and(
          eq(readingHistory.articleSlug, data.articleSlug),
          eq(readingHistory.sessionId, data.sessionId)
        ),
      });

      if (existing) {
        await this.db
          .update(readingHistory)
          .set({
            progress: data.progress,
            readTime: data.readTime,
            completedAt: data.completedAt,
            updatedAt: new Date(),
          })
          .where(eq(readingHistory.id, existing.id));
        return this.db.query.readingHistory.findFirst({
          where: eq(readingHistory.id, existing.id),
        });
      }

      return await this.db.insert(readingHistory).values(data).returning();
    } catch (_error) {
      throw new DatabaseError('Failed to update reading history');
    }
  }

  async getRecent(sessionId: string, limit = 5) {
    return this.db.query.readingHistory.findMany({
      where: eq(readingHistory.sessionId, sessionId),
      orderBy: [desc(readingHistory.updatedAt)],
      limit,
    });
  }

  async getContinueReading(sessionId: string) {
    return this.db.query.readingHistory.findFirst({
      where: and(eq(readingHistory.sessionId, sessionId), sql`${readingHistory.progress} < 1`),
      orderBy: [desc(readingHistory.updatedAt)],
    });
  }

  async getProgress(articleSlug: string, sessionId: string) {
    return this.db.query.readingHistory.findFirst({
      where: and(
        eq(readingHistory.articleSlug, articleSlug),
        eq(readingHistory.sessionId, sessionId)
      ),
    });
  }
}

export class UserPreferencesRepository {
  constructor(private db: Database) {}

  async upsert(sessionId: string, preferences: Partial<InsertUserPreference>) {
    try {
      const existing = await this.db.query.userPreferences.findFirst({
        where: eq(userPreferences.sessionId, sessionId),
      });

      if (existing) {
        await this.db
          .update(userPreferences)
          .set({ ...preferences, updatedAt: new Date() })
          .where(eq(userPreferences.id, existing.id));
        return this.db.query.userPreferences.findFirst({
          where: eq(userPreferences.id, existing.id),
        });
      }

      return await this.db
        .insert(userPreferences)
        .values({ sessionId, ...preferences } as InsertUserPreference)
        .returning();
    } catch (_error) {
      throw new DatabaseError('Failed to update preferences');
    }
  }

  async get(sessionId: string) {
    return this.db.query.userPreferences.findFirst({
      where: eq(userPreferences.sessionId, sessionId),
    });
  }

  async updateTheme(sessionId: string, theme: Theme) {
    return this.upsert(sessionId, { theme });
  }

  async updateFontSize(sessionId: string, fontSize: number) {
    return this.upsert(sessionId, { fontSize });
  }

  async updateReadingMode(sessionId: string, readingMode: ReadingMode) {
    return this.upsert(sessionId, { readingMode });
  }
}
