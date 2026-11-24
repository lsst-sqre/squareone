import {
  defaultLogger,
  type Logger,
  QueryTimeoutError,
} from '@lsst-sqre/api-client-core';
import { DiscoverySchema, type ServiceDiscovery } from './schemas';

// The `Logger` type's single source of truth now lives in
// `@lsst-sqre/api-client-core`; re-export it here so existing
// `@lsst-sqre/repertoire-client` imports keep compiling.
export type { Logger } from '@lsst-sqre/api-client-core';

export class RepertoireError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number
  ) {
    super(message);
    this.name = 'RepertoireError';
  }
}

/**
 * How long a server-side discovery request may take, in milliseconds, before
 * it is aborted, unless {@link FetchOptions.timeoutMs} overrides it.
 */
export const DEFAULT_DISCOVERY_TIMEOUT_MS = 5_000;

/**
 * How long, in milliseconds, after a server-side discovery request times out
 * that further requests for the same Repertoire URL fail at once with that
 * timeout instead of making a request of their own.
 */
export const DISCOVERY_FAIL_FAST_WINDOW_MS = 5_000;

// Module-level cache for cross-request caching (server-side)
// This persists across requests within the same Node.js process. The document
// is fresh for CACHE_TTL; after that it is kept as the last good document,
// which server-side answers a refresh that fails, until a refresh succeeds.
let cachedDiscovery: ServiceDiscovery | null = null;
let cacheTimestamp = 0;
let cachedUrl: string | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// The fail-fast window opened by the last server-side timeout, if any: until
// `until`, requests for `url` fail with `error` without a request.
let failFast: {
  url: string;
  until: number;
  error: QueryTimeoutError;
} | null = null;

/**
 * Clear the module-level cache, the last good document and the fail-fast
 * window. Primarily for testing.
 */
export function clearDiscoveryCache(): void {
  cachedDiscovery = null;
  cacheTimestamp = 0;
  cachedUrl = null;
  failFast = null;
}

export type FetchOptions = {
  requestId?: string;
  forceRefresh?: boolean;
  logger?: Logger;
  /**
   * Aborts the request, e.g. when a server-side query times out. An aborted
   * request rejects with the signal's reason and never writes the
   * cross-request cache, even if its response arrives anyway.
   */
  signal?: AbortSignal;
  /**
   * Server-side, how long the request may take, in milliseconds, before it is
   * aborted and rejects with a `QueryTimeoutError`. Defaults to
   * {@link DEFAULT_DISCOVERY_TIMEOUT_MS}. Ignored in the browser.
   */
  timeoutMs?: number;
  /**
   * Server-side, whether a failed refresh of an expired document returns the
   * last good document instead of rejecting. Defaults to true. Set it to false
   * to see every failure, as `discoveryQueryOptions` does so that its
   * `reportingQueryFn` can retry, log and report it before falling back.
   */
  staleFallback?: boolean;
};

/**
 * Fetch and validate the Repertoire service discovery document at
 * `${repertoireUrl}/discovery`.
 *
 * A document is cached in-process for 5 minutes and shared by every caller
 * (unless `forceRefresh` is set). Server-side, three more rules bound how long
 * a hung or failing Repertoire can hold up a page render:
 *
 * - **Timeout.** A request is aborted after {@link DEFAULT_DISCOVERY_TIMEOUT_MS}
 *   (or `timeoutMs`), and rejects with a `QueryTimeoutError`. The caller's
 *   `signal`, if any, aborts it too.
 * - **Last good document.** Once the cached document has expired, a refresh
 *   that fails for any reason (timeout, network error, HTTP error, invalid
 *   document) returns that document instead of rejecting, however old it is,
 *   and logs a warning. Not for `forceRefresh`, an aborted `signal`, or
 *   `staleFallback: false`.
 * - **Fail fast.** For {@link DISCOVERY_FAIL_FAST_WINDOW_MS} after a request
 *   times out (on its own timeout or because `signal` aborted with a
 *   `QueryTimeoutError`), further requests for the same URL make no request:
 *   they answer at once as if they had timed out too, with the last good
 *   document or else that timeout error. A fast failure, such as a connection
 *   reset, opens no window, so an immediate retry is a real request. A
 *   successful request closes the window; `forceRefresh` ignores it.
 *
 * In the browser none of these apply: TanStack Query is the cache there.
 */
