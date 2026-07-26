import type { Database } from '../../db';
import { SessionService } from '../services';

export interface ApiContext {
  db: Database;
  sessionId: string;
  request: Request;
  url: URL;
  params: Record<string, string>;
}

/**
 * Extract session ID from cookie or create new session
 */
async function getSessionId(request: Request, db: Database): Promise<string> {
  const cookieHeader = request.headers.get('Cookie') || '';
  const cookies = Object.fromEntries(
    cookieHeader.split(';').map((c) => {
      const [key, ...val] = c.split('=');
      return [key.trim(), val.join('=').trim()];
    })
  );

  let sessionId = cookies['bb_session'];

  if (!sessionId) {
    // Create fingerprint from available data
    const userAgent = request.headers.get('User-Agent') || '';
    const clientIp = request.headers.get('CF-Connecting-IP') || 'unknown';
    const fingerprint = await generateFingerprint(userAgent, clientIp);

    const sessionService = new SessionService(db);
    sessionId = await sessionService.getOrCreateSession(fingerprint, clientIp, userAgent);
  }

  return sessionId;
}

/**
 * Generate a browser fingerprint
 */
async function generateFingerprint(userAgent: string, ip: string): Promise<string> {
  const data = `${userAgent}:${ip}:${Date.now()}`;
  const encoder = new TextEncoder();
  const buffer = await crypto.subtle.digest('SHA-256', encoder.encode(data));
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Create API context with database and session
 */
export async function createApiContext(
  request: Request,
  db: Database,
  params: Record<string, string> = {}
): Promise<ApiContext> {
  const url = new URL(request.url);
  const sessionId = await getSessionId(request, db);

  return {
    db,
    sessionId,
    request,
    url,
    params,
  };
}

/**
 * CORS headers for API responses
 */
export function corsHeaders(origin?: string): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

/**
 * Handle CORS preflight
 */
export function handleCors(request: Request): Response | null {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(),
    });
  }
  return null;
}

/**
 * Rate limiting middleware
 */
const rateLimitStore = new Map<string, number[]>();

export function rateLimit(
  key: string,
  windowMs: number = 60000,
  maxRequests: number = 100
): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const timestamps = rateLimitStore.get(key) || [];

  // Clean old timestamps
  const recentTimestamps = timestamps.filter((t) => now - t < windowMs);

  if (recentTimestamps.length >= maxRequests) {
    const oldest = Math.min(...recentTimestamps);
    return {
      allowed: false,
      retryAfter: Math.ceil((oldest + windowMs - now) / 1000),
    };
  }

  recentTimestamps.push(now);
  rateLimitStore.set(key, recentTimestamps);

  return { allowed: true };
}

/**
 * JSON body parser with error handling
 */
export async function parseBody<T>(request: Request): Promise<T> {
  try {
    const body = await request.json();
    return body as T;
  } catch {
    throw new Error('Invalid JSON body');
  }
}
