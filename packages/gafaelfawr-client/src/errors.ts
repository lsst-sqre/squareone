/**
 * Error classes for Gafaelfawr API interactions.
 */
import type { ValidationError } from './schemas';

/**
 * Error thrown when Gafaelfawr API requests fail.
 */
export class GafaelfawrError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'GafaelfawrError';
  }
}

/**
 * Error structure for token deletion failures.
 */
export type TokenDeletionError = {
  status: number;
  message: string;
  details?: unknown;
};

/**
 * Error structure for token creation failures.
 */
export type TokenCreationError = {
  status: number;
  message: string;
  details?: {
    detail?: string | ValidationError | ValidationError[];
    [key: string]: unknown;
  };
};

/**
 * Format validation errors from Gafaelfawr/Pydantic into a human-readable message.
 *
 * Handles various error formats:
 * - Simple string detail
 * - Single validation error object
 * - Array of validation errors
 *
 * @param detail - The error detail from the API response
 * @returns Formatted error message
 */
export function formatValidationError(
  detail: string | ValidationError | ValidationError[]
): string {
  if (typeof detail === 'string') {
    return detail;
  }

  if (Array.isArray(detail)) {
    return detail
      .map((err) => {
        const location = err.loc?.join('.') ?? 'unknown';
        return `${location}: ${err.msg}`;
      })
      .join('; ');
  }

  // Single validation error object
  const location = detail.loc?.join('.') ?? 'unknown';
  return `${location}: ${detail.msg}`;
}

/**
 * Create a user-friendly error message based on HTTP status code.
 *
 * @param status - HTTP status code
 * @param defaultMessage - Default message if no specific message for status
 * @returns User-friendly error message
 */
export function getErrorMessageForStatus(
  status: number,
  defaultMessage = 'An error occurred'
): string {
  switch (status) {
    case 401:
      return 'Authentication required. Please log in again.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'The requested resource was not found.';
    case 422:
      return 'Invalid request data.';
    case 500:
      return 'Server error. Please try again later.';
    default:
      return defaultMessage;
  }
}
