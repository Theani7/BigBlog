import { describe, it, expect, vi, afterEach } from 'vitest';
import { isValidSessionId, hashIp, registerSession, sessionExists } from '../src/lib/session';
import { randomUUID } from 'node:crypto';
import mongoose from 'mongoose';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('isValidSessionId', () => {
  it('accepts a UUID v4', () => {
    expect(isValidSessionId(randomUUID())).toBe(true);
  });

  it('accepts uppercase UUIDs', () => {
    expect(isValidSessionId(randomUUID().toUpperCase())).toBe(true);
  });

  it('rejects forged or malformed values', () => {
    expect(isValidSessionId('')).toBe(false);
    expect(isValidSessionId('abc')).toBe(false);
    expect(isValidSessionId('not-a-uuid-at-all')).toBe(false);
    expect(isValidSessionId('12345678')).toBe(false);
    expect(isValidSessionId('session-1234-5678-9012-345678901234')).toBe(false);
    expect(isValidSessionId(randomUUID() + 'extra')).toBe(false);
  });
});

describe('hashIp', () => {
  it('is deterministic for the same IP', () => {
    expect(hashIp('203.0.113.7')).toBe(hashIp('203.0.113.7'));
  });

  it('differs between IPs', () => {
    expect(hashIp('203.0.113.7')).not.toBe(hashIp('203.0.113.8'));
  });

  it('returns a fixed-length hex hash', () => {
    expect(hashIp('203.0.113.7')).toMatch(/^[0-9a-f]{32}$/);
  });

  it('handles missing input', () => {
    expect(hashIp(undefined)).toBe('');
  });
});

describe('registerSession / sessionExists without a database', () => {
  const env = { MONGO_URI: 'mongodb://127.0.0.1:1/nonexistent' };

  it('fails gracefully when the database is unreachable', async () => {
    vi.spyOn(mongoose, 'connect').mockRejectedValue(new Error('connection refused'));
    vi.spyOn(mongoose.connection, 'asPromise').mockRejectedValue(new Error('connection refused'));

    await expect(registerSession(env, randomUUID())).resolves.toBeUndefined();
    await expect(sessionExists(env, randomUUID())).resolves.toBe(false);
  });

  it('never writes a forged session id', async () => {
    vi.spyOn(mongoose, 'connect').mockRejectedValue(new Error('connection refused'));
    vi.spyOn(mongoose.connection, 'asPromise').mockRejectedValue(new Error('connection refused'));

    await expect(registerSession(env, 'garbage-id')).resolves.toBeUndefined();
    await expect(sessionExists(env, 'garbage-id')).resolves.toBe(false);
  });
});
