import type { APIRoute } from 'astro';
import { createDatabase, type Env } from '../../../db';
import { User } from '../../../db/schema';
import { hashPassword, signAuthToken } from '../../../lib/auth';

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
    const { email, password, name } = body;

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

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return new Response(JSON.stringify({ success: false, error: 'Email is already in use' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Determine role (make first user ADMIN, others READER)
    const count = await User.countDocuments();
    const role = count === 0 ? 'ADMIN' : 'READER';

    // Hash password and create user
    const passwordHash = await hashPassword(password);
    const user = await User.create({
      email,
      passwordHash,
      name,
      role,
    });

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
      secure: true, // Assuming production is HTTPS
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return new Response(
      JSON.stringify({
        success: true,
        user: { id: user._id, email: user.email, name: user.name, role: user.role },
      }),
      {
        status: 201,
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
