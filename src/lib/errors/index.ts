/**
 * Custom error classes for the API layer
 */

/**
 * Safely extract a message from an unknown error.
 * Never throws; never leaks non-message internals.
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return 'Internal error';
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404);
  }
}

export class ValidationError extends AppError {
  public readonly errors: string[];

  constructor(errors: string[]) {
    super('Validation failed', 400);
    this.errors = errors;
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource already exists') {
    super(message, 409);
  }
}

export class RateLimitError extends AppError {
  public readonly retryAfter: number;

  constructor(retryAfter: number = 60) {
    super('Rate limit exceeded', 429);
    this.retryAfter = retryAfter;
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = 'Database error') {
    super(message, 500, false);
  }
}

/**
 * Handle errors and return appropriate API response
 */
export function handleError(error: unknown): {
  statusCode: number;
  body: { success: false; error: string; details?: string[] };
} {
  if (error instanceof ValidationError) {
    return {
      statusCode: error.statusCode,
      body: {
        success: false,
        error: error.message,
        details: error.errors,
      },
    };
  }

  if (error instanceof AppError) {
    return {
      statusCode: error.statusCode,
      body: {
        success: false,
        error: error.message,
      },
    };
  }

  // Unexpected error
  console.error('Unexpected error:', error);
  return {
    statusCode: 500,
    body: {
      success: false,
      error: 'An unexpected error occurred',
    },
  };
}

/**
 * Create a success response
 */
export function successResponse<T>(data: T, message?: string, statusCode: number = 200) {
  return new Response(
    JSON.stringify({
      success: true,
      data,
      message,
    }),
    {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}

/**
 * Create an error response
 */
export function errorResponse(error: unknown) {
  const { statusCode, body } = handleError(error);
  return new Response(JSON.stringify(body), {
    status: statusCode,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

/**
 * Create a paginated response
 */
export function paginatedResponse<T>(
  data: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }
) {
  return new Response(
    JSON.stringify({
      success: true,
      data,
      pagination,
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}
