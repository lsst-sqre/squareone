/**
 * Server-Sent Events (SSE) handler for Times Square HTML events.
 *
 * Uses @microsoft/fetch-event-source for SSE support with features like
 * automatic reconnection and proper abort handling.
 */
import { fetchEventSource } from '@microsoft/fetch-event-source';

import { buildUrlWithParams } from './client';
import type { Logger } from './query-options';
import { type HtmlEvent, HtmlEventSchema } from './schemas';

/**
 * Upper bound on the multiplier applied to `reconnectBackoffMs`.
 *
 * The backoff grows linearly with the number of consecutive failures, but that
 * count is only bounded when `maxReconnectAttempts` is also set. A consumer
 * that sets `reconnectBackoffMs` alone would otherwise see the delay climb
 * without limit through a long outage — minutes between attempts, and growing —
 * so a reconnect could be pending long after the service came back. Capping the
 * multiplier keeps the worst-case wait at a predictable
 * `MAX_RECONNECT_BACKOFF_MULTIPLIER * reconnectBackoffMs`, which still backs off
 * enough to spare a struggling server while staying responsive to recovery.
 */
const MAX_RECONNECT_BACKOFF_MULTIPLIER = 10;

/**
 * Callback invoked when an HTML event is received.
 */
export type HtmlEventCallback = (event: HtmlEvent) => void;

/**
 * Error raised for a single SSE event whose JSON fails schema validation.
 *
 * Distinct from connection-level errors (which arrive as plain `Error`s from
 * `onopen`/`onerror`) so a consumer can tell an event-level contract-drift
 * problem apart from a transport failure. Crucially, an `SseInvalidEventError`
 * is **non-fatal**: the SSE stream stays open, and a server emitting a run of
 * drifted events will trigger `onError` once per invalid event. Consumers must
 * therefore treat this subtype as non-terminal — do not tear down or reconnect
 * the subscription on it — and are responsible for throttling any downstream
 * side effect (e.g. Sentry capture) so a noisy stream cannot flood. The
 * originating `ZodError` is attached as `cause`.
 */
export class SseInvalidEventError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = 'SseInvalidEventError';
  }
}

/**
 * Error raised when a subscription gives up reconnecting and terminates.
 *
 * Only ever raised when {@link SubscribeOptions.maxReconnectAttempts} is set:
 * once that many consecutive connection failures have occurred the stream is
 * aborted and this error is reported through `onError` as the subscription's
 * final signal. Unlike the plain connection `Error`s that precede it (one per
 * failed attempt) and unlike {@link SseInvalidEventError}, this error is
 * **terminal** — no further events, errors, or reconnects follow it, so a
 * consumer can use it to drive a `connectionFailed` UI state and a once-only
 * error capture. The last underlying connection error is attached as `cause`.
 */
export class SseConnectionFailedError extends Error {
  /** Number of consecutive failed connection attempts before giving up. */
  readonly attempts: number;

  constructor(message: string, options: { cause?: unknown; attempts: number }) {
    super(message, { cause: options.cause });
    this.name = 'SseConnectionFailedError';
    this.attempts = options.attempts;
  }
}

/**
 * Callback invoked when an error occurs.
 *
 * May fire more than once over a subscription's lifetime. Connection-level
 * failures arrive as plain `Error`s; per-event schema-validation failures
 * arrive as {@link SseInvalidEventError} (non-fatal — see its docs); and a
 * bounded-reconnect subscription that has given up reports a final
 * {@link SseConnectionFailedError} (terminal — see its docs). Consumers that
 * treat `onError` as a fatal/connection signal should check the error subtype
 * before acting.
 */
export type SseErrorCallback = (error: Error) => void;

/**
 * Options for subscribeToHtmlEvents.
 */
