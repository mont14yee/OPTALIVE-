import { ApiErrorResponse } from '../../src/types/football.js';

export class FootballError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: string;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode = 500, code = 'FOOTBALL_INTERNAL_ERROR', details?: string) {
    super(sanitizeSecrets(message));
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details ? sanitizeSecrets(details) : undefined;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class FootballNotFoundError extends FootballError {
  constructor(resource: string, id?: string | number) {
    super(
      id !== undefined ? `${resource} with ID '${id}' was not found.` : `${resource} was not found.`,
      404,
      'RESOURCE_NOT_FOUND'
    );
  }
}

export class FootballValidationError extends FootballError {
  constructor(message: string, details?: string) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class FootballRateLimitError extends FootballError {
  public readonly retryAfterSeconds?: number;

  constructor(message = 'Upstream football data provider rate limit exceeded. Serving cached data.', retryAfterSeconds?: number) {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export class FootballTimeoutError extends FootballError {
  constructor(endpoint: string, timeoutMs: number) {
    super(
      `Upstream request to '${sanitizeSecrets(endpoint)}' timed out after ${timeoutMs}ms.`,
      504,
      'GATEWAY_TIMEOUT'
    );
  }
}

export class FootballProviderError extends FootballError {
  constructor(message: string, upstreamStatusCode?: number, details?: string) {
    super(
      `Upstream football provider returned an error: ${sanitizeSecrets(message)}`,
      upstreamStatusCode && upstreamStatusCode >= 400 && upstreamStatusCode < 500 ? 502 : 502,
      'PROVIDER_ERROR',
      details
    );
  }
}

/**
 * Remove sensitive strings like SPORTMONKS_API_TOKEN, Bearer tokens, or query params from text
 */
export function sanitizeSecrets(text: string): string {
  if (!text) return '';
  let sanitized = text;

  const token = process.env.SPORTMONKS_API_TOKEN;
  if (token && token.length > 3) {
    sanitized = sanitized.split(token).join('[REDACTED_API_TOKEN]');
  }

  const geminiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (geminiKey && geminiKey.length > 3) {
    sanitized = sanitized.split(geminiKey).join('[REDACTED_KEY]');
  }

  // Redact any query param api_token=... or token=...
  sanitized = sanitized.replace(/([?&](?:api_)?token=)[^&\s]+/gi, '$1[REDACTED]');
  sanitized = sanitized.replace(/(Bearer\s+)[a-zA-Z0-9_\-\.]+/gi, '$1[REDACTED]');

  return sanitized;
}

/**
 * Build standardized, secure error response (never exposes stack traces)
 */
export function formatErrorResponse(err: unknown): { statusCode: number; body: ApiErrorResponse } {
  let statusCode = 500;
  let code = 'INTERNAL_SERVER_ERROR';
  let message = 'An unexpected football data processing error occurred.';
  let details: string | undefined;

  if (err instanceof FootballError) {
    statusCode = err.statusCode;
    code = err.code;
    message = err.message;
    details = err.details;
  } else if (err instanceof Error) {
    message = sanitizeSecrets(err.message);
  }

  return {
    statusCode,
    body: {
      success: false,
      error: {
        code,
        message,
        details,
        timestamp: new Date().toISOString()
      }
    }
  };
}
