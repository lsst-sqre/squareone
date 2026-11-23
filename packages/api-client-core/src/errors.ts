import { ZodError } from 'zod';

/**
 * The two-way classification of a caught error.
 *
 * - `expected` — a routine, non-alarming failure (e.g. an auth 401/403). These
 *   are logged for diagnostics but must not page anyone.
 * - `report-worthy` — a failure that indicates a real problem worth surfacing to
 *   an error reporter (e.g. Sentry): API contract drift (a {@link ZodError}), a
 *   server-side 5xx, or — server-side only — a network-level failure.
 */
export type ErrorClassification = 'expected' | 'report-worthy';

/** Options controlling {@link classifyError}'s runtime-dependent behavior. */
export type ClassifyErrorOptions = {
  /**
   * Whether classification is running server-side. Network-level failures are
   * report-worthy on the server but only log-worthy (`expected`) in the browser,
   * where transient connectivity loss is routine and not actionable. Defaults to
   * detecting the absence of a `window` global.
   */
  isServer?: boolean;
};

/**
 * Resolve whether code is running server-side: an explicit override wins,
 * otherwise a server (Node) runtime is detected by the absence of the `window`
 * global.
 *
 * @param isServer - An explicit override, e.g. {@link ClassifyErrorOptions.isServer}.
 */
export function resolveIsServer(isServer?: boolean): boolean {
  return isServer ?? typeof window === 'undefined';
}

/**
 * Read a numeric HTTP status code from an error, if it exposes one.
 *
 * The Rubin client packages' error classes (`SemaphoreError`, `RepertoireError`,
 * …) carry an optional `statusCode` field; this duck-types on that shape without
 * depending on any one class.
 */
function getStatusCode(err: unknown): number | undefined {
  if (
    typeof err === 'object' &&
    err !== null &&
    'statusCode' in err &&
    typeof (err as { statusCode: unknown }).statusCode === 'number'
  ) {
    return (err as { statusCode: number }).statusCode;
  }
  return undefined;
}

/**
 * Whether a caught error is a network-level failure: the request got no HTTP
 * response to judge (the service was unreachable, the connection was reset,
 * the fetch timed out, …) rather than an HTTP error or API contract drift.
 *
 * Concretely, an error that carries no numeric HTTP status code and is not a
 * {@link ZodError} — e.g. Node's `TypeError: fetch failed` wrapping
 * `ECONNRESET`. This is the one definition of "network-level" shared by
 * {@link classifyError} and `reportingQueryFn`'s retry.
 *
 * @param err - The caught error (typed `unknown`, as caught errors are).
 */
export function isNetworkError(err: unknown): boolean {
  return !(err instanceof ZodError) && getStatusCode(err) === undefined;
}

/**
 * Classify a caught error as `expected` (log-only) or `report-worthy`
 * (log-and-report).
 *
 * Rules, in order:
 * 1. HTTP 401 / 403 → `expected` (auth failures are routine).
 * 2. A {@link ZodError} → `report-worthy` (API contract drift).
 * 3. HTTP 5xx → `report-worthy` (upstream server failure).
 * 4. Any other HTTP status (e.g. 404, 400) → `expected`.
 * 5. A network-level failure ({@link isNetworkError}: no numeric status code
 *    and not a ZodError — e.g. a fetch `TypeError` or a timeout) →
 *    `report-worthy` server-side, `expected` in the browser.
 *
 * @param err - The caught error (typed `unknown`, as caught errors are).
 * @param options - Runtime hints; see {@link ClassifyErrorOptions}.
 * @returns The error's {@link ErrorClassification}.
 */
export function classifyError(
  err: unknown,
  options: ClassifyErrorOptions = {}
): ErrorClassification {
  // API contract drift is always report-worthy, regardless of runtime.
  if (err instanceof ZodError) {
    return 'report-worthy';
  }

  // Network-level failure (service unreachable, fetch TypeError, timeout).
  // Report-worthy on the server; log-only in the browser where transient
  // connectivity loss is routine.
  if (isNetworkError(err)) {
    return resolveIsServer(options.isServer) ? 'report-worthy' : 'expected';
  }

  const statusCode = getStatusCode(err);
  if (statusCode === 401 || statusCode === 403) {
    return 'expected';
  }
  if (statusCode !== undefined && statusCode >= 500) {
    return 'report-worthy';
  }
  // Other HTTP statuses (404, 400, …) are expected/log-only.
  return 'expected';
}
