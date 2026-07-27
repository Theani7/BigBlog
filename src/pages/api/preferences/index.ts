import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ locals }) => {
  const env = (locals as { env: { DB: D1Database } }).env;
  if (!env?.DB) {
    return new Response(JSON.stringify({ success: false, error: 'Database not configured' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(
    JSON.stringify({
      success: true,
      data: {
        theme: 'system',
        fontSize: 16,
        contentWidth: 720,
        lineHeight: 1.7,
        readingMode: 'default',
      },
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
    const body = (await request.json()) as {
      theme?: string;
      fontSize?: number;
      contentWidth?: number;
      lineHeight?: number;
      readingMode?: string;
    };
    const { theme, fontSize, contentWidth, lineHeight, readingMode } = body;

    // Validate inputs
    if (fontSize !== undefined && (fontSize < 12 || fontSize > 24)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Font size must be between 12 and 24' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (contentWidth !== undefined && (contentWidth < 480 || contentWidth > 1200)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Content width must be between 480 and 1200' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (lineHeight !== undefined && (lineHeight < 1.0 || lineHeight > 3.0)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Line height must be between 1.0 and 3.0' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: { theme, fontSize, contentWidth, lineHeight, readingMode },
        message: 'Preferences updated',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch {
    return new Response(JSON.stringify({ success: false, error: 'Invalid request' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
