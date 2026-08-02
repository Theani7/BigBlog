import type { APIRoute } from 'astro';
import { createDatabase, type Env } from '../../../db';
import { User } from '../../../db/schema';
import { verifyPassword, signAuthToken } from '../../../lib/auth';

export const POST: APIRoute = async ({ request, locals, cookies }) => {
  const env = (locals as { env: Env }).env;

  if (!env) {
    return new Response(JSON.stringify({ success: false, error: 'Environment not configured' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return new Response(
        JSON.stringify({ success: false, error: 'Email and password are required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Connect to database
    await createDatabase(env);

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid email or password' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid email or password' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Suspended accounts cannot sign in
    if (user.suspended) {
      return new Response(
        JSON.stringify({ success: false, error: 'This account has been suspended' }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Create session token
    const token = await signAuthToken(
      {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      },
      env
    );

    // Set cookie
    cookies.set('auth_token', token, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return new Response(
      JSON.stringify({
        success: true,
        user: { id: user._id, email: user.email, name: user.name, role: user.role },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
