import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request, locals }) => {
  const env = (locals as { env: { DB: D1Database } }).env;
  if (!env?.DB) {
    return new Response(JSON.stringify({ success: false, error: 'Database not configured' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const url = new URL(request.url);
  const slug = url.searchParams.get('slug');

  if (!slug) {
    return new Response(JSON.stringify({ success: false, error: 'Slug required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Return mock stats for now - implement with D1 when ready
  return new Response(
    JSON.stringify({
      success: true,
      data: { totalViews: 0, uniqueViews: 0, dailyViews: 0, weeklyViews: 0, monthlyViews: 0 },
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};

export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as { env: { DB: D1Database } }).env;
  if (!env?.DB) {
    return new Response(JSON.stringify({ success: false, error: 'Database not configured' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    await request.json();
    return new Response(JSON.stringify({ success: true, data: { recorded: true } }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ success: false, error: 'Invalid request' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
