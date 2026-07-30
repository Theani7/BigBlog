import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ cookies }) => {
  // Clear the auth cookie
  cookies.delete('auth_token', {
    path: '/',
  });

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
