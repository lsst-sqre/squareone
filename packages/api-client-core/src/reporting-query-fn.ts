import { classifyError } from './errors';
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
   * Runtime override forwarded to the error classifier; controls whether
   * network-level failures are report-worthy. Defaults to auto-detection.
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

  return async (): Promise<T> => {
    try {
      return await fetchFn();
    } catch (err) {
      logger.error({ err, ...context }, 'API query failed');

      const classification = classifyError(err, { isServer });
      if (classification === 'report-worthy') {
        reportError?.(err, context);
      }

      return fallback;
    }
  };
}
