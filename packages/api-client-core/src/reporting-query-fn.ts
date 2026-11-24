import {
  classifyError,
  isConnectionError,
  QueryTimeoutError,
  resolveIsServer,
} from './errors';
import { defaultLogger, type Logger } from './logger';

/**
 * How long one server-side call of a {@link reportingQueryFn} query function
 * may take, retry included, in milliseconds, unless
 * {@link ReportingQueryFnOptions.timeoutMs} overrides it.
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
   * Server-side, it is passed an `AbortSignal` that is aborted when the call
   * times out (see {@link ReportingQueryFnOptions.timeoutMs}); pass it on to
   * `fetch` so a timed-out request is cancelled rather than left running. A
   * retry gets the same signal. In the browser, or with the timeout disabled,
   * no signal is passed.
   */
  fetchFn: (signal?: AbortSignal) => Promise<T>;
  /**
   * The benign value returned on a failure, preserving graceful degradation
   * (e.g. an empty broadcasts list): on *any* failure, unless
   * {@link ReportingQueryFnOptions.rethrowReportWorthy} is set.
   */
  fallback: T;
  /** Logger for all failures. Defaults to a console-backed logger. */
  logger?: Logger;
  /** Hook invoked only for report-worthy failures. Optional. */
  reportError?: ReportError;
  /** Context forwarded to {@link reportError}. */
  context?: ReportContext;
  /**
   * Runtime override for server-side behaviour: server-side, the call has a
   * timeout, and a connection failure is retried once and is report-worthy if
   * the retry fails too. Forwarded to the error classifier. Defaults to
   * auto-detection.
   */
  isServer?: boolean;
  /**
   * Server-side, how long the whole call may take, in milliseconds, before
   * its signal is aborted and it fails with a {@link QueryTimeoutError}. The
   * retry of a connection failure gets only the time that is left, so the
   * call never takes longer than this. Defaults to
   * {@link DEFAULT_SERVER_TIMEOUT_MS}.
   *
   * A value that is not a positive, finite number (`0`, a negative number,
   * `NaN` or `Infinity`) disables the timeout. Ignored in the browser, where
   * no timeout applies.
   */
  timeoutMs?: number;
  /**
   * Whether a report-worthy failure (contract drift, a 5xx, or server-side a
   * network error or timeout) is rethrown instead of resolving to `fallback`.
   * It is still logged and reported first; an expected failure, such as the
   * 401 or 403 of a visitor who is not signed in, still resolves to
   * `fallback`. Defaults to false.
   *
   * Set it for a server-side prefetch whose result is dehydrated into the
   * page: a fallback that stands in for an outage would otherwise be cached
   * as fresh data and hydrated in the browser, which would then not ask the
   * upstream itself. Rejecting leaves the query in `error` state, which
   * TanStack Query's `dehydrate` leaves out by default, so the browser fetches
   * it instead. An expected failure is the answer the browser would get too,
   * so its fallback is safe to hydrate.
   */
  rethrowReportWorthy?: boolean;
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
 * reporting SDK — `reportError` is injected by the app. With
 * {@link ReportingQueryFnOptions.rethrowReportWorthy}, a report-worthy failure
 * is rethrown after it is logged and reported, instead of degrading.
 *
 * Server-side, the call is time-boxed (5 seconds unless
 * {@link ReportingQueryFnOptions.timeoutMs} says otherwise): when the time
 * runs out, the call's `AbortSignal` is aborted, cancelling the request, and
 * the call fails with a {@link QueryTimeoutError}. That takes the failure path
 * above (a server-side timeout is report-worthy) without a retry, so a hung
 * upstream degrades the render to the fallback instead of stalling it.
 *
 * Server-side, a connection failure (see `isConnectionError`: e.g.
 * `TypeError: fetch failed` from a reset connection) is first retried once,
 * immediately, within the same time budget. If the retry succeeds, its value
 * is returned and the first failure is only logged as a warning; if it fails,
 * the retry's error takes the failure path above, once. Other failures (HTTP
 * errors, contract drift, timeouts, a non-JSON body, an invalid URL) are never
 * retried. In the browser there is no timeout and nothing is retried.
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
    rethrowReportWorthy = false,
  } = options;

  // The single failure path: log, report if report-worthy, then degrade (or,
  // if asked to, rethrow a report-worthy failure).
  const handleFailure = (err: unknown): T => {
    logger.error({ err, ...context }, 'API query failed');

    const classification = classifyError(err, { isServer });
    if (classification === 'report-worthy') {
      reportError?.(err, context);
      if (rethrowReportWorthy) {
        throw err;
      }
    }

    return fallback;
  };

  // Server-side: the attempt and, after a connection failure, one immediate
  // retry, both passed the call's signal.
  const fetchWithRetry = async (signal?: AbortSignal): Promise<T> => {
    try {
      return await fetchFn(signal);
    } catch (err) {
      // Once the deadline has passed the call has already failed with the
      // timeout, so there is nothing left to retry for.
      if (signal?.aborted || !isConnectionError(err)) {
        throw err;
      }
      logger.warn(
        { err, ...context },
        'API query failed with a connection error; retrying once'
      );
    }
    return fetchFn(signal);
  };

  return async (): Promise<T> => {
    // In the browser: one attempt, no timeout, no signal.
    if (!resolveIsServer(isServer)) {
      try {
        return await fetchFn();
      } catch (err) {
        return handleFailure(err);
      }
    }

    try {
      return await (isTimeout(timeoutMs)
        ? withDeadline(fetchWithRetry, timeoutMs)
        : fetchWithRetry());
    } catch (err) {
      return handleFailure(err);
    }
  };
}

/**
 * Whether `timeoutMs` sets a timeout: a positive, finite number of
 * milliseconds. Anything else (`0`, a negative number, `NaN`, `Infinity`)
 * means no timeout, rather than the 1 ms that Node clamps it to, which would
 * fail every attempt at once.
 */
function isTimeout(timeoutMs: number): boolean {
  return Number.isFinite(timeoutMs) && timeoutMs > 0;
}

/**
 * Run `run` within one deadline, `timeoutMs` from now.
 *
 * `run` gets an `AbortSignal` for the whole call, retry included. If it has
 * not settled by the deadline, the signal is aborted with a
 * {@link QueryTimeoutError} and the returned promise rejects with that error
 * straight away, so a `fetchFn` that ignores the signal still cannot hold up
 * the caller. The timer is cleared as soon as `run` settles.
 */
async function withDeadline<T>(
  run: (signal: AbortSignal) => Promise<T>,
  timeoutMs: number
): Promise<T> {
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_resolve, reject) => {
    timer = setTimeout(() => {
      const err = new QueryTimeoutError(timeoutMs);
      // Reject first, so the call fails with the timeout even when `fetchFn`
      // reacts to the abort by rejecting with an error of its own.
      reject(err);
      controller.abort(err);
    }, timeoutMs);
  });

  try {
    return await Promise.race([run(controller.signal), timeout]);
  } finally {
    clearTimeout(timer);
  }
}