export type SubscribeOptions = {
  /** Called when a valid HTML event is received */
  onEvent: HtmlEventCallback;
  /** Called when an error occurs (optional) */
  onError?: SseErrorCallback;
  /**
   * Called when execution reaches a terminal state (optional).
   *
   * Fires for both outcomes: a successful render and a terminal
   * `execution_error`. The terminal event itself is always delivered to
   * `onEvent` first, so a consumer can read the failure off that event.
   */
  onComplete?: () => void;
  /** AbortSignal for external cancellation (optional) */
  signal?: AbortSignal;
  /**
   * Whether to auto-abort when execution reaches a terminal state
   * (default: true).
   *
   * Setting this to `false` disables the teardown for *both* terminal
   * outcomes — success and `execution_error` alike — leaving the stream open
   * for the caller to close.
   */
  autoAbortOnComplete?: boolean;
  /**
   * Maximum number of consecutive connection failures before the subscription
   * gives up (optional).
   *
   * When set, reaching this many consecutive failures aborts the stream and
   * reports a terminal {@link SseConnectionFailedError} through `onError`. The
   * counter resets whenever a connection opens successfully. When omitted (the
   * default), the underlying transport reconnects indefinitely.
   */
  maxReconnectAttempts?: number;
  /**
   * Base delay in milliseconds between reconnect attempts (optional).
   *
   * The delay scales linearly with the number of consecutive failures, so a
   * value of 1000 waits 1 s, then 2 s, then 3 s. The growth is capped at
   * {@link MAX_RECONNECT_BACKOFF_MULTIPLIER} (10) times the base delay, so that
   * same value plateaus at 10 s no matter how long an outage runs — without the
   * cap, a subscription with no `maxReconnectAttempts` would back off
   * indefinitely. When omitted (the default), the underlying transport's own
   * retry interval is used.
   */
  reconnectBackoffMs?: number;
  /** Optional structured logger */
  logger?: Logger;
};

/**
 * Subscribe to HTML events for a notebook execution.
 *
 * Opens an SSE connection to the Times Square API and invokes callbacks
 * as events are received. The connection is automatically closed once the
 * execution reaches a terminal state — either success (status === 'complete'
 * with an html_hash) or a terminal failure (a non-null execution_error). The
 * terminal event is delivered to `onEvent` before `onComplete` fires and the
 * stream is aborted. Pass `autoAbortOnComplete: false` to disable both.
 *
 * @param eventsUrl - The full URL to the html/events endpoint
 * @param params - Optional parameters to append to the URL
 * @param options - Callback options
 * @returns Cleanup function to abort the connection
 *
 * @example
 * ```tsx
 * useEffect(() => {
 *   const cleanup = subscribeToHtmlEvents(
 *     page.html_events_url,
 *     { ts_hide_code: '0' },
 *     {
 *       onEvent: (event) => setHtmlEvent(event),
 *       onError: (error) => console.error(error),
 *       onComplete: () => console.log('Execution complete'),
 *     }
 *   );
 *
 *   return cleanup;
 * }, [page.html_events_url]);
 * ```
 */
