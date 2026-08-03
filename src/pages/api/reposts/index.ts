import { getErrorMessage } from '../../../lib/errors';
import type { APIRoute } from 'astro';
import mongoose from 'mongoose';
import { createDatabase, type Env } from '../../../db';
import { storyReposts } from '../../../db/schema';
import { getOrCreateSessionId, registerSession } from '../../../lib/session';
import { verifyAuthToken } from '../../../lib/auth';
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
    const count = await storyReposts.countDocuments({ articleSlug: slug });
    const reposted = (await storyReposts.exists({ articleSlug: slug, sessionId })) !== null;

    return json({ success: true, data: { count, reposted } }, 200, {
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

  const limited = await checkRateLimit(request, {
    key: 'reposts:post',
    limit: 30,
    windowMs: 60_000,
  });
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

    const token = cookies.get('auth_token')?.value;
    const payload = token ? await verifyAuthToken(token, env) : null;
    const userId = payload?.userId ? new mongoose.Types.ObjectId(payload.userId) : undefined;

    if (payload?.userId) {
      await registerSession(env, sessionId, {
        userId: payload.userId,
        userAgent: request.headers.get('user-agent') || '',
        ip: getClientIp(request),
      });
    }

    const existing = await storyReposts.findOne({ articleSlug: slug, sessionId });
    if (existing) {
      await storyReposts.deleteOne({ _id: existing._id });
    } else {
      await storyReposts.create({
        articleSlug: slug,
        sessionId,
        ...(userId ? { userId } : {}),
      });
    }

    const count = await storyReposts.countDocuments({ articleSlug: slug });
    return json({ success: true, data: { reposted: !existing, count } });
  } catch (error: unknown) {
    return json({ success: false, error: getErrorMessage(error) }, 500);
  }
};
