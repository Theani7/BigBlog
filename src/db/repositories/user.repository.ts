import type { Database } from '../index';
import { readingHistory, userPreferences } from '../schema';
import type { InsertReadingHistory, InsertUserPreference, Theme, ReadingMode } from '../types';
import { DatabaseError } from '../../lib/errors';

export class ReadingHistoryRepository {
  constructor(_db: Database) {}

  async upsert(data: InsertReadingHistory) {
    try {
      const existing = await readingHistory.findOne({
        articleSlug: data.articleSlug,
        sessionId: data.sessionId,
      });

      if (existing) {
        await readingHistory.updateOne(
          { _id: existing._id },
          {
            $set: {
              progress: data.progress,
              readTime: data.readTime,
              completedAt: data.completedAt,
              updatedAt: new Date(),
            },
          }
        );
        return readingHistory.findById(existing._id);
      }

      return await readingHistory.create(data);
    } catch (_error) {
      throw new DatabaseError('Failed to update reading history');
    }
  }

  async getRecent(sessionId: string, limit = 5) {
    return readingHistory.find({ sessionId }).sort({ updatedAt: -1 }).limit(limit);
  }

  async getContinueReading(sessionId: string) {
    return readingHistory.findOne({ sessionId, progress: { $lt: 1 } }).sort({ updatedAt: -1 });
  }

  async getProgress(articleSlug: string, sessionId: string) {
    return readingHistory.findOne({ articleSlug, sessionId });
  }
}

export class UserPreferencesRepository {
  constructor(_db: Database) {}

  async upsert(sessionId: string, preferences: Partial<InsertUserPreference>) {
    try {
      const existing = await userPreferences.findOne({ sessionId });

      if (existing) {
        await userPreferences.updateOne(
          { _id: existing._id },
          { $set: { ...preferences, updatedAt: new Date() } }
        );
        return userPreferences.findById(existing._id);
      }

      return await userPreferences.create({ sessionId, ...preferences });
    } catch (_error) {
      throw new DatabaseError('Failed to update preferences');
    }
  }

  async get(sessionId: string) {
    return userPreferences.findOne({ sessionId });
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
