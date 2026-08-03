import type { APIRoute } from 'astro';
import { createDatabase, type Env } from '../../../db';
import { newsletterSubscribers } from '../../../db/schema';
import { getOrCreateSessionId, registerSession } from '../../../lib/session';
import { getErrorMessage } from '../../../lib/errors';
import { checkRateLimit, getClientIp } from '../../../lib/rateLimit';

const json = (body: unknown, status = 200, extraHeaders: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
  });

export const GET: APIRoute = async ({ request, locals, cookies }) => {
  const env = (locals as { env: Env }).env;
  if (!env) return json({ success: false, error: 'Environment not configured' }, 503);

  const url = new URL(request.url);
  const action = url.searchParams.get('action') || 'stats';
  const token = url.searchParams.get('token') || '';

  try {
    await createDatabase(env);
    void getOrCreateSessionId(cookies);

    if (action === 'confirm') {
      if (!token) return json({ success: false, error: 'Token required' }, 400);

      const sub = await newsletterSubscribers.findOneAndUpdate(
        { confirmationToken: token, status: 'pending' },
        { $set: { status: 'confirmed', confirmedAt: new Date() } },
        { new: true }
      );

      if (!sub) return json({ success: false, error: 'Invalid or expired token' }, 400);

      return json({ success: true, message: 'Email confirmed successfully' });
    }

    const [total, confirmed, pending] = await Promise.all([
      newsletterSubscribers.countDocuments(),
      newsletterSubscribers.countDocuments({ status: 'confirmed' }),
      newsletterSubscribers.countDocuments({ status: 'pending' }),
    ]);

    return json({ success: true, data: { total, confirmed, pending } }, 200, {
      'Cache-Control': 'public, max-age=60, s-maxage=120',
    });
  } catch (error) {
    return json({ success: false, error: getErrorMessage(error) }, 500);
  }
};

export const POST: APIRoute = async ({ request, locals, cookies }) => {
  const env = (locals as { env: Env }).env;
  if (!env) return json({ success: false, error: 'Environment not configured' }, 503);

  const limited = await checkRateLimit(request, {
    key: 'newsletter:post',
    limit: 20,
    windowMs: 60_000,
  });
  if (limited) return limited;

  const url = new URL(request.url);
  const action = url.searchParams.get('action') || 'subscribe';

  try {
    const body = (await request.json()) as { email?: string };
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json({ success: false, error: 'Valid email required' }, 400);
    }

    await createDatabase(env);
    const sessionId = getOrCreateSessionId(cookies);
    await registerSession(env, sessionId, {
      userAgent: request.headers.get('user-agent') || '',
      ip: getClientIp(request),
    });

    if (action === 'unsubscribe') {
      await newsletterSubscribers.updateOne(
        { email },
        { $set: { status: 'unsubscribed', unsubscribedAt: new Date() } }
      );
      return json({ success: true, message: 'Unsubscribed successfully' });
    }

    if (action !== 'subscribe') {
      return json({ success: false, error: 'Unknown action' }, 400);
    }

    const token = crypto.randomUUID();
    const existing = await newsletterSubscribers.findOne({ email });

    if (existing) {
      if (existing.status === 'unsubscribed') {
        await newsletterSubscribers.updateOne(
          { email },
          { $set: { status: 'pending', confirmationToken: token, subscribedAt: new Date() } }
        );
      }
      return json({ success: true, data: { token }, message: 'Subscription confirmed' }, 201);
    }

    await newsletterSubscribers.create({
      email,
      sessionId,
      status: 'pending',
      confirmationToken: token,
      subscribedAt: new Date(),
    });

    return json({ success: true, data: { token }, message: 'Check your email to confirm' }, 201);
  } catch (error) {
    return json({ success: false, error: getErrorMessage(error) }, 500);
  }
};
