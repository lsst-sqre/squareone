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
    signal.addEventListener('abort', () => abortController.abort());
  }

  // Start the SSE connection
  fetchEventSource(fullUrl, {
    method: 'GET',
    signal: abortController.signal,
    credentials: 'include',

    async onopen(response) {
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

    onclose() {
      // Connection closed normally
    },

    onerror(error) {
      // Only report errors if we haven't aborted
      if (!abortController.signal.aborted) {
        const sseError =
          error instanceof Error
            ? error
            : new Error(`SSE error: ${String(error)}`);
        onError?.(sseError);
      }
    },
  }).catch((error) => {
    // Catch any unhandled errors from fetchEventSource
    // AbortError is expected when we clean up
    if (error instanceof Error && error.name === 'AbortError') {
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
