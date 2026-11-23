import { classifyError, isNetworkError, resolveIsServer } from './errors';
import { defaultLogger, type Logger } from './logger';

/**
 * Structured context describing the call site a failure came from.
 *
 * Passed through verbatim to the {@link ReportError} hook so the reporter can
 * tag the event (e.g. with `site` and `package`). Kept as an open record so
 * callers can attach whatever tags their reporter understands.
 */
export type ReportContext = Record<string, unknown>;

/**
 * Hook invoked for report-worthy failures.
 *
 * The package stays reporter-agnostic: an app injects an implementation (e.g.
 * one that calls `Sentry.captureException`) rather than this package depending
 * on any reporting SDK.
 *
 * @param err - The caught error, forwarded unchanged.
 * @param context - The {@link ReportContext} supplied to {@link reportingQueryFn}.
 */
export type ReportError = (err: unknown, context: ReportContext) => void;

/** Configuration for {@link reportingQueryFn}. */
export type ReportingQueryFnOptions<T> = {
  /** The underlying async fetch to run (e.g. a client's `fetchBroadcasts`). */
  fetchFn: () => Promise<T>;
  /**
   * The benign value returned on *any* failure, preserving graceful
   * degradation (e.g. an empty broadcasts list).
   */
  fallback: T;
  /** Logger for all failures. Defaults to a console-backed logger. */
  logger?: Logger;
  /** Hook invoked only for report-worthy failures. Optional. */
  reportError?: ReportError;
  /** Context forwarded to {@link reportError}. */
  context?: ReportContext;
  /**
   * Runtime override for server-side behaviour: server-side, a network-level
   * failure is retried once and is report-worthy if the retry fails too.
   * Forwarded to the error classifier. Defaults to auto-detection.
   */
  isServer?: boolean;
};

/**
 * Build a TanStack-Query-compatible `queryFn` that degrades gracefully and
 * routes failures to logging and (for report-worthy errors) an injected
 * reporter.
 *
 * On success the fetched value is returned. On *any* failure the caller-supplied
 * `fallback` is returned so the UI keeps working, every failure is logged, and
 * report-worthy failures (contract drift, 5xx, server-side network errors) also
 * invoke `reportError(err, context)`. The package itself never imports a
 * reporting SDK — `reportError` is injected by the app.
 *
 * Server-side, a network-level failure (e.g. `TypeError: fetch failed` from a
 * reset connection) is first retried once, immediately. If the retry succeeds,
 * its value is returned and the first failure is only logged as a warning; if
 * it fails, the retry's error takes the failure path above, once. HTTP errors
 * and contract drift are never retried, and nothing is retried in the browser.
 *
 * @param options - See {@link ReportingQueryFnOptions}.
 * @returns An async function suitable for use as a query function.
 */
export function reportingQueryFn<T>(
  options: ReportingQueryFnOptions<T>
): () => Promise<T> {
  const {
    fetchFn,
    fallback,
    logger = defaultLogger,
    reportError,
    context = {},
    isServer,
  } = options;

  // The single failure path: log, report if report-worthy, degrade.
  const handleFailure = (err: unknown): T => {
    logger.error({ err, ...context }, 'API query failed');

    const classification = classifyError(err, { isServer });
    if (classification === 'report-worthy') {
      reportError?.(err, context);
    }

    return fallback;
  };

  return async (): Promise<T> => {
    try {
      return await fetchFn();
    } catch (err) {
      if (!shouldRetry(err, { isServer })) {
        return handleFailure(err);
      }
      logger.warn(
        { err, ...context },
        'API query failed with a network error; retrying once'
      );
    }

    try {
      return await fetchFn();
    } catch (err) {
      return handleFailure(err);
    }
  };
}

/**
 * Decide whether a failed first attempt is retried. This is the one place the
 * retry policy lives.
 *
 * Only a server-side network-level failure (see {@link isNetworkError}) is
 * retried: a dropped or reset connection (`fetch failed` / `ECONNRESET`) is
 * usually transient, so one immediate retry absorbs it instead of reporting
 * it. An HTTP error (4xx or 5xx) or contract drift would most likely get the
 * same answer again. In the browser, behaviour is unchanged: a network failure
 * there is routine connectivity loss and is only logged.
 */
function shouldRetry(err: unknown, options: { isServer?: boolean }): boolean {
  return resolveIsServer(options.isServer) && isNetworkError(err);
}
