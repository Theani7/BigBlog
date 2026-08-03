import type { APIRoute } from 'astro';
import { createDatabase, type Env } from '../../../db';
import { Story } from '../../../db/schema/story';
import { readingHistory } from '../../../db/schema';
import { getOrCreateSessionId, registerSession } from '../../../lib/session';
import { checkRateLimit, getClientIp } from '../../../lib/rateLimit';

export const GET: APIRoute = async ({ locals, url }) => {
  const env = (locals as { env: Env }).env;
  if (!env) {
    return new Response(JSON.stringify({ success: false, error: 'Database not configured' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const action = url.searchParams.get('action');
  const slug = url.searchParams.get('slug');

  if (action === 'continue') {
    return new Response(JSON.stringify({ success: true, data: null }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (slug) {
    try {
      await createDatabase(env);
      const story = await Story.findOne({ slug });
      return new Response(
        JSON.stringify({ success: true, data: { progress: story ? story.reads : 0 } }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    } catch {
      return new Response(JSON.stringify({ success: false, error: 'Internal server error' }), {
        status: 500,
      });
    }
  }

  return new Response(JSON.stringify({ success: true, data: [] }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const POST: APIRoute = async ({ request, locals, cookies }) => {
  const env = (locals as { env: Env }).env;
  if (!env) {
    return new Response(JSON.stringify({ success: false, error: 'Database not configured' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const limited = await checkRateLimit(request, {
    key: 'reading-history:post',
    limit: 60,
    windowMs: 60_000,
  });
  if (limited) return limited;

  try {
    const body = (await request.json()) as {
      articleSlug?: string;
      progress?: number;
      readTime?: number;
    };
    const { articleSlug, progress, readTime } = body;

    if (!articleSlug || progress === undefined) {
      return new Response(JSON.stringify({ success: false, error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (typeof progress !== 'number' || progress < 0 || progress > 100) {
      return new Response(
        JSON.stringify({ success: false, error: 'Progress must be a number between 0 and 100' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    await createDatabase(env);
    const sessionId = getOrCreateSessionId(cookies);
    await registerSession(env, sessionId, {
      userAgent: request.headers.get('user-agent') || '',
      ip: getClientIp(request),
    });

    // Persist progress per session per story (unique index) and count a
    // completed read at most once per session.
    const isFirstEntry = !(await readingHistory.exists({ articleSlug, sessionId }));
    await readingHistory.findOneAndUpdate(
      { articleSlug, sessionId },
      {
        $set: {
          progress,
          readTime: typeof readTime === 'number' ? readTime : 0,
          updatedAt: new Date(),
        },
      },
      { upsert: true, new: true }
    );

    if (progress >= 100 && isFirstEntry) {
      await Story.updateOne({ slug: articleSlug }, { $inc: { reads: 1 } });
    }

    return new Response(JSON.stringify({ success: true, data: { updated: true } }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ success: false, error: 'Invalid request' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