export async function fetchServiceDiscovery(
  repertoireUrl: string,
  options?: FetchOptions
): Promise<ServiceDiscovery> {
  const {
    requestId,
    forceRefresh = false,
    logger: log = defaultLogger,
    signal,
    timeoutMs = DEFAULT_DISCOVERY_TIMEOUT_MS,
    staleFallback = true,
  } = options ?? {};

  const now = Date.now();

  // Check module-level cache (server-side cross-request caching)
  // Skip cache if forceRefresh is true (e.g., manual refetch from client)
  if (
    !forceRefresh &&
    cachedDiscovery &&
    cachedUrl === repertoireUrl &&
    now - cacheTimestamp < CACHE_TTL
  ) {
    const cacheAge = Math.round((now - cacheTimestamp) / 1000);
    log.debug({ requestId, cacheAge }, 'Using cached discovery');
    return cachedDiscovery;
  }

  const request = (requestSignal?: AbortSignal) =>
    requestDiscovery(repertoireUrl, { requestId, log, signal: requestSignal });

  if (!isServerRuntime()) {
    const parsed = await request(signal);
    storeDiscovery(repertoireUrl, parsed, now);
    return parsed;
  }

  // A caller that aborted has given up, so it gets the abort, not a document;
  // a forced refresh asks for a fresh document or none.
  const failed = (err: unknown) =>
    answerFailedRefresh(err, {
      repertoireUrl,
      useLastGood: staleFallback && !forceRefresh && !signal?.aborted,
      requestId,
      log,
    });

  // Right after a timeout, don't make each caller wait out a timeout of its
  // own: answer at once as if this request had timed out too.
  if (
    !forceRefresh &&
    failFast?.url === repertoireUrl &&
    now < failFast.until
  ) {
    log.debug(
      { requestId, repertoireUrl },
      'Skipping discovery request after a recent timeout'
    );
    return failed(failFast.error);
  }

  try {
    const parsed = await withTimeout(request, timeoutMs, signal);
    storeDiscovery(repertoireUrl, parsed, now);
    if (failFast?.url === repertoireUrl) {
      failFast = null;
    }
    return parsed;
  } catch (err) {
    // Whichever timeout ran out, this one or the caller's (reportingQueryFn
    // aborts its signal with a QueryTimeoutError), Repertoire looks hung.
    if (err instanceof QueryTimeoutError) {
      failFast = {
        url: repertoireUrl,
        until: Date.now() + DISCOVERY_FAIL_FAST_WINDOW_MS,
        error: err,
      };
    }
    return failed(err);
  }
}

/**
 * Answer a failed server-side refresh: with the last good document when
 * `useLastGood` is set and there is one (logging a warning), or else by
 * rethrowing the failure.
 */
function answerFailedRefresh(
  err: unknown,
  options: {
    repertoireUrl: string;
    useLastGood: boolean;
    requestId?: string;
    log: Logger;
  }
): ServiceDiscovery {
  const { repertoireUrl, useLastGood, requestId, log } = options;
  const lastGood = useLastGood ? getLastGoodDiscovery(repertoireUrl) : null;
  if (!lastGood) {
    throw err;
  }
  log.warn(
    {
      requestId,
      err,
      repertoireUrl,
      documentAge: Math.round((Date.now() - cacheTimestamp) / 1000),
    },
    'Service discovery refresh failed; using the last document received'
  );
  return lastGood;
}

/** Write the module-level cache. */
function storeDiscovery(
  repertoireUrl: string,
  discovery: ServiceDiscovery,
  fetchedAt: number
): void {
  cachedDiscovery = discovery;
  cachedUrl = repertoireUrl;
  cacheTimestamp = fetchedAt;
}

