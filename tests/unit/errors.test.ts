import { describe, it, expect } from 'vitest';
import {
  AppError,
  NotFoundError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  RateLimitError,
  DatabaseError,
  handleError,
} from '../../src/lib/errors/index';

describe('Error classes', () => {
  it('AppError has correct defaults', () => {
    const err = new AppError('test');
    expect(err.message).toBe('test');
    expect(err.statusCode).toBe(500);
    expect(err.isOperational).toBe(true);
  });

  it('NotFoundError has 404 status', () => {
    const err = new NotFoundError('Post');
    expect(err.statusCode).toBe(404);
    expect(err.message).toBe('Post not found');
  });

  it('ValidationError has 400 status and errors array', () => {
    const err = new ValidationError(['field required']);
    expect(err.statusCode).toBe(400);
    expect(err.errors).toEqual(['field required']);
  });

  it('UnauthorizedError has 401 status', () => {
    expect(new UnauthorizedError().statusCode).toBe(401);
  });

  it('ForbiddenError has 403 status', () => {
    expect(new ForbiddenError().statusCode).toBe(403);
  });

  it('ConflictError has 409 status', () => {
    expect(new ConflictError().statusCode).toBe(409);
  });

  it('RateLimitError has 429 status', () => {
    const err = new RateLimitError(30);
    expect(err.statusCode).toBe(429);
    expect(err.retryAfter).toBe(30);
  });

  it('DatabaseError is not operational', () => {
    expect(new DatabaseError().isOperational).toBe(false);
  });
});

describe('handleError', () => {
  it('handles ValidationError', () => {
    const result = handleError(new ValidationError(['bad']));
    expect(result.statusCode).toBe(400);
    expect(result.body.error).toBe('Validation failed');
  });

  it('handles AppError', () => {
    const result = handleError(new NotFoundError());
    expect(result.statusCode).toBe(404);
  });

  it('handles unknown error', () => {
    const result = handleError(new Error('unexpected'));
    expect(result.statusCode).toBe(500);
  });
});
