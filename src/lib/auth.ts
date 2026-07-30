import bcrypt from 'bcryptjs';
import * as jose from 'jose';

// We get the secret from environment variables or fallback for development
const getJwtSecret = (env: any) => {
  const secret = env?.JWT_SECRET || process.env.JWT_SECRET || 'super-secure-dev-secret-key-12345';
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
export async function signAuthToken(
  payload: { userId: string; role: string; email: string },
  env?: any
): Promise<string> {
  const alg = 'HS256';
  return new jose.SignJWT(payload)
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime('7d') // Sessions last for 7 days
    .sign(getJwtSecret(env));
}

/**
 * Verify a JWT token and return its payload.
 * Returns null if invalid or expired.
 */
export async function verifyAuthToken(token: string, env?: any): Promise<any | null> {
  try {
    const { payload } = await jose.jwtVerify(token, getJwtSecret(env));
    return payload;
  } catch (_error) {
    return null;
  }
}
