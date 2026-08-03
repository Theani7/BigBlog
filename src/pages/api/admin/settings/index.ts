import { getErrorMessage } from '../../../../lib/errors';
import type { APIRoute } from 'astro';
import { createDatabase, type Env } from '../../../../db';
import { getSiteSettings, setSiteSettings } from '../../../../db/schema';
import { requireAdmin, json } from '../../../../lib/admin';

// =============================================================================
// GET /api/admin/settings
// Return all site settings
// PUT /api/admin/settings
// Persist updated site settings (only known keys are stored)
// =============================================================================
export const GET: APIRoute = async (context) => {
  const env = (context.locals as { env: Env }).env;
  if (!env) return json({ success: false, error: 'Environment not configured' }, 503);

  const admin = await requireAdmin(context);
  if (!admin) return json({ success: false, error: 'Unauthorized' }, 401);

  try {
    await createDatabase(env);
    const settings = await getSiteSettings();
    return json({ success: true, data: settings });
  } catch (error: unknown) {
    return json({ success: false, error: getErrorMessage(error) }, 500);
  }
};

export const PUT: APIRoute = async (context) => {
  const env = (context.locals as { env: Env }).env;
  if (!env) return json({ success: false, error: 'Environment not configured' }, 503);

  const admin = await requireAdmin(context);
  if (!admin) return json({ success: false, error: 'Unauthorized' }, 401);

  try {
    await createDatabase(env);

    const body = await context.request.json();
    const entries: Record<string, unknown> = {};

    if (typeof body.siteName === 'string') entries.siteName = body.siteName.slice(0, 80);
    if (typeof body.siteTagline === 'string') entries.siteTagline = body.siteTagline.slice(0, 200);
    if (typeof body.allowRegistrations === 'boolean') {
      entries.allowRegistrations = body.allowRegistrations;
    }
    if (typeof body.newsletterEnabled === 'boolean') {
      entries.newsletterEnabled = body.newsletterEnabled;
    }
    if (body.commentsModeration === 'approved' || body.commentsModeration === 'none') {
      entries.commentsModeration = body.commentsModeration;
    }
    if (typeof body.maintenanceMode === 'boolean') {
      entries.maintenanceMode = body.maintenanceMode;
    }

    await setSiteSettings(entries);
    const settings = await getSiteSettings();
    return json({ success: true, data: settings });
  } catch (error: unknown) {
    return json({ success: false, error: getErrorMessage(error) }, 500);
  }
};