/**
 * Server-side, the last document successfully fetched from `repertoireUrl`,
 * however old. Null when there is none, and always in the browser, where there
 * is no stale fallback.
 */
export function getLastGoodDiscovery(
  repertoireUrl: string
): ServiceDiscovery | null {
  return isServerRuntime() && cachedUrl === repertoireUrl
    ? cachedDiscovery
    : null;
}

/**
 * Request and validate the discovery document, without the cache.
 *
 * Rejects with the signal's reason if `signal` is aborted before the document
 * is returned, even when the response arrives anyway: the caller has given up,
 * so its answer must not be cached for later requests.
 */
async function requestDiscovery(
  repertoireUrl: string,
  options: { requestId?: string; log: Logger; signal?: AbortSignal }
): Promise<ServiceDiscovery> {
  const { requestId, log, signal } = options;

  // Remove trailing slashes if present, then append /discovery
  let baseUrl = repertoireUrl;
  while (baseUrl.endsWith('/')) {
    baseUrl = baseUrl.slice(0, -1);
  }
  const discoveryUrl = `${baseUrl}/discovery`;

  const startTime = Date.now();
  log.debug({ requestId, discoveryUrl }, 'Starting network fetch');

  const response = await fetch(discoveryUrl, { cache: 'no-store', signal });

  const fetchDuration = Date.now() - startTime;
  log.debug(
    { requestId, fetchDuration, status: response.status },
    'Network fetch completed'
  );

  if (!response.ok) {
    throw new RepertoireError(
      `Repertoire API error: ${response.status} ${response.statusText}`,
      response.status
    );
  }

  const data = await response.json();
  log.debug({ requestId, rawResponse: data }, 'Raw response received');

  const parsed = DiscoverySchema.parse(data);
  log.debug(
    {
      requestId,
      applications: parsed.applications,
      uiServices: Object.keys(parsed.services.ui),
      internalServices: Object.keys(parsed.services.internal),
    },
    'Parsed discovery'
  );

  signal?.throwIfAborted();
  return parsed;
}

/**
 * Run `request` with a timeout, combined with the caller's `signal`.
 *
 * The request gets its own `AbortSignal`. When the timeout runs out (or the
 * caller's signal aborts first), that signal is aborted with a
 * `QueryTimeoutError` (or the caller's reason) and the returned promise
 * rejects with it straight away, so a request that ignores its signal still
 * cannot hold up the caller. The timer and the listener on the caller's signal
 * are removed as soon as the request settles.
 */
async function withTimeout<T>(
  request: (signal: AbortSignal) => Promise<T>,
  timeoutMs: number,
  callerSignal?: AbortSignal
): Promise<T> {
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  let onCallerAbort: (() => void) | undefined;
  const stopped = new Promise<never>((_resolve, reject) => {
    const stop = (reason: unknown) => {
      // Reject first, so the request fails with this reason even when it
      // reacts to the abort by rejecting with an error of its own.
      reject(reason);
      controller.abort(reason);
    };
    timer = setTimeout(() => stop(new QueryTimeoutError(timeoutMs)), timeoutMs);
    if (callerSignal?.aborted) {
      stop(callerSignal.reason);
    } else if (callerSignal) {
      onCallerAbort = () => stop(callerSignal.reason);
      callerSignal.addEventListener('abort', onCallerAbort, { once: true });
    }
  });

  try {
    return await Promise.race([request(controller.signal), stopped]);
  } finally {
    clearTimeout(timer);
    if (onCallerAbort) {
      callerSignal?.removeEventListener('abort', onCallerAbort);
    }
  }
}

/** Whether this is a server (Node) runtime: there is no `window` global. */
function isServerRuntime(): boolean {
  return typeof window === 'undefined';
}

export function getEmptyDiscovery(): ServiceDiscovery {
  return {
    applications: [],
    datasets: {},
    influxdb_databases: {},
    services: { internal: {}, ui: {} },
  };
}
