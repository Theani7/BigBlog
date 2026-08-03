import bcrypt from 'bcryptjs';
import * as jose from 'jose';

// The JWT secret must come from the environment. There is deliberately NO
// hardcoded fallback: a predictable secret would let anyone forge auth tokens.
export interface AuthTokenPayload {
  userId: string;
  role: string;
  email: string;
}

type SecretEnv = Record<string, unknown> & { JWT_SECRET?: string };

const getJwtSecret = (env?: SecretEnv) => {
  const secret = env?.JWT_SECRET || import.meta.env.JWT_SECRET || process.env.JWT_SECRET || '';

  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }

  return new TextEncoder().encode(secret);
};

/**
 * Hash a plaintext password using bcryptjs.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Verify a plaintext password against a hash.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Sign a JWT token with the user's ID and role.
 */
export async function signAuthToken(payload: AuthTokenPayload, env?: SecretEnv): Promise<string> {
  const alg = 'HS256';
  return new jose.SignJWT(payload as unknown as jose.JWTPayload)
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime('7d') // Sessions last for 7 days
    .sign(getJwtSecret(env));
}

/**
 * Verify a JWT token and return its payload.
 * Returns null if invalid or expired.
 */
export async function verifyAuthToken(
  token: string,
  env?: SecretEnv
): Promise<AuthTokenPayload | null> {
  try {
    const { payload } = await jose.jwtVerify(token, getJwtSecret(env));
    if (typeof payload.userId !== 'string') return null;
    return {
      userId: payload.userId,
      role: typeof payload.role === 'string' ? payload.role : 'AUTHOR',
      email: typeof payload.email === 'string' ? payload.email : '',
    };
  } catch {
    return null;
  }
}
