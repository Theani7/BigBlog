import type { APIRoute } from 'astro';
import { createDatabase, type Env } from '../../../db';
import { analyticsEvents, pageViews, scrollDepth } from '../../../db/schema';
import { checkRateLimit, getClientIp } from '../../../lib/rateLimit';
import { isValidSessionId, registerSession } from '../../../lib/session';

// =============================================================================
// POST /api/analytics/track
// Persist analytics events (page views, scroll depth, custom events).
// Accepts a single event or a batched { events: [...] } payload.
// =============================================================================
const MAX_EVENTS_PER_BATCH = 50;

export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as { env: Env }).env;
  if (!env) {
    return new Response(JSON.stringify({ error: 'Environment not configured' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const limited = await checkRateLimit(request, {
    key: 'analytics:track',
    limit: 120,
    windowMs: 60_000,
  });
  if (limited) return limited;

  try {
    const body = (await request.json()) as {
      event?: string;
      page?: string;
      referrer?: string;
      metadata?: Record<string, unknown>;
      sessionId?: string;
      events?: Array<{
        event?: string;
        page?: string;
        referrer?: string;
        metadata?: Record<string, unknown>;
        sessionId?: string;
      }>;
    };

    const rawEvents = Array.isArray(body.events)
      ? body.events.slice(0, MAX_EVENTS_PER_BATCH)
      : [body];
    const cookieHeader = request.headers.get('cookie') || '';
    const cookieSession = parseCookie(cookieHeader, 'bb_session') || '';
    const userAgent = request.headers.get('user-agent') || '';
    const ip = getClientIp(request);

    await createDatabase(env);

    const eventDocs: Array<Record<string, unknown>> = [];
    const pageViewDocs: Array<Record<string, unknown>> = [];
    const scrollDocs: Array<Record<string, unknown>> = [];
    const seenSessions = new Set<string>();

    for (const raw of rawEvents) {
      const event = typeof raw.event === 'string' ? raw.event : '';
      const page = typeof raw.page === 'string' ? raw.page.slice(0, 500) : '';
      if (!event || !page) continue;

      const referrerValue =
        typeof raw.referrer === 'string' ? raw.referrer.slice(0, 500) : undefined;
      const metadataValue =
        raw.metadata && typeof raw.metadata === 'object'
          ? JSON.stringify(raw.metadata).slice(0, 2000)
          : undefined;

      // Prefer the server-issued cookie; fall back to the client-supplied id
      // only when it has a valid UUID shape (forged ids are dropped).
      const sessionId =
        cookieSession && isValidSessionId(cookieSession)
          ? cookieSession
          : isValidSessionId(raw.sessionId || '')
            ? (raw.sessionId as string)
            : '';

      if (sessionId && !seenSessions.has(sessionId)) {
        seenSessions.add(sessionId);
        void registerSession(env, sessionId, { userAgent, ip });
      }

      const base: Record<string, unknown> = { event, page, userAgent: userAgent.slice(0, 300) };
      if (sessionId) base.sessionId = sessionId;
      if (referrerValue !== undefined) base.referrer = referrerValue;
      if (metadataValue !== undefined) base.metadata = metadataValue;
      eventDocs.push(base);

      if (event === 'page_view') {
        const pv: Record<string, unknown> = { page, createdAt: new Date() };
        if (sessionId) pv.sessionId = sessionId;
        if (referrerValue !== undefined) pv.referrer = referrerValue;
        pageViewDocs.push(pv);
      } else if (event === 'scroll_depth') {
        const depth = Number(
          raw.metadata && typeof raw.metadata === 'object' ? (raw.metadata.depth ?? 0) : 0
        );
        if (sessionId && Number.isFinite(depth) && depth >= 0 && depth <= 1) {
          scrollDocs.push({ page, sessionId, maxDepth: depth, createdAt: new Date() });
        }
      }
    }

    if (eventDocs.length > 0) await analyticsEvents.insertMany(eventDocs);
    if (pageViewDocs.length > 0) await pageViews.insertMany(pageViewDocs);
    if (scrollDocs.length > 0) await scrollDepth.insertMany(scrollDocs);

    return new Response(JSON.stringify({ success: true, recorded: eventDocs.length }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

function parseCookie(cookieHeader: string, name: string): string | undefined {
  const match = cookieHeader.match(new RegExp(`${name}=([^;]+)`));
  return match?.[1];
}
