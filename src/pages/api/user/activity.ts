import type { APIRoute } from 'astro';
import { createDatabase, type Env } from '../../../db';
import { Repost, Story } from '../../../db/schema';

export interface ActivityItem {
  type: 'PUBLISHED_STORY' | 'REPOSTED_STORY';
  title: string;
  slug?: string;
  createdAt: Date;
}

export const GET: APIRoute = async ({ request, locals }) => {
  const env = (locals as { env: Env }).env;
  if (!env) {
    return new Response(JSON.stringify({ success: false, error: 'Environment not configured' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const url = new URL(request.url);
  const userId = url.searchParams.get('userId');

  if (!userId) {
    return new Response(JSON.stringify({ success: false, error: 'userId parameter is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    await createDatabase(env);

    // Fetch published stories
    const publishedStories = await Story.find({ authorId: userId, status: 'PUBLISHED' }).lean();
    const storyActivities: ActivityItem[] = publishedStories.map((story: any) => ({
      type: 'PUBLISHED_STORY',
      title: story.title,
      slug: story.slug,
      createdAt: story.publishedAt || story.createdAt,
    }));

    // Fetch reposts with populated story data
    const reposts = await Repost.find({ userId }).populate('storyId').lean();
    const repostActivities: ActivityItem[] = reposts
      .filter((r: any) => r.storyId && (r.storyId as any).title)
      .map((r: any) => ({
        type: 'REPOSTED_STORY',
        title: (r.storyId as any).title,
        slug: (r.storyId as any).slug,
        createdAt: r.createdAt,
      }));

    // Combine and sort chronologically (newest first)
    const activities: ActivityItem[] = [...storyActivities, ...repostActivities].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return new Response(JSON.stringify({ success: true, activities }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Internal error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
