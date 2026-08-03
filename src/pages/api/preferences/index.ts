import type { APIRoute } from 'astro';
import { createDatabase, type Env } from '../../../db';
import { userPreferences } from '../../../db/schema';
import { getOrCreateSessionId, registerSession } from '../../../lib/session';
import { getErrorMessage } from '../../../lib/errors';
import { checkRateLimit, getClientIp } from '../../../lib/rateLimit';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const THEMES = ['light', 'dark', 'system'];
const MODES = ['default', 'reader', 'focused'];

export const GET: APIRoute = async ({ locals, cookies }) => {
  const env = (locals as { env: Env }).env;
  if (!env) return json({ success: false, error: 'Environment not configured' }, 503);

  try {
    await createDatabase(env);
    const sessionId = getOrCreateSessionId(cookies);

    const prefs = (await userPreferences.findOne({ sessionId }).lean()) as {
      theme?: string;
      fontSize?: number;
      contentWidth?: number;
      lineHeight?: number;
      readingMode?: string;
    } | null;

    return json({
      success: true,
      data: {
        theme: prefs?.theme || 'system',
        fontSize: prefs?.fontSize || 16,
        contentWidth: prefs?.contentWidth || 720,
        lineHeight: prefs?.lineHeight || 1.7,
        readingMode: prefs?.readingMode || 'default',
      },
    });
  } catch (error) {
    return json({ success: false, error: getErrorMessage(error) }, 500);
  }
};

export const POST: APIRoute = async ({ request, locals, cookies }) => {
  const env = (locals as { env: Env }).env;
  if (!env) return json({ success: false, error: 'Environment not configured' }, 503);

  const limited = checkRateLimit(request, {
    key: 'preferences:post',
    limit: 30,
    windowMs: 60_000,
  });
  if (limited) return limited;

  try {
    const body = (await request.json()) as {
      theme?: string;
      fontSize?: number;
      contentWidth?: number;
      lineHeight?: number;
      readingMode?: string;
    };
    const { theme, fontSize, contentWidth, lineHeight, readingMode } = body;

    if (fontSize !== undefined && (fontSize < 12 || fontSize > 24)) {
      return json({ success: false, error: 'Font size must be between 12 and 24' }, 400);
    }
    if (contentWidth !== undefined && (contentWidth < 480 || contentWidth > 1200)) {
      return json({ success: false, error: 'Content width must be between 480 and 1200' }, 400);
    }
    if (lineHeight !== undefined && (lineHeight < 1.0 || lineHeight > 3.0)) {
      return json({ success: false, error: 'Line height must be between 1.0 and 3.0' }, 400);
    }
    if (theme !== undefined && !THEMES.includes(theme)) {
      return json({ success: false, error: 'Invalid theme' }, 400);
    }
    if (readingMode !== undefined && !MODES.includes(readingMode)) {
      return json({ success: false, error: 'Invalid reading mode' }, 400);
    }

    await createDatabase(env);
    const sessionId = getOrCreateSessionId(cookies);
    await registerSession(env, sessionId, {
      userAgent: request.headers.get('user-agent') || '',
      ip: getClientIp(request),
    });

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (theme !== undefined) updates.theme = theme;
    if (fontSize !== undefined) updates.fontSize = fontSize;
    if (contentWidth !== undefined) updates.contentWidth = contentWidth;
    if (lineHeight !== undefined) updates.lineHeight = lineHeight;
    if (readingMode !== undefined) updates.readingMode = readingMode;

    await userPreferences.findOneAndUpdate({ sessionId }, { $set: updates }, { upsert: true });

    return json({
      success: true,
      data: { theme, fontSize, contentWidth, lineHeight, readingMode },
      message: 'Preferences updated',
    });
  } catch (error) {
    return json({ success: false, error: getErrorMessage(error) }, 500);
  }
};
