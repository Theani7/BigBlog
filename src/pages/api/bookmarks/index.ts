import { getErrorMessage } from '../../../lib/errors';
import type { APIRoute } from 'astro';
import { createDatabase, type Env } from '../../../db';
import { articleBookmarks } from '../../../db/schema';
import { getOrCreateSessionId, registerSession } from '../../../lib/session';
import { checkRateLimit, getClientIp } from '../../../lib/rateLimit';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

export const GET: APIRoute = async ({ request, locals, cookies }) => {
  const env = (locals as { env: Env }).env;
  if (!env) {
    return json({ success: false, error: 'Environment not configured' }, 503);
  }

  const url = new URL(request.url);
  const slug = url.searchParams.get('slug');

  try {
    await createDatabase(env);
    const sessionId = getOrCreateSessionId(cookies);

    if (!slug) {
      const items = await articleBookmarks.find({ sessionId }).sort({ createdAt: -1 }).lean();
      return json({
        success: true,
        data: {
          bookmarks: items.map((b) => ({
            articleSlug: b.articleSlug,
            createdAt: b.createdAt,
          })),
        },
      });
    }

    const bookmarked = (await articleBookmarks.exists({ articleSlug: slug, sessionId })) !== null;

    return json({ success: true, data: { bookmarked } });
  } catch (error: unknown) {
    return json({ success: false, error: getErrorMessage(error) }, 500);
  }
};

export const POST: APIRoute = async ({ request, locals, cookies }) => {
  const env = (locals as { env: Env }).env;
  if (!env) {
    return json({ success: false, error: 'Environment not configured' }, 503);
  }

  const limited = checkRateLimit(request, { key: 'bookmarks:post', limit: 30, windowMs: 60_000 });
  if (limited) return limited;

  try {
    const body = (await request.json()) as { slug?: string };
    const slug = body.slug;
    if (!slug) {
      return json({ success: false, error: 'Slug required' }, 400);
    }

    await createDatabase(env);
    const sessionId = getOrCreateSessionId(cookies);
    await registerSession(env, sessionId, {
      userAgent: request.headers.get('user-agent') || '',
      ip: getClientIp(request),
    });

    const existing = await articleBookmarks.findOne({ articleSlug: slug, sessionId });
    if (existing) {
      await articleBookmarks.deleteOne({ _id: existing._id });
    } else {
      await articleBookmarks.create({ articleSlug: slug, sessionId });
    }

    return json({ success: true, data: { bookmarked: !existing } });
  } catch (error: unknown) {
    return json({ success: false, error: getErrorMessage(error) }, 500);
  }
};
