/**
 * Framework-agnostic Server-Sent Events (SSE) subscription built on
 * `eventsource-client`.
 *
 * This layer is a raw transport: it delivers SSE messages as strings and
 * deliberately performs no payload parsing or validation — consumers own
 * their schemas.
 */
import {
  createEventSource,
  type EventSourceMessage,
  type FetchLike,
} from 'eventsource-client';

/**
 * Options for `subscribeToEventSource`.
 */
export type SubscribeToEventSourceOptions = {
  /** Called for each SSE message received (raw data string, event name, id). */
  onMessage: (message: EventSourceMessage) => void;
  /**
   * Called each time the connection is established (including after
   * reconnects).
   */
  onConnect?: () => void;
  /**
   * Called each time the connection is broken. The client will attempt to
   * reconnect automatically unless the subscription has been cleaned up.
   */
  onDisconnect?: () => void;
  /**
   * Called each time a reconnect attempt is scheduled, with the delay in
   * milliseconds before the attempt.
   */
  onScheduleReconnect?: (info: { delay: number }) => void;
  /**
   * External signal for aborting the subscription. When the signal aborts,
   * the connection is closed and automatic reconnection stops. If the
   * signal is already aborted, no connection is opened.
   */
  signal?: AbortSignal;
  /** Additional request headers (e.g. authorization). */
  headers?: Record<string, string>;
  /**
   * Credentials mode for the request. Defaults to `'include'` so
   * same-origin auth cookies (e.g. Gafaelfawr) are sent.
   */
  credentials?: 'include' | 'omit' | 'same-origin';
  /** Fetch implementation override. Defaults to `globalThis.fetch`. */
  fetch?: FetchLike;
};

/**
 * Subscribe to a Server-Sent Events endpoint.
 *
 * @param url - The SSE endpoint URL.
 * @param options - Callbacks and connection options.
 * @returns A cleanup function that closes the connection and prevents
 *   automatic reconnection.
 */
export function subscribeToEventSource(
  url: string | URL,
  options: SubscribeToEventSourceOptions
): () => void {
  const {
    onMessage,
    onConnect,
    onDisconnect,
    onScheduleReconnect,
    signal,
    headers,
    credentials = 'include',
    fetch,
  } = options;

  if (signal?.aborted) {
    return () => {};
  }

  const client = createEventSource({
    url,
    onMessage,
    onConnect,
    onDisconnect,
    onScheduleReconnect,
    headers,
    credentials,
    fetch,
  });

  const handleAbort = () => {
    client.close();
  };
  signal?.addEventListener('abort', handleAbort);

  return () => {
    signal?.removeEventListener('abort', handleAbort);
    client.close();
  };
}
