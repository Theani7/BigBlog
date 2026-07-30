import type { Database } from '../index';
import { comments, commentReactions, commentReports } from '../schema';
import type { InsertComment, CommentStatus, InsertCommentReport } from '../types';
import { DatabaseError } from '../../lib/errors';

export class CommentsRepository {
  constructor(_db: Database) {}

  async create(data: InsertComment) {
    try {
      return await comments.create(data);
    } catch (_error) {
      throw new DatabaseError('Failed to create comment');
    }
  }

  async findById(id: number) {
    return comments.findOne({ id });
  }

  async findByArticle(articleSlug: string, status: CommentStatus = 'approved') {
    return comments.find({
      articleSlug,
      status,
      deletedAt: null
    }).sort({ createdAt: -1 }).populate('reactions');
  }

  async findThreaded(articleSlug: string, status: CommentStatus = 'approved') {
    const allComments = await this.findByArticle(articleSlug, status);

    const commentMap = new Map<
      number,
      (typeof allComments)[0] & {
        replies: typeof allComments;
        reactionCounts?: Record<string, number>;
      }
    >();
    const rootComments: typeof allComments = [];

    for (const comment of allComments) {
      commentMap.set(comment.id, { ...comment.toObject(), replies: [] });
    }

    for (const comment of allComments) {
      const mapped = commentMap.get(comment.id)!;
      if (comment.parentId && commentMap.has(comment.parentId)) {
        commentMap.get(comment.parentId)!.replies.push(mapped);
      } else {
        rootComments.push(mapped);
      }
    }

    for (const comment of allComments) {
      const mapped = commentMap.get(comment.id)!;
      if (mapped.reactions) {
        mapped.reactionCounts = mapped.reactions.reduce(
          (acc: Record<string, number>, r: any) => {
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
      await comments.updateOne(
        { id },
        { $set: { content, isEdited: true, updatedAt: new Date() } }
      );
      return comments.findOne({ id });
    } catch (_error) {
      throw new DatabaseError('Failed to update comment');
    }
  }

  async softDelete(id: number) {
    try {
      await comments.updateOne(
        { id },
        { $set: { deletedAt: new Date() } }
      );
      return comments.findOne({ id });
    } catch (_error) {
      throw new DatabaseError('Failed to delete comment');
    }
  }

  async updateStatus(id: number, status: CommentStatus) {
    try {
      await comments.updateOne(
        { id },
        { $set: { status } }
      );
      return comments.findOne({ id });
    } catch (_error) {
      throw new DatabaseError('Failed to update comment status');
    }
  }

  async getCount(articleSlug: string, status: CommentStatus = 'approved'): Promise<number> {
    return comments.countDocuments({
      articleSlug,
      status,
      deletedAt: null
    });
  }
}

export class CommentReactionsRepository {
  constructor(_db: Database) {}

  async toggle(commentId: number, sessionId: string, emoji: string): Promise<{ added: boolean }> {
    const existing = await commentReactions.findOne({
      commentId,
      sessionId,
      emoji
    });

    if (existing) {
      await commentReactions.deleteOne({ _id: existing._id });
      return { added: false };
    }

    await commentReactions.create({ commentId, sessionId, emoji });
    return { added: true };
  }

  async getReactions(commentId: number) {
    return commentReactions.find({ commentId });
  }
}

export class CommentReportsRepository {
  constructor(_db: Database) {}

  async create(data: InsertCommentReport) {
    try {
      return await commentReports.create(data);
    } catch (_error) {
      throw new DatabaseError('Failed to create report');
    }
  }

  async findByStatus(status: 'pending' | 'reviewed' | 'resolved') {
    return commentReports.find({ status }).sort({ createdAt: -1 });
  }

  async updateStatus(id: number, status: 'pending' | 'reviewed' | 'resolved') {
    await commentReports.updateOne(
      { id },
      { $set: { status, reviewedAt: new Date() } }
    );
    return commentReports.findOne({ id });
  }

  async hasReported(commentId: number, sessionId: string): Promise<boolean> {
    const existing = await commentReports.findOne({ commentId, sessionId });
    return !!existing;
  }
}
