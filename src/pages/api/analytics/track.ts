import type { APIRoute } from 'astro';

// =============================================================================
// POST /api/analytics/track
// Track analytics events from client
// =============================================================================
export const POST: APIRoute = async ({ request }) => {
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

    // Parse user agent for device/browser detection
    const userAgent = request.headers.get('user-agent') || '';

    // Get session from cookie
    const cookieHeader = request.headers.get('cookie') || '';
    const sessionId = parseCookie(cookieHeader, 'bb_session');

    // In a real implementation, you would store this in the database
    // For now, we just log it
    console.log('[Analytics]', {
      event,
      page,
      sessionId,
      referrer,
      userAgent: userAgent.slice(0, 100),
      metadata,
    });

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
