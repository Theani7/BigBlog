import { getErrorMessage } from '../../../lib/errors';
import type { APIRoute } from 'astro';
import { createDatabase, type Env } from '../../../db';
import { articleLikes } from '../../../db/schema';
import { getOrCreateSessionId, registerSession } from '../../../lib/session';
import { checkRateLimit, getClientIp } from '../../../lib/rateLimit';

const json = (body: unknown, status = 200, extraHeaders: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
  });

export const GET: APIRoute = async ({ request, locals, cookies }) => {
  const env = (locals as { env: Env }).env;
  if (!env) {
    return json({ success: false, error: 'Environment not configured' }, 503);
  }

  const url = new URL(request.url);
  const slug = url.searchParams.get('slug');
  if (!slug) {
    return json({ success: false, error: 'Slug required' }, 400);
  }

  try {
    await createDatabase(env);
    const sessionId = getOrCreateSessionId(cookies);
    const count = await articleLikes.countDocuments({ articleSlug: slug });
    const liked = (await articleLikes.exists({ articleSlug: slug, sessionId })) !== null;

    return json({ success: true, data: { count, liked } }, 200, {
      'Cache-Control': 'public, max-age=60, s-maxage=300',
    });
  } catch (error: unknown) {
    return json({ success: false, error: getErrorMessage(error) }, 500);
  }
};

export const POST: APIRoute = async ({ request, locals, cookies }) => {
  const env = (locals as { env: Env }).env;
  if (!env) {
    return json({ success: false, error: 'Environment not configured' }, 503);
  }

  const limited = await checkRateLimit(request, { key: 'likes:post', limit: 30, windowMs: 60_000 });
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

    const existing = await articleLikes.findOne({ articleSlug: slug, sessionId });
    if (existing) {
      await articleLikes.deleteOne({ _id: existing._id });
    } else {
      await articleLikes.create({ articleSlug: slug, sessionId });
    }

    const count = await articleLikes.countDocuments({ articleSlug: slug });
    return json({ success: true, data: { liked: !existing, count } });
  } catch (error: unknown) {
    return json({ success: false, error: getErrorMessage(error) }, 500);
  }
};
