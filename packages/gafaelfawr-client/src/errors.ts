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
 * Error thrown when Gafaelfawr answers 404 because the environment has no
 * OpenID Connect server configured at all.
 *
 * Gafaelfawr overloads 404 on the OIDC client API: on the collection endpoints
 * it means "this environment has no OIDC server", while on a
 * `/oidc-clients/{client_id}` route it means "no such client". Only the former
 * is raised as this subclass, so a UI can render an "OpenID Connect is not
 * enabled here" empty state instead of a generic error — and so a missing
 * client still surfaces as an ordinary 404.
 */
export class OidcNotConfiguredError extends GafaelfawrError {
  constructor(
    message = 'The OpenID Connect server is not configured in this environment.',
    details?: unknown
  ) {
    super(message, 404, details);
    this.name = 'OidcNotConfiguredError';
  }
}

/**
 * Type guard for {@link OidcNotConfiguredError}.
 *
 * Prefer this over `instanceof` at call sites that receive an `unknown` error
 * (e.g. a TanStack Query `error`).
 */
export function isOidcNotConfiguredError(
  error: unknown
): error is OidcNotConfiguredError {
  return error instanceof OidcNotConfiguredError;
}

/**
 * Error structure for OpenID Connect client mutation failures.
 *
 * Same shape as {@link TokenCreationError} / {@link TokenDeletionError}: the
 * hooks expose a plain object rather than the thrown class so components can
 * branch on `status` without importing error classes.
 */
export type OidcClientMutationError = {
  status: number;
  message: string;
  details?: unknown;
};

/**
 * Normalize a caught error into the `{ status, message, details }` shape the
 * mutation hooks expose.
 *
 * A {@link GafaelfawrError} keeps its status (defaulting to 500 when the throw
 * site had none); anything else — a fetch `TypeError`, an abort — is reported
 * as status `0`, the sentinel these hooks already use for "never reached the
 * server".
 */
export function toGafaelfawrErrorInfo(error: unknown): OidcClientMutationError {
  if (error instanceof GafaelfawrError) {
    return {
      status: error.statusCode ?? 500,
      message: error.message,
      details: error.details,
    };
  }
  return {
    status: 0,
    message: error instanceof Error ? error.message : 'Network error',
  };
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
 * Entries carrying a location render as `loc.path: message`. Gafaelfawr's
 * `ErrorModel` omits or nulls `loc` for errors about the request as a whole
 * (a 403, a missing OIDC server), so those render as the bare message rather
 * than a misleading `unknown:` prefix.
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
    return detail.map(formatSingleValidationError).join('; ');
  }

  return formatSingleValidationError(detail);
}

/** Render one validation error, prefixing its location only when it has one. */
function formatSingleValidationError(error: ValidationError): string {
  const location = error.loc?.join('.');
  return location ? `${location}: ${error.msg}` : error.msg;
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
