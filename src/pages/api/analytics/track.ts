import type { APIRoute } from 'astro';
import { createDatabase, type Env } from '../../../db';
import { analyticsEvents, pageViews, scrollDepth } from '../../../db/schema';

// =============================================================================
// POST /api/analytics/track
// Persist analytics events (page views, scroll depth, custom events)
// =============================================================================
export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as { env: Env }).env;
  if (!env) {
    return new Response(JSON.stringify({ error: 'Environment not configured' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = (await request.json()) as {
      event?: string;
      page?: string;
      referrer?: string;
      metadata?: Record<string, unknown>;
    };
    const { event, page, referrer, metadata } = body;

    if (!event || !page) {
      return new Response(JSON.stringify({ error: 'event and page are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const userAgent = request.headers.get('user-agent') || '';
    const cookieHeader = request.headers.get('cookie') || '';
    const sessionId = parseCookie(cookieHeader, 'bb_session') || '';

    await createDatabase(env);

    const referrerValue = referrer ? referrer.slice(0, 500) : undefined;
    const userAgentValue = userAgent.slice(0, 300);
    const metadataValue = JSON.stringify(metadata || {}).slice(0, 2000);

    await analyticsEvents.create({
      event,
      page,
      sessionId,
      ...(referrerValue !== undefined ? { referrer: referrerValue } : {}),
      userAgent: userAgentValue,
      metadata: metadataValue,
    });

    if (event === 'page_view') {
      await pageViews.create({
        page,
        sessionId,
        ...(referrerValue !== undefined ? { referrer: referrerValue } : {}),
        createdAt: new Date(),
      });
    } else if (event === 'scroll_depth') {
      const depth = Number(metadata?.depth ?? 0);
      if (sessionId && Number.isFinite(depth) && depth >= 0 && depth <= 1) {
        await scrollDepth.create({
          page,
          sessionId,
          maxDepth: depth,
          createdAt: new Date(),
        });
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Failed to track analytics event', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// =============================================================================
// GET /api/analytics/track
// Health check
// =============================================================================
export const GET: APIRoute = async () => {
  return new Response(JSON.stringify({ status: 'ok' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

// =============================================================================
// HELPERS
// =============================================================================
function parseCookie(cookieHeader: string, name: string): string | undefined {
  const match = cookieHeader.match(new RegExp(`${name}=([^;]+)`));
  return match?.[1];
}
