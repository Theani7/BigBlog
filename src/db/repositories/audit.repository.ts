import { eq, desc, and, gte, count } from 'drizzle-orm';
import type { Database } from '../index';
import { auditLogs } from '../schema';
import type { InsertAuditLog } from '../types';

export class AuditLogRepository {
  constructor(private db: Database) {}

  async log(data: InsertAuditLog) {
    try {
      return await this.db.insert(auditLogs).values(data).returning();
    } catch (_error) {
      // Audit logs should never throw errors
      console.error('Failed to write audit log:', _error);
      return null;
    }
  }

  async findBySession(sessionId: string, limit = 50) {
    return this.db.query.auditLogs.findMany({
      where: eq(auditLogs.sessionId, sessionId),
      orderBy: [desc(auditLogs.createdAt)],
      limit,
    });
  }

  async findByAction(action: string, since?: Date) {
    const conditions = [eq(auditLogs.action, action)];
    if (since) {
      conditions.push(gte(auditLogs.createdAt, since));
    }

    return this.db.query.auditLogs.findMany({
      where: and(...conditions),
      orderBy: [desc(auditLogs.createdAt)],
    });
  }

  async findByEntity(entityType: string, entityId: string) {
    return this.db.query.auditLogs.findMany({
      where: and(eq(auditLogs.entityType, entityType), eq(auditLogs.entityId, entityId)),
      orderBy: [desc(auditLogs.createdAt)],
    });
  }

  async getStats(since?: Date): Promise<{ total: number; byAction: Record<string, number> }> {
    const conditions = since ? [gte(auditLogs.createdAt, since)] : [];

    const [total] = await this.db
      .select({ count: count() })
      .from(auditLogs)
      .where(conditions.length ? and(...conditions) : undefined);

    const logs = await this.db.query.auditLogs.findMany({
      where: conditions.length ? and(...conditions) : undefined,
      columns: { action: true },
    });

    const byAction = logs.reduce(
      (acc, log) => {
        acc[log.action] = (acc[log.action] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      total: total?.count ?? 0,
      byAction,
    };
  }
}
