import type { APIRoute } from 'astro';

// =============================================================================
// POST /api/analytics/performance
// Track Core Web Vitals and performance metrics
// =============================================================================
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = (await request.json()) as {
      metric?: string;
      value?: number;
      page?: string;
      connection?: string;
    };
    const { metric, value, page, connection } = body;

    if (!metric || value === undefined || !page) {
      return new Response(JSON.stringify({ error: 'metric, value, and page are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const cookieHeader = request.headers.get('cookie') || '';
    const sessionId = parseCookie(cookieHeader, 'bb_session');

    // In a real implementation, you would store this in the database
    console.log('[Performance]', {
      metric,
      value,
      page,
      sessionId,
      connection,
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Failed to track performance metric', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// =============================================================================
// GET /api/analytics/performance
// Get performance stats (admin only)
// =============================================================================
export const GET: APIRoute = async ({ url }) => {
  try {
    const days = parseInt(url.searchParams.get('days') || '7', 10);

    // In a real implementation, you would query the database
    return new Response(
      JSON.stringify({
        period: { days },
        metrics: [],
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Failed to get performance stats', error);
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
