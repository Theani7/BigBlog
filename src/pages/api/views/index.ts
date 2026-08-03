import type { APIRoute } from 'astro';
import { createDatabase, type Env } from '../../../db';
import { Story } from '../../../db/schema/story';
import { articleViews } from '../../../db/schema';
import { getOrCreateSessionId } from '../../../lib/session';

export const GET: APIRoute = async ({ locals, url }) => {
  const env = (locals as { env: Env }).env;
  if (!env) {
    return new Response(JSON.stringify({ success: false, error: 'Database not configured' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const slug = url.searchParams.get('slug');

  if (!slug) {
    return new Response(JSON.stringify({ success: false, error: 'Slug required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    await createDatabase(env);
    const story = await Story.findOne({ slug });

    if (!story) {
      return new Response(JSON.stringify({ success: false, error: 'Story not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          totalViews: story.views || 0,
          uniqueViews: story.views || 0,
          dailyViews: 0,
          weeklyViews: 0,
          monthlyViews: 0,
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch {
    return new Response(JSON.stringify({ success: false, error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const POST: APIRoute = async ({ request, locals, cookies }) => {
  const env = (locals as { env: Env }).env;
  if (!env) {
    return new Response(JSON.stringify({ success: false, error: 'Database not configured' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await request.json();
    const slug = body.slug || body.articleSlug;

    if (!slug) {
      return new Response(JSON.stringify({ success: false, error: 'Slug required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await createDatabase(env);

    // Count at most one view per session per story so bots/refreshes
    // cannot inflate the counter.
    const sessionId = getOrCreateSessionId(cookies);
    const alreadySeen = await articleViews.exists({ articleSlug: slug, sessionId });

    if (!alreadySeen) {
      await articleViews.create({ articleSlug: slug, sessionId, viewedAt: new Date() });
      await Story.updateOne({ slug }, { $inc: { views: 1 } });
    }

    return new Response(JSON.stringify({ success: true, data: { recorded: true } }), {
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