export function subscribeToHtmlEvents(
  eventsUrl: string,
  params?: Record<string, string>,
  options?: SubscribeOptions
): () => void {
  const {
    onEvent,
    onError,
    onComplete,
    signal,
    autoAbortOnComplete = true,
    maxReconnectAttempts,
    reconnectBackoffMs,
    logger: log,
  } = options ?? { onEvent: () => {} };

  const abortController = new AbortController();
  // Consecutive connection failures since the last successful open. Bounds the
  // otherwise-infinite reconnect loop when `maxReconnectAttempts` is set, and
  // scales the backoff delay when `reconnectBackoffMs` is set.
  let consecutiveFailures = 0;
  // Set once the subscription has terminally given up, so the promise rejection
  // that follows isn't reported a second time.
  let connectionFailed = false;
  const fullUrl = buildUrlWithParams(eventsUrl, params);

  // Link external signal to internal abort controller
  if (signal) {
    signal.addEventListener('abort', () => abortController.abort());
  }

  // Start the SSE connection
  fetchEventSource(fullUrl, {
    method: 'GET',
    signal: abortController.signal,
    credentials: 'include',

    async onopen(response) {
      if (response.ok) {
        // A successful open ends any run of failures, so `maxReconnectAttempts`
        // bounds *consecutive* failures rather than the subscription's lifetime.
        consecutiveFailures = 0;
        return;
      }
      if (
        response.status >= 400 &&
        response.status < 500 &&
        response.status !== 429
      ) {
        const error = new Error(
          `SSE connection failed: ${response.status} ${response.statusText}`
        );
        onError?.(error);
      }
    },

    onmessage(event) {
      // Parse and validate the event data
      let parsedData: unknown;
      try {
        parsedData = JSON.parse(event.data);
      } catch {
        // Ignore non-JSON events (e.g., heartbeats)
        return;
      }

      // Validate with Zod schema
      const result = HtmlEventSchema.safeParse(parsedData);
      if (!result.success) {
        if (log) {
          log.warn({ zodError: result.error }, 'Invalid SSE event data');
        } else {
          console.warn('[TimesSquare SSE] Invalid event data:', result.error);
        }
        // A JSON event that fails schema validation is API contract drift, not
        // a benign heartbeat. Surface it through onError (rather than silently
        // dropping it) so the app can route it to Sentry via a report hook. It
        // is emitted as a named `SseInvalidEventError` subtype so consumers can
        // distinguish it from connection-level errors and treat it as non-fatal
        // (the stream stays open); note this may fire once per invalid event on
        // a drifted stream, so consumers should throttle any downstream capture.
        // The ZodError is attached as `cause` so the reporter's error classifier
        // can still see it while onError keeps its `Error` contract.
        onError?.(
          new SseInvalidEventError(
            'Invalid SSE event data: schema validation failed',
            { cause: result.error }
          )
        );
        return;
      }

      const htmlEvent = result.data;
      onEvent(htmlEvent);

      // Auto-abort once execution reaches a terminal state. That is either a
      // successful render (`complete` with an html_hash) or a terminal
      // execution_error (DM-55470) — a failed run reports `complete` with no
      // html_hash, so the success condition alone would leave the stream open
      // forever. Either way the event above has already been delivered, so the
      // consumer sees the terminal event before the subscription tears down.
      const succeeded =
        htmlEvent.execution_status === 'complete' && htmlEvent.html_hash;
      const failed = htmlEvent.execution_error !== null;
      if (autoAbortOnComplete && (succeeded || failed)) {
        onComplete?.();
        abortController.abort();
      }
    },

    onclose() {
      // Connection closed normally
    },

    onerror(error) {
      // Only report errors if we haven't aborted
      if (abortController.signal.aborted) {
        return undefined;
      }

      const sseError =
        error instanceof Error
          ? error
          : new Error(`SSE error: ${String(error)}`);
      onError?.(sseError);

      consecutiveFailures += 1;

      if (
        maxReconnectAttempts !== undefined &&
        consecutiveFailures >= maxReconnectAttempts
      ) {
        connectionFailed = true;
        onError?.(
          new SseConnectionFailedError(
            `SSE connection failed after ${consecutiveFailures} consecutive attempts`,
            { cause: sseError, attempts: consecutiveFailures }
          )
        );
        abortController.abort();
        // Throwing from onerror is fetch-event-source's signal to stop
        // reconnecting; returning (even after aborting) would schedule another
        // attempt. The resulting promise rejection is swallowed below.
        throw sseError;
      }

      // Returning a number delays the next attempt by that many milliseconds;
      // returning undefined leaves the transport's own retry interval in place.
      // The multiplier is capped so the delay plateaus instead of growing
      // without bound when `maxReconnectAttempts` is unset.
      return reconnectBackoffMs === undefined
        ? undefined
        : reconnectBackoffMs *
            Math.min(consecutiveFailures, MAX_RECONNECT_BACKOFF_MULTIPLIER);
    },
  }).catch((error) => {
    // Catch any unhandled errors from fetchEventSource
    // AbortError is expected when we clean up
    if (error instanceof Error && error.name === 'AbortError') {
      return;
    }
    // The bounded-reconnect terminal path throws from onerror to stop
    // reconnecting, which rejects this promise. That outcome is expected and
    // already surfaced via SseConnectionFailedError, so don't report it twice.
    if (connectionFailed) {
      return;
    }
    onError?.(error instanceof Error ? error : new Error(String(error)));
  });

  // Return cleanup function
  return () => {
    abortController.abort();
  };
}

/**
 * Create an HTML events URL with parameters.
 *
 * @param baseEventsUrl - The base events URL from page metadata
 * @param params - Parameters to append
 * @returns Full URL with query string
 */
export function createHtmlEventsUrl(
  baseEventsUrl: string,
  params?: Record<string, string>
): string {
  return buildUrlWithParams(baseEventsUrl, params);
}
