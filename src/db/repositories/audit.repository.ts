import type { Database } from '../index';
import { auditLogs } from '../schema';
import type { InsertAuditLog } from '../types';

export class AuditLogRepository {
  constructor(_db: Database) {}

  async log(data: InsertAuditLog) {
    try {
      return await auditLogs.create(data);
    } catch (_error) {
      console.error('Failed to write audit log:', _error);
      return null;
    }
  }

  async findBySession(sessionId: string, limit = 50) {
    return auditLogs.find({ sessionId }).sort({ createdAt: -1 }).limit(limit);
  }

  async findByAction(action: string, since?: Date) {
    const query: any = { action };
    if (since) {
      query.createdAt = { $gte: since };
    }
    return auditLogs.find(query).sort({ createdAt: -1 });
  }

  async findByEntity(entityType: string, entityId: string) {
    return auditLogs.find({ entityType, entityId }).sort({ createdAt: -1 });
  }

  async getStats(since?: Date): Promise<{ total: number; byAction: Record<string, number> }> {
    const query = since ? { createdAt: { $gte: since } } : {};
    const total = await auditLogs.countDocuments(query);
    const logs = await auditLogs.find(query).select('action');

    const byAction = logs.reduce(
      (acc, log) => {
        acc[log.action] = (acc[log.action] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return { total, byAction };
  }
}
