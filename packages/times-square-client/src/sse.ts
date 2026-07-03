/**
 * Server-Sent Events (SSE) handler for Times Square HTML events.
 *
 * Built on the shared @lsst-sqre/sse-client transport, which provides
 * automatic reconnection with backoff (honoring server `retry:` fields)
 * and proper abort handling. This layer owns Times Square semantics:
 * Zod validation of HTML events and auto-abort on execution completion.
 */
import { subscribeToEventSource } from '@lsst-sqre/sse-client';

import { buildUrlWithParams } from './client';
import type { Logger } from './query-options';
import { type HtmlEvent, HtmlEventSchema } from './schemas';

/**
 * Callback invoked when an HTML event is received.
 */
export type HtmlEventCallback = (event: HtmlEvent) => void;

/**
 * Callback invoked when an error occurs.
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
  /** Called when execution completes (optional) */
  onComplete?: () => void;
  /** AbortSignal for external cancellation (optional) */
  signal?: AbortSignal;
  /** Whether to auto-abort when execution completes (default: true) */
  autoAbortOnComplete?: boolean;
  /** Optional structured logger */
  logger?: Logger;
};

/**
 * Subscribe to HTML events for a notebook execution.
 *
 * Opens an SSE connection to the Times Square API and invokes callbacks
 * as events are received. The connection is automatically closed when
 * the execution completes (status === 'complete' and html_hash is present).
 * If the connection drops before completion, the transport reconnects
 * automatically with backoff.
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
    logger: log,
  } = options ?? { onEvent: () => {} };

  const abortController = new AbortController();
  const fullUrl = buildUrlWithParams(eventsUrl, params);

  // Link external signal to internal abort controller
  if (signal) {
    if (signal.aborted) {
      abortController.abort();
    } else {
      signal.addEventListener('abort', () => abortController.abort(), {
        once: true,
      });
    }
  }

  subscribeToEventSource(fullUrl, {
    signal: abortController.signal,
    onMessage(message) {
      // Parse and validate the event data
      let parsedData: unknown;
      try {
        parsedData = JSON.parse(message.data);
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
        return;
      }

      const htmlEvent = result.data;
      onEvent(htmlEvent);

      // Auto-abort when execution completes
      if (
        autoAbortOnComplete &&
        htmlEvent.execution_status === 'complete' &&
        htmlEvent.html_hash
      ) {
        onComplete?.();
        abortController.abort();
      }
    },

    onDisconnect() {
      // The transport reconnects automatically; report the interruption
      // unless the subscription was deliberately aborted.
      if (!abortController.signal.aborted) {
        onError?.(new Error('SSE connection lost'));
      }
    },

    onScheduleReconnect({ delay }) {
      log?.debug({ delay }, 'SSE reconnect scheduled');
    },
  });

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
