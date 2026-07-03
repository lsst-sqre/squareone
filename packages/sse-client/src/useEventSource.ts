/**
 * React hook wrapping `subscribeToEventSource` with effect lifecycle
 * management.
 */
import { useEffect, useRef } from 'react';

import {
  type SubscribeToEventSourceOptions,
  subscribeToEventSource,
} from './subscribeToEventSource';

/**
 * Options for `useEventSource`. Identical to
 * `SubscribeToEventSourceOptions`; the hook reads the latest options
 * through a ref, so changing them does not re-establish the connection.
 */
export type UseEventSourceOptions = SubscribeToEventSourceOptions;

/**
 * Subscribe to a Server-Sent Events endpoint for the lifetime of the
 * component.
 *
 * The connection is opened on mount and closed on unmount. Changing `url`
 * closes the current connection and opens a new one. Pass `null` or
 * `undefined` as the URL to disable the subscription. Option changes
 * (including callback identity) do not reconnect — callbacks are read
 * through a ref, so the latest ones are always invoked.
 *
 * @param url - The SSE endpoint URL, or `null`/`undefined` to disable.
 * @param options - Callbacks and connection options.
 *
 * @example
 * ```tsx
 * useEventSource(notificationsUrl, {
 *   onMessage: (message) => handleRawMessage(message.data),
 * });
 * ```
 */
export function useEventSource(
  url: string | null | undefined,
  options: UseEventSourceOptions
): void {
  const optionsRef = useRef(options);

  // Keep the latest options available to the subscription without
  // re-triggering the effect. This effect must be declared before the
  // subscription effect so it runs first on each commit.
  useEffect(() => {
    optionsRef.current = options;
  });

  useEffect(() => {
    if (url == null) {
      return undefined;
    }

    return subscribeToEventSource(url, {
      onMessage: (message) => optionsRef.current.onMessage(message),
      onConnect: () => optionsRef.current.onConnect?.(),
      onDisconnect: () => optionsRef.current.onDisconnect?.(),
      onScheduleReconnect: (info) =>
        optionsRef.current.onScheduleReconnect?.(info),
      signal: optionsRef.current.signal,
      headers: optionsRef.current.headers,
      credentials: optionsRef.current.credentials,
      fetch: optionsRef.current.fetch,
    });
  }, [url]);
}
