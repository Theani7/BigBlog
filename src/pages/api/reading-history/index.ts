import type { APIRoute } from 'astro';
import { createDatabase, type Env } from '../../../db';
import { Story } from '../../../db/schema/story';

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
      return new Response(JSON.stringify({ success: true, data: { progress: story ? story.reads : 0 } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch {
      return new Response(JSON.stringify({ success: false, error: 'Internal server error' }), { status: 500 });
    }
  }

  return new Response(JSON.stringify({ success: true, data: [] }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as { env: Env }).env;
  if (!env) {
    return new Response(JSON.stringify({ success: false, error: 'Database not configured' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = (await request.json()) as {
      articleSlug?: string;
      progress?: number;
      readTime?: number;
    };
    const { articleSlug, progress, readTime: _readTime } = body;

    if (!articleSlug || progress === undefined) {
      return new Response(JSON.stringify({ success: false, error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await createDatabase(env);
    
    // If progress is substantial (e.g., 100%), count as a read
    if (progress >= 100) {
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
