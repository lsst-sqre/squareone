import type { FetchLikeResponse } from 'eventsource-client';
import { describe, expect, it, vi } from 'vitest';

import { subscribeToEventSource } from './subscribeToEventSource';

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
  /** Close the response stream (simulates a server disconnect). */
  end: () => void;
};

/**
 * Create a mocked `fetch` that returns a `ReadableStream` SSE body. The
 * stream honors the request's `AbortSignal` by erroring with an
 * `AbortError`, matching real fetch behavior when a request is aborted.
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
        end: () => controller.close(),
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

describe('subscribeToEventSource', () => {
  it('delivers messages to onMessage', async () => {
    const { fetchMock, connections } = createMockSseFetch();
    const onMessage = vi.fn();

    const cleanup = subscribeToEventSource('https://example.com/events', {
      onMessage,
      fetch: fetchMock,
    });

    await vi.waitFor(() => expect(connections).toHaveLength(1));
    connections[0].push('event: status\nid: 1\ndata: hello\n\n');

    await vi.waitFor(() => expect(onMessage).toHaveBeenCalledTimes(1));
    expect(onMessage).toHaveBeenCalledWith(
      expect.objectContaining({ data: 'hello', event: 'status', id: '1' })
    );

    cleanup();
  });

  it('calls onConnect when the connection is established', async () => {
    const { fetchMock, connections } = createMockSseFetch();
    const onConnect = vi.fn();

    const cleanup = subscribeToEventSource('https://example.com/events', {
      onMessage: vi.fn(),
      onConnect,
      fetch: fetchMock,
    });

    await vi.waitFor(() => expect(onConnect).toHaveBeenCalledTimes(1));
    expect(connections).toHaveLength(1);

    cleanup();
  });

  it('calls onDisconnect and onScheduleReconnect when the server disconnects', async () => {
    const { fetchMock, connections } = createMockSseFetch();
    const onDisconnect = vi.fn();
    const onScheduleReconnect = vi.fn();

    const cleanup = subscribeToEventSource('https://example.com/events', {
      onMessage: vi.fn(),
      onDisconnect,
      onScheduleReconnect,
      fetch: fetchMock,
    });

    await vi.waitFor(() => expect(connections).toHaveLength(1));
    connections[0].end();

    await vi.waitFor(() => expect(onDisconnect).toHaveBeenCalledTimes(1));
    expect(onScheduleReconnect).toHaveBeenCalledWith(
      expect.objectContaining({ delay: expect.any(Number) })
    );

    cleanup();
  });

  it('closes the stream and stops reconnecting when cleaned up', async () => {
    const { fetchMock, connections } = createMockSseFetch();
    const onMessage = vi.fn();

    const cleanup = subscribeToEventSource('https://example.com/events', {
      onMessage,
      fetch: fetchMock,
    });

    await vi.waitFor(() => expect(connections).toHaveLength(1));
    expect(connections[0].init.signal?.aborted).toBe(false);

    cleanup();

    // The request's abort signal fires, which closes the response stream.
    expect(connections[0].init.signal?.aborted).toBe(true);

    // No reconnection is attempted after cleanup.
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(onMessage).not.toHaveBeenCalled();
  });

  it('aborts the connection when the external signal aborts', async () => {
    const { fetchMock, connections } = createMockSseFetch();
    const abortController = new AbortController();

    subscribeToEventSource('https://example.com/events', {
      onMessage: vi.fn(),
      signal: abortController.signal,
      fetch: fetchMock,
    });

    await vi.waitFor(() => expect(connections).toHaveLength(1));
    expect(connections[0].init.signal?.aborted).toBe(false);

    abortController.abort();

    expect(connections[0].init.signal?.aborted).toBe(true);

    // No reconnection is attempted after an external abort.
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('does not connect when the external signal is already aborted', async () => {
    const { fetchMock } = createMockSseFetch();
    const abortController = new AbortController();
    abortController.abort();

    const cleanup = subscribeToEventSource('https://example.com/events', {
      onMessage: vi.fn(),
      signal: abortController.signal,
      fetch: fetchMock,
    });

    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(fetchMock).not.toHaveBeenCalled();

    // Cleanup is still safe to call.
    cleanup();
  });

  it("sends credentials 'include' by default", async () => {
    const { fetchMock, connections } = createMockSseFetch();

    const cleanup = subscribeToEventSource('https://example.com/events', {
      onMessage: vi.fn(),
      fetch: fetchMock,
    });

    await vi.waitFor(() => expect(connections).toHaveLength(1));
    expect(connections[0].init.credentials).toBe('include');

    cleanup();
  });

  it('honors a credentials override', async () => {
    const { fetchMock, connections } = createMockSseFetch();

    const cleanup = subscribeToEventSource('https://example.com/events', {
      onMessage: vi.fn(),
      credentials: 'omit',
      fetch: fetchMock,
    });

    await vi.waitFor(() => expect(connections).toHaveLength(1));
    expect(connections[0].init.credentials).toBe('omit');

    cleanup();
  });

  it('passes custom headers with the request', async () => {
    const { fetchMock, connections } = createMockSseFetch();

    const cleanup = subscribeToEventSource('https://example.com/events', {
      onMessage: vi.fn(),
      headers: { 'X-Custom-Header': 'value' },
      fetch: fetchMock,
    });

    await vi.waitFor(() => expect(connections).toHaveLength(1));
    expect(connections[0].init.headers).toEqual(
      expect.objectContaining({ 'X-Custom-Header': 'value' })
    );

    cleanup();
  });
});
