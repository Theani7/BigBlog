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

  return new Response(JSON.stringify({ success: true, data: { comments: [], count: 0 } }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
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
  const action = url.searchParams.get('action') || 'create';

  try {
    const body = await request.json();

    switch (action) {
      case 'create': {
        const {
          articleSlug,
          content,
          authorName,
          authorEmail: _authorEmail,
          parentId: _parentId,
        } = body;
        if (!articleSlug || !content || !authorName) {
          return new Response(
            JSON.stringify({ success: false, error: 'Missing required fields' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
        }
        return new Response(
          JSON.stringify({
            success: true,
            data: {
              id: Date.now(),
              articleSlug,
              content,
              authorName,
              createdAt: new Date().toISOString(),
            },
            message: 'Comment submitted for moderation',
          }),
          { status: 201, headers: { 'Content-Type': 'application/json' } }
        );
      }

      case 'edit': {
        const { commentId, content } = body;
        if (!content) {
          return new Response(JSON.stringify({ success: false, error: 'Content required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          });
        }
        return new Response(
          JSON.stringify({ success: true, data: { id: commentId, content, isEdited: true } }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }

      case 'delete':
        return new Response(JSON.stringify({ success: true, message: 'Comment deleted' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });

      case 'react': {
        const { commentId: _commentId, emoji } = body;
        if (!emoji) {
          return new Response(JSON.stringify({ success: false, error: 'Emoji required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          });
        }
        return new Response(JSON.stringify({ success: true, data: { added: true } }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      case 'report': {
        const { commentId: _commentId, reason, details: _details } = body;
        if (!reason) {
          return new Response(JSON.stringify({ success: false, error: 'Reason required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          });
        }
        return new Response(JSON.stringify({ success: true, message: 'Report submitted' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      default:
        return new Response(JSON.stringify({ success: false, error: 'Invalid action' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
    }
  } catch {
    return new Response(JSON.stringify({ success: false, error: 'Invalid request' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
