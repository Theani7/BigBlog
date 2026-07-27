import { createApiContext, handleCors, rateLimit, parseBody } from '../middleware';
import { createDatabase, type Env } from '../../db';
import { NewsletterService } from '../../lib/services';
import { successResponse, errorResponse } from '../../lib/errors';
import { validateNewsletter } from '../../lib/validation';

export async function handleNewsletter(request: Request, env: Env): Promise<Response> {
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  try {
    const db = createDatabase(env);
    const ctx = await createApiContext(request, db);
    const newsletterService = new NewsletterService(db);

    if (request.method === 'POST') {
      const body = await parseBody<{ email: string }>(request);

      // Rate limit: 5 subscriptions per hour per IP
      const clientIp = request.headers.get('CF-Connecting-IP') || ctx.sessionId;
      const { allowed, retryAfter } = rateLimit(`newsletter:${clientIp}`, 3600000, 5);
      if (!allowed) {
        return errorResponse(new Error(`Rate limit exceeded. Retry after ${retryAfter}s`));
      }

      // Validate input
      const validation = validateNewsletter(body);
      if (!validation.valid) {
        return errorResponse(new Error(validation.errors.join(', ')));
      }

      const result = await newsletterService.subscribe(body.email, ctx.sessionId);
      return successResponse(result, 'Subscription confirmed', 201);
    }

    if (request.method === 'GET') {
      const stats = await newsletterService.getStats();
      return successResponse(stats);
    }

    return errorResponse(new Error('Method not allowed'));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function handleNewsletterConfirm(
  _request: Request,
  env: Env,
  token: string
): Promise<Response> {
  try {
    const db = createDatabase(env);
    const newsletterService = new NewsletterService(db);
    const result = await newsletterService.confirm(token);
    return successResponse(result, 'Email confirmed successfully');
  } catch (error) {
    return errorResponse(error);
  }
}

export async function handleNewsletterUnsubscribe(
  _request: Request,
  env: Env,
  email: string
): Promise<Response> {
  try {
    const db = createDatabase(env);
    const newsletterService = new NewsletterService(db);
    const result = await newsletterService.unsubscribe(email);
    return successResponse(result, 'Unsubscribed successfully');
  } catch (error) {
    return errorResponse(error);
  }
}
