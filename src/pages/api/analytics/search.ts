import type { APIRoute } from 'astro';

// =============================================================================
// POST /api/analytics/search
// Track search queries
// =============================================================================
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = (await request.json()) as {
      query?: string;
      results?: number;
      selectedSlug?: string;
    };
    const { query, results, selectedSlug } = body;

    if (!query) {
      return new Response(JSON.stringify({ error: 'query is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const cookieHeader = request.headers.get('cookie') || '';
    const sessionId = parseCookie(cookieHeader, 'bb_session');

    // In a real implementation, you would store this in the database
    console.log('[Search]', {
      query,
      results: results || 0,
      selectedSlug,
      sessionId,
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Failed to track search', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// =============================================================================
// GET /api/analytics/search
// Get search stats (admin only)
// =============================================================================
export const GET: APIRoute = async ({ url }) => {
  try {
    const days = parseInt(url.searchParams.get('days') || '7', 10);

    // In a real implementation, you would query the database
    return new Response(
      JSON.stringify({
        period: { days },
        total: 0,
        popular: [],
        noResults: [],
        withSelection: 0,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Failed to get search stats', error);
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
