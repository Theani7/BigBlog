import { describe, it, expect } from 'vitest';
import { signAuthToken, verifyAuthToken, hashPassword, verifyPassword } from '../src/lib/auth';

const env = { JWT_SECRET: 'test-secret-that-is-long-enough-for-hs256' };

describe('auth tokens', () => {
  it('round-trips a payload', async () => {
    const token = await signAuthToken(
      { userId: 'u123', role: 'AUTHOR', email: 'a@b.com', name: 'Ana' },
      env
    );
    const payload = await verifyAuthToken(token, env);
    expect(payload).toEqual({
      userId: 'u123',
      role: 'AUTHOR',
      email: 'a@b.com',
      name: 'Ana',
    });
  });

  it('defaults missing name to an empty string', async () => {
    const token = await signAuthToken({ userId: 'u1', role: 'AUTHOR', email: 'a@b.com' }, env);
    const payload = await verifyAuthToken(token, env);
    expect(payload?.name).toBe('');
  });

  it('rejects a token signed with a different secret', async () => {
    const token = await signAuthToken({ userId: 'u1', role: 'ADMIN', email: 'a@b.com' }, env);
    const payload = await verifyAuthToken(token, { JWT_SECRET: 'another-secret' });
    expect(payload).toBeNull();
  });

  it('rejects garbage input', async () => {
    expect(await verifyAuthToken('not.a.jwt', env)).toBeNull();
    expect(await verifyAuthToken('', env)).toBeNull();
  });

  it('throws when no secret is configured', async () => {
    await expect(
      signAuthToken({ userId: 'u1', role: 'AUTHOR', email: 'a@b.com' }, {})
    ).rejects.toThrow(/JWT_SECRET/);
  });
});

describe('passwords', () => {
  it('hashes and verifies a password', async () => {
    const hash = await hashPassword('s3cret-password');
    expect(hash).not.toContain('s3cret-password');
    await expect(verifyPassword('s3cret-password', hash)).resolves.toBe(true);
    await expect(verifyPassword('wrong-password', hash)).resolves.toBe(false);
  });
});
