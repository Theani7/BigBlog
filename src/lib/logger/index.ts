// =============================================================================
// LOG LEVELS
// =============================================================================
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

// =============================================================================
// LOG ENTRY
// =============================================================================
export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  requestId?: string;
  correlationId?: string;
  sessionId?: string;
  page?: string;
  metadata?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

// =============================================================================
// STRUCTURED LOGGER
// =============================================================================
export class Logger {
  private requestId: string | undefined;
  private correlationId: string | undefined;
  private sessionId: string | undefined;
  private page: string | undefined;

  constructor(context?: {
    requestId?: string | undefined;
    correlationId?: string | undefined;
    sessionId?: string | undefined;
    page?: string | undefined;
  }) {
    this.requestId = context?.requestId;
    this.correlationId = context?.correlationId;
    this.sessionId = context?.sessionId;
    this.page = context?.page;
  }

  private createEntry(
    level: LogLevel,
    message: string,
    metadata?: Record<string, unknown>,
    error?: Error
  ): LogEntry {
    return {
      level,
      message,
      timestamp: new Date(),
      requestId: this.requestId,
      correlationId: this.correlationId,
      sessionId: this.sessionId,
      page: this.page,
      metadata,
      error: error
        ? {
            name: error.name,
            message: error.message,
            ...(error.stack ? { stack: error.stack } : {}),
          }
        : undefined,
    };
  }

  private formatEntry(entry: LogEntry): string {
    const parts = [
      `[${entry.timestamp.toISOString()}]`,
      `[${entry.level.toUpperCase()}]`,
      entry.requestId ? `[req:${entry.requestId}]` : '',
      entry.correlationId ? `[corr:${entry.correlationId}]` : '',
      entry.message,
    ].filter(Boolean);

    if (entry.metadata) {
      parts.push(JSON.stringify(entry.metadata));
    }

    if (entry.error?.stack) {
      parts.push(`\n${entry.error.stack}`);
    }

    return parts.join(' ');
  }

  debug(message: string, metadata?: Record<string, unknown>): void {
    const entry = this.createEntry('debug', message, metadata);
    console.debug(this.formatEntry(entry));
  }

  info(message: string, metadata?: Record<string, unknown>): void {
    const entry = this.createEntry('info', message, metadata);
    console.info(this.formatEntry(entry));
  }

  warn(message: string, metadata?: Record<string, unknown>): void {
    const entry = this.createEntry('warn', message, metadata);
    console.warn(this.formatEntry(entry));
  }

  error(message: string, error?: Error, metadata?: Record<string, unknown>): void {
    const entry = this.createEntry('error', message, metadata, error);
    console.error(this.formatEntry(entry));
  }

  fatal(message: string, error?: Error, metadata?: Record<string, unknown>): void {
    const entry = this.createEntry('fatal', message, metadata, error);
    console.error(this.formatEntry(entry));
  }

  child(context: {
    requestId?: string;
    correlationId?: string;
    sessionId?: string;
    page?: string;
  }): Logger {
    return new Logger({
      requestId: context.requestId ?? this.requestId,
      correlationId: context.correlationId ?? this.correlationId,
      sessionId: context.sessionId ?? this.sessionId,
      page: context.page ?? this.page,
    });
  }
}

// =============================================================================
// REQUEST LOGGING MIDDLEWARE
// =============================================================================
export function generateRequestId(): string {
  return crypto.randomUUID().slice(0, 8);
}

export function generateCorrelationId(): string {
  return crypto.randomUUID().slice(0, 12);
}

// =============================================================================
// GLOBAL LOGGER INSTANCE
// =============================================================================
export const logger = new Logger();
