import {
  classifyError,
  isNetworkError,
  QueryTimeoutError,
  resolveIsServer,
} from './errors';
import { defaultLogger, type Logger } from './logger';

/**
 * How long one server-side attempt of {@link reportingQueryFn} may take, in
 * milliseconds, unless {@link ReportingQueryFnOptions.timeoutMs} overrides it.
 */
export const DEFAULT_SERVER_TIMEOUT_MS = 5_000;

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
  /**
   * The underlying async fetch to run (e.g. a client's `fetchBroadcasts`).
   *
   * Server-side, each attempt is passed an `AbortSignal` that is aborted when
   * the attempt times out (see {@link ReportingQueryFnOptions.timeoutMs}); pass
   * it on to `fetch` so a timed-out request is cancelled rather than left
   * running. In the browser no signal is passed.
   */
  fetchFn: (signal?: AbortSignal) => Promise<T>;
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
   * Runtime override for server-side behaviour: server-side, each attempt has
   * a timeout, and a network-level failure is retried once and is
   * report-worthy if the retry fails too. Forwarded to the error classifier.
   * Defaults to auto-detection.
   */
  isServer?: boolean;
  /**
   * Server-side, how long each attempt may take, in milliseconds, before its
   * signal is aborted and it fails with a {@link QueryTimeoutError}. Defaults
   * to {@link DEFAULT_SERVER_TIMEOUT_MS}. Ignored in the browser, where no
   * timeout applies.
   */
  timeoutMs?: number;
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
 * Server-side, each attempt is time-boxed (5 seconds unless
 * {@link ReportingQueryFnOptions.timeoutMs} says otherwise): when it runs out,
 * the attempt's `AbortSignal` is aborted, cancelling the request, and the
 * attempt fails with a {@link QueryTimeoutError}. That takes the failure path
 * above (a server-side timeout is report-worthy) without a retry, so a hung
 * upstream degrades the render to the fallback instead of stalling it.
 *
 * Server-side, a network-level failure (e.g. `TypeError: fetch failed` from a
 * reset connection) is first retried once, immediately. If the retry succeeds,
 * its value is returned and the first failure is only logged as a warning; if
 * it fails, the retry's error takes the failure path above, once. HTTP errors,
 * contract drift and timeouts are never retried. In the browser there is no
 * timeout and nothing is retried.
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
    timeoutMs = DEFAULT_SERVER_TIMEOUT_MS,
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
    // One attempt: time-boxed server-side, unchanged in the browser.
    const attempt = (): Promise<T> =>
      resolveIsServer(isServer) ? withTimeout(fetchFn, timeoutMs) : fetchFn();

    try {
      return await attempt();
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
      return await attempt();
    } catch (err) {
      return handleFailure(err);
    }
  };
}

/**
 * Run one attempt of `fetchFn` with a timeout.
 *
 * The attempt gets its own `AbortSignal`. If it has not settled after
 * `timeoutMs`, the signal is aborted with a {@link QueryTimeoutError} and the
 * attempt rejects with that error straight away, so a `fetchFn` that ignores
 * the signal still cannot hold up the caller. The timer is cleared as soon as
 * the attempt settles.
 */
async function withTimeout<T>(
  fetchFn: (signal: AbortSignal) => Promise<T>,
  timeoutMs: number
): Promise<T> {
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_resolve, reject) => {
    timer = setTimeout(() => {
      const err = new QueryTimeoutError(timeoutMs);
      // Reject first, so the attempt fails with the timeout even when
      // `fetchFn` reacts to the abort by rejecting with an error of its own.
      reject(err);
      controller.abort(err);
    }, timeoutMs);
  });

  try {
    return await Promise.race([fetchFn(controller.signal), timeout]);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Decide whether a failed first attempt is retried. This is the one place the
 * retry policy lives.
 *
 * Only a fast server-side network-level failure (see {@link isNetworkError})
 * is retried: a dropped or reset connection (`fetch failed` / `ECONNRESET`) is
 * usually transient, so one immediate retry absorbs it instead of reporting
 * it. A {@link QueryTimeoutError} is network-level too, but is not retried:
 * the upstream is hung rather than briefly unreachable, and a retry would
 * double how long the render waits for it. An HTTP error (4xx or 5xx) or
 * contract drift would most likely get the same answer again. In the browser,
 * behaviour is unchanged: a network failure there is routine connectivity loss
 * and is only logged.
 */
function shouldRetry(err: unknown, options: { isServer?: boolean }): boolean {
  return (
    resolveIsServer(options.isServer) &&
    isNetworkError(err) &&
    !(err instanceof QueryTimeoutError)
  );
}
