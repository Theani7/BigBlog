import type { APIRoute } from 'astro';

// =============================================================================
// POST /api/analytics/scroll
// Track scroll depth
// =============================================================================
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = (await request.json()) as {
      page?: string;
      maxDepth?: number;
      timeOnPage?: number;
    };
    const { page, maxDepth, timeOnPage } = body;

    if (!page || maxDepth === undefined) {
      return new Response(JSON.stringify({ error: 'page and maxDepth are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const cookieHeader = request.headers.get('cookie') || '';
    const sessionId = parseCookie(cookieHeader, 'bb_session');

    if (!sessionId) {
      return new Response(JSON.stringify({ error: 'session required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // In a real implementation, you would store this in the database
    console.log('[Scroll]', {
      page,
      sessionId,
      maxDepth,
      timeOnPage,
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Failed to track scroll depth', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// =============================================================================
// GET /api/analytics/scroll
// Get scroll depth stats (admin only)
// =============================================================================
export const GET: APIRoute = async ({ url }) => {
  try {
    const days = parseInt(url.searchParams.get('days') || '7', 10);
    const page = url.searchParams.get('page');

    // In a real implementation, you would query the database
    return new Response(
      JSON.stringify({
        period: { days, page },
        byPage: [],
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Failed to get scroll depth stats', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// =============================================================================
// HELPERS
// =============================================================================
function parseCookie(cookieHeader: string, name: string): string | undefined {
  const match = cookieHeader.match(new RegExp(`${name}=([^;]+)`));
  return match?.[1];
}
