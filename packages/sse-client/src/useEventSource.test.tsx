import { renderHook } from '@testing-library/react';
import type { FetchLikeResponse } from 'eventsource-client';
import { describe, expect, it, vi } from 'vitest';

import { useEventSource } from './useEventSource';

/**
 * A single mocked SSE connection produced by `createMockSseFetch`.
 */
type MockSseConnection = {
  /** The URL the connection was opened against. */
  url: string;
  /** The request init the client passed to fetch. */
  init: {
    signal?: AbortSignal;
    headers?: Record<string, string>;
    credentials?: 'include' | 'omit' | 'same-origin';
  };
  /** Enqueue raw SSE text onto the response stream. */
  push: (text: string) => void;
};

/**
 * Create a mocked `fetch` that returns a `ReadableStream` SSE body.
 */
function createMockSseFetch() {
  const connections: MockSseConnection[] = [];
  const encoder = new TextEncoder();

  const fetchMock = vi.fn(
    async (
      url: string | URL,
      init?: MockSseConnection['init']
    ): Promise<FetchLikeResponse> => {
      let controller!: ReadableStreamDefaultController<Uint8Array<ArrayBuffer>>;
      const stream = new ReadableStream<Uint8Array<ArrayBuffer>>({
        start(c) {
          controller = c;
        },
      });

      init?.signal?.addEventListener('abort', () => {
        try {
          controller.error(
            new DOMException('The operation was aborted.', 'AbortError')
          );
        } catch {
          // Stream already closed or errored.
        }
      });

      connections.push({
        url: String(url),
        init: init ?? {},
        push: (text: string) => controller.enqueue(encoder.encode(text)),
      });

      return {
        body: stream,
        url: String(url),
        status: 200,
        redirected: false,
      };
    }
  );

  return { fetchMock, connections };
}

describe('useEventSource', () => {
  it('subscribes on mount and delivers messages', async () => {
    const { fetchMock, connections } = createMockSseFetch();
    const onMessage = vi.fn();

    const { unmount } = renderHook(() =>
      useEventSource('https://example.com/events', {
        onMessage,
        fetch: fetchMock,
      })
    );

    await vi.waitFor(() => expect(connections).toHaveLength(1));
    expect(connections[0].url).toBe('https://example.com/events');

    connections[0].push('data: hello\n\n');
    await vi.waitFor(() => expect(onMessage).toHaveBeenCalledTimes(1));
    expect(onMessage).toHaveBeenCalledWith(
      expect.objectContaining({ data: 'hello' })
    );

    unmount();
  });

  it('closes the connection on unmount', async () => {
    const { fetchMock, connections } = createMockSseFetch();

    const { unmount } = renderHook(() =>
      useEventSource('https://example.com/events', {
        onMessage: vi.fn(),
        fetch: fetchMock,
      })
    );

    await vi.waitFor(() => expect(connections).toHaveLength(1));
    expect(connections[0].init.signal?.aborted).toBe(false);

    unmount();

    expect(connections[0].init.signal?.aborted).toBe(true);
  });

  it('reconnects when the URL changes', async () => {
    const { fetchMock, connections } = createMockSseFetch();

    const { rerender, unmount } = renderHook(
      ({ url }: { url: string }) =>
        useEventSource(url, { onMessage: vi.fn(), fetch: fetchMock }),
      { initialProps: { url: 'https://example.com/a' } }
    );

    await vi.waitFor(() => expect(connections).toHaveLength(1));

    rerender({ url: 'https://example.com/b' });

    await vi.waitFor(() => expect(connections).toHaveLength(2));
    expect(connections[0].init.signal?.aborted).toBe(true);
    expect(connections[1].url).toBe('https://example.com/b');
    expect(connections[1].init.signal?.aborted).toBe(false);

    unmount();
  });

  it('does not subscribe when the URL is null', async () => {
    const { fetchMock } = createMockSseFetch();

    const { unmount } = renderHook(() =>
      useEventSource(null, { onMessage: vi.fn(), fetch: fetchMock })
    );

    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(fetchMock).not.toHaveBeenCalled();

    unmount();
  });

  it('invokes the latest onMessage callback without reconnecting', async () => {
    const { fetchMock, connections } = createMockSseFetch();
    const firstOnMessage = vi.fn();
    const secondOnMessage = vi.fn();

    const { rerender, unmount } = renderHook(
      ({ onMessage }: { onMessage: (message: unknown) => void }) =>
        useEventSource('https://example.com/events', {
          onMessage,
          fetch: fetchMock,
        }),
      { initialProps: { onMessage: firstOnMessage } }
    );

    await vi.waitFor(() => expect(connections).toHaveLength(1));

    rerender({ onMessage: secondOnMessage });

    connections[0].push('data: hello\n\n');
    await vi.waitFor(() => expect(secondOnMessage).toHaveBeenCalledTimes(1));
    expect(firstOnMessage).not.toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledTimes(1);

    unmount();
  });
});
