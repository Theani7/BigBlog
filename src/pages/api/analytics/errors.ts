import type { APIRoute } from 'astro';

// =============================================================================
// POST /api/analytics/errors
// Track client and server errors
// =============================================================================
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = (await request.json()) as {
      level?: string;
      message?: string;
      stack?: string;
      page?: string;
      metadata?: Record<string, unknown>;
    };
    const { level, message, stack, page, metadata } = body;

    if (!message) {
      return new Response(JSON.stringify({ error: 'message is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const cookieHeader = request.headers.get('cookie') || '';
    const sessionId = parseCookie(cookieHeader, 'bb_session');

    // In a real implementation, you would store this in the database
    console.error('[Error]', {
      level: level || 'error',
      message,
      stack,
      page,
      sessionId,
      metadata,
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Failed to track error', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// =============================================================================
// GET /api/analytics/errors
// Get error stats (admin only)
// =============================================================================
export const GET: APIRoute = async ({ url }) => {
  try {
    const days = parseInt(url.searchParams.get('days') || '7', 10);
    const level = url.searchParams.get('level');

    // In a real implementation, you would query the database
    return new Response(
      JSON.stringify({
        period: { days, level },
        total: 0,
        byLevel: [],
        byPage: [],
        recent: [],
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Failed to get error stats', error);
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
