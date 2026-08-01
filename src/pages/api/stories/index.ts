import type { APIRoute } from 'astro';
import { createDatabase, type Env } from '../../../db';
import { Story } from '../../../db/schema';
import { verifyAuthToken } from '../../../lib/auth';

export const POST: APIRoute = async ({ request, locals, cookies }) => {
  const env = (locals as { env: Env }).env;

  if (!env) {
    return new Response(JSON.stringify({ success: false, error: 'Environment not configured' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const token = cookies.get('auth_token')?.value;

    if (!token) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const payload = await verifyAuthToken(token, env);
    if (!payload || !payload.userId) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();
    const { title, content, status, category, tags } = body;

    if (!title) {
      return new Response(JSON.stringify({ success: false, error: 'Title is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await createDatabase(env);

    // Create a base slug
    let baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    if (!baseSlug) baseSlug = 'story';

    let slug = baseSlug;
    let counter = 1;
    while (await Story.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const story = new Story({
      title,
      content,
      slug,
      category,
      tags: Array.isArray(tags) ? tags : [],
      authorId: payload.userId,
      status: status || 'DRAFT',
      publishedAt: status === 'PUBLISHED' ? new Date() : undefined,
    });

    await story.save();

    return new Response(
      JSON.stringify({
        success: true,
        story: { id: story._id, slug: story.slug },
      }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
