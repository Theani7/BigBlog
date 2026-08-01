import type { APIRoute } from 'astro';
import { createDatabase, type Env } from '../../../db';
import { articleLikes } from '../../../db/schema';
import { getOrCreateSessionId } from '../../../lib/session';

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
  if (!slug) {
    return json({ success: false, error: 'Slug required' }, 400);
  }

  try {
    await createDatabase(env);
    const sessionId = getOrCreateSessionId(cookies);
    const count = await articleLikes.countDocuments({ articleSlug: slug });
    const liked = (await articleLikes.exists({ articleSlug: slug, sessionId })) !== null;

    return json({ success: true, data: { count, liked } });
  } catch (error: any) {
    return json({ success: false, error: error.message }, 500);
  }
};

export const POST: APIRoute = async ({ request, locals, cookies }) => {
  const env = (locals as { env: Env }).env;
  if (!env) {
    return json({ success: false, error: 'Environment not configured' }, 503);
  }

  try {
    const body = (await request.json()) as { slug?: string };
    const slug = body.slug;
    if (!slug) {
      return json({ success: false, error: 'Slug required' }, 400);
    }

    await createDatabase(env);
    const sessionId = getOrCreateSessionId(cookies);

    const existing = await articleLikes.findOne({ articleSlug: slug, sessionId });
    if (existing) {
      await articleLikes.deleteOne({ _id: existing._id });
    } else {
      await articleLikes.create({ articleSlug: slug, sessionId });
    }

    const count = await articleLikes.countDocuments({ articleSlug: slug });
    return json({ success: true, data: { liked: !existing, count } });
  } catch (error: any) {
    return json({ success: false, error: error.message }, 500);
  }
};
