import type { APIRoute } from 'astro';
import { createDatabase, type Env } from '../../../db';
import { Story } from '../../../db/schema';
import { verifyAuthToken } from '../../../lib/auth';
import { getErrorMessage } from '../../../lib/errors';

const VALID_STATUSES = ['DRAFT', 'PUBLISHED', 'SCHEDULED', 'UNLISTED'];
const VALID_CATEGORIES = ['Technology', 'Design', 'Business', 'Culture', 'Life', 'Other'];

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
    const { title, subtitle, excerpt, coverImage, content, status, category, tags } = body;

    if (!title) {
      return new Response(JSON.stringify({ success: false, error: 'Title is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (status !== undefined && !VALID_STATUSES.includes(status)) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid status' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (category !== undefined && category !== '' && !VALID_CATEGORIES.includes(category)) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid category' }), {
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

    function normalizeTag(tag: string) {
      let t = tag.toLowerCase().trim();
      if (t.endsWith('s') && !t.endsWith('ss') && t.length > 3 && t !== 'news') {
        t = t.slice(0, -1);
      }
      return t;
    }

    const normalizedTags = Array.isArray(tags) ? tags.map(normalizeTag).filter(Boolean) : [];
    // Remove duplicates
    const uniqueTags = [...new Set(normalizedTags)];

    const story = new Story({
      title,
      subtitle,
      excerpt,
      coverImage,
      content,
      slug,
      category,
      tags: uniqueTags,
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
  } catch (error: unknown) {
    return new Response(JSON.stringify({ success: false, error: getErrorMessage(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const PUT: APIRoute = async ({ request, locals, cookies }) => {
  const env = (locals as { env: Env }).env;

  if (!env) {
    return new Response(JSON.stringify({ success: false, error: 'Environment not configured' }), {
      status: 503,
    });
  }

  try {
    const token = cookies.get('auth_token')?.value;
    if (!token)
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
        status: 401,
      });

    const payload = await verifyAuthToken(token, env);
    if (!payload || !payload.userId)
      return new Response(JSON.stringify({ success: false, error: 'Invalid token' }), {
        status: 401,
      });

    const body = await request.json();
    const { storyId, title, subtitle, excerpt, coverImage, content, status, tags } = body;

    if (!storyId)
      return new Response(JSON.stringify({ success: false, error: 'Story ID required' }), {
        status: 400,
      });

    if (status !== undefined && !VALID_STATUSES.includes(status)) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid status' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await createDatabase(env);
    const story = await Story.findOne({ _id: storyId, authorId: payload.userId });
    if (!story)
      return new Response(JSON.stringify({ success: false, error: 'Story not found' }), {
        status: 404,
      });

    function normalizeTag(tag: string) {
      let t = tag.toLowerCase().trim();
      if (t.endsWith('s') && !t.endsWith('ss') && t.length > 3 && t !== 'news') t = t.slice(0, -1);
      return t;
    }

    if (title !== undefined) story.title = title;
    if (subtitle !== undefined) story.subtitle = subtitle;
    if (excerpt !== undefined) story.excerpt = excerpt;
    if (coverImage !== undefined) story.coverImage = coverImage;
    if (content !== undefined) story.content = content;
    if (status !== undefined) story.status = status;
    if (tags !== undefined) {
      const normalizedTags = Array.isArray(tags) ? tags.map(normalizeTag).filter(Boolean) : [];
      story.tags = [...new Set(normalizedTags)];
    }

    if (status === 'PUBLISHED' && !story.publishedAt) {
      story.publishedAt = new Date();
    }

    story.updatedAt = new Date();
    await story.save();

    return new Response(
      JSON.stringify({ success: true, story: { id: story._id, slug: story.slug } }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: unknown) {
    return new Response(JSON.stringify({ success: false, error: getErrorMessage(error) }), {
      status: 500,
    });
  }
};
