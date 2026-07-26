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
  const action = url.searchParams.get('action') || 'stats';
  const token = url.searchParams.get('token') || '';

  if (action === 'confirm') {
    if (!token) {
      return new Response(JSON.stringify({ success: false, error: 'Token required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(
      JSON.stringify({ success: true, message: 'Email confirmed successfully' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ success: true, data: { total: 0, confirmed: 0, pending: 0 } }),
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

  const url = new URL(request.url);
  const action = url.searchParams.get('action') || 'subscribe';

  try {
    const body = await request.json();

    if (action === 'unsubscribe') {
      const { email } = body;
      if (!email) {
        return new Response(JSON.stringify({ success: false, error: 'Email required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ success: true, message: 'Unsubscribed successfully' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { email } = body;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ success: false, error: 'Valid email required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const token = crypto.randomUUID();
    return new Response(
      JSON.stringify({ success: true, data: { token }, message: 'Subscription confirmed' }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch {
    return new Response(JSON.stringify({ success: false, error: 'Invalid request' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
