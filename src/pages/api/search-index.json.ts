import type { APIRoute } from 'astro';
import { generateSearchIndex } from '../../lib/search';

export const GET: APIRoute = async () => {
  const index = await generateSearchIndex();

  return new Response(JSON.stringify(index), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
};
