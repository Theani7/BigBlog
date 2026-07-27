import { eq, and, desc, count, sql } from 'drizzle-orm';
import type { Database } from '../index';
import { comments, commentReactions, commentReports } from '../schema';
import type { InsertComment, CommentStatus, InsertCommentReport } from '../types';
import { DatabaseError } from '../../lib/errors';

export class CommentsRepository {
  constructor(private db: Database) {}

  async create(data: InsertComment) {
    try {
      return await this.db.insert(comments).values(data).returning();
    } catch (_error) {
      throw new DatabaseError('Failed to create comment');
    }
  }

  async findById(id: number) {
    return this.db.query.comments.findFirst({
      where: eq(comments.id, id),
    });
  }

  async findByArticle(articleSlug: string, status: CommentStatus = 'approved') {
    return this.db.query.comments.findMany({
      where: and(
        eq(comments.articleSlug, articleSlug),
        eq(comments.status, status),
        sql`${comments.deletedAt} IS NULL`
      ),
      orderBy: [desc(comments.createdAt)],
      with: {
        reactions: true,
      },
    });
  }

  async findThreaded(articleSlug: string, status: CommentStatus = 'approved') {
    const allComments = await this.findByArticle(articleSlug, status);

    // Build threaded structure
    const commentMap = new Map<
      number,
      (typeof allComments)[0] & {
        replies: typeof allComments;
        reactionCounts?: Record<string, number>;
      }
    >();
    const rootComments: typeof allComments = [];

    for (const comment of allComments) {
      commentMap.set(comment.id, { ...comment, replies: [] });
    }

    for (const comment of allComments) {
      const mapped = commentMap.get(comment.id)!;
      if (comment.parentId && commentMap.has(comment.parentId)) {
        commentMap.get(comment.parentId)!.replies.push(mapped);
      } else {
        rootComments.push(mapped);
      }
    }

    // Calculate reaction counts
    for (const comment of allComments) {
      const mapped = commentMap.get(comment.id)!;
      if (mapped.reactions) {
        mapped.reactionCounts = mapped.reactions.reduce<Record<string, number>>(
          (acc, r) => {
            acc[r.emoji] = (acc[r.emoji] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>
        );
      }
    }

    return rootComments;
  }

  async update(id: number, content: string) {
    try {
      return await this.db
        .update(comments)
        .set({ content, isEdited: true, updatedAt: new Date() })
        .where(eq(comments.id, id))
        .returning();
    } catch (_error) {
      throw new DatabaseError('Failed to update comment');
    }
  }

  async softDelete(id: number) {
    try {
      return await this.db
        .update(comments)
        .set({ deletedAt: new Date() })
        .where(eq(comments.id, id))
        .returning();
    } catch (_error) {
      throw new DatabaseError('Failed to delete comment');
    }
  }

  async updateStatus(id: number, status: CommentStatus) {
    try {
      return await this.db.update(comments).set({ status }).where(eq(comments.id, id)).returning();
    } catch (_error) {
      throw new DatabaseError('Failed to update comment status');
    }
  }

  async getCount(articleSlug: string, status: CommentStatus = 'approved'): Promise<number> {
    const [result] = await this.db
      .select({ count: count() })
      .from(comments)
      .where(
        and(
          eq(comments.articleSlug, articleSlug),
          eq(comments.status, status),
          sql`${comments.deletedAt} IS NULL`
        )
      );

    return result?.count ?? 0;
  }
}

export class CommentReactionsRepository {
  constructor(private db: Database) {}

  async toggle(commentId: number, sessionId: string, emoji: string): Promise<{ added: boolean }> {
    const existing = await this.db.query.commentReactions.findFirst({
      where: and(
        eq(commentReactions.commentId, commentId),
        eq(commentReactions.sessionId, sessionId),
        eq(commentReactions.emoji, emoji)
      ),
    });

    if (existing) {
      await this.db.delete(commentReactions).where(eq(commentReactions.id, existing.id));
      return { added: false };
    }

    await this.db.insert(commentReactions).values({ commentId, sessionId, emoji });
    return { added: true };
  }

  async getReactions(commentId: number) {
    return this.db.query.commentReactions.findMany({
      where: eq(commentReactions.commentId, commentId),
    });
  }
}

export class CommentReportsRepository {
  constructor(private db: Database) {}

  async create(data: InsertCommentReport) {
    try {
      return await this.db.insert(commentReports).values(data).returning();
    } catch (_error) {
      throw new DatabaseError('Failed to create report');
    }
  }

  async findByStatus(status: 'pending' | 'reviewed' | 'resolved') {
    return this.db.query.commentReports.findMany({
      where: eq(commentReports.status, status),
      orderBy: [desc(commentReports.createdAt)],
    });
  }

  async updateStatus(id: number, status: 'pending' | 'reviewed' | 'resolved') {
    return await this.db
      .update(commentReports)
      .set({ status, reviewedAt: new Date() })
      .where(eq(commentReports.id, id))
      .returning();
  }

  async hasReported(commentId: number, sessionId: string): Promise<boolean> {
    const existing = await this.db.query.commentReports.findFirst({
      where: and(eq(commentReports.commentId, commentId), eq(commentReports.sessionId, sessionId)),
    });

    return !!existing;
  }
}
