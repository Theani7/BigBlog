import type { APIRoute } from 'astro';
import { createDatabase, type Env } from '../../../db';
import { errorLogs } from '../../../db/schema/analytics';
import { requireAdmin, json } from '../../../lib/admin';

// =============================================================================
// GET /api/analytics/alerts
// Check alert conditions against real data and return triggered alerts
// =============================================================================
export const GET: APIRoute = async (context) => {
  const env = (context.locals as { env: Env }).env;
  if (!env) return json({ success: false, error: 'Environment not configured' }, 503);

  const admin = await requireAdmin(context);
  if (!admin) return json({ success: false, error: 'Unauthorized' }, 401);

  try {
    await createDatabase(env);

    const now = new Date();
    const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [errors1h, errors24h, unresolved] = await Promise.all([
      errorLogs.countDocuments({ level: 'error', createdAt: { $gte: hourAgo } }),
      errorLogs.countDocuments({ level: 'error', createdAt: { $gte: dayAgo } }),
      errorLogs.countDocuments({ level: 'error', resolved: false }),
    ]);

    const triggeredAlerts: Array<{
      rule: string;
      severity: 'warning' | 'critical';
      message: string;
    }> = [];

    if (errors1h >= 10) {
      triggeredAlerts.push({
        rule: 'errors_1h',
        severity: 'critical',
        message: `${errors1h} errors in the last hour`,
      });
    } else if (errors1h >= 3) {
      triggeredAlerts.push({
        rule: 'errors_1h',
        severity: 'warning',
        message: `${errors1h} errors in the last hour`,
      });
    }

    if (unresolved >= 50) {
      triggeredAlerts.push({
        rule: 'unresolved_errors',
        severity: 'warning',
        message: `${unresolved} unresolved errors`,
      });
    }

    return json({
      success: true,
      timestamp: now.toISOString(),
      checkedRules: 3,
      triggeredAlerts,
      status: triggeredAlerts.length === 0 ? 'healthy' : 'attention',
      counts: { errors1h, errors24h, unresolved },
    });
  } catch (error) {
    console.error('Failed to check alerts', error);
    return json({ error: 'Internal server error' }, 500);
  }
};
