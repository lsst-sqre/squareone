import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Capture the options passed to fetchEventSource so tests can drive its
// handlers (onmessage/onopen/onerror) directly without a real network call.
const fetchEventSourceMock = vi.hoisted(() => vi.fn());

vi.mock('@microsoft/fetch-event-source', () => ({
  fetchEventSource: fetchEventSourceMock,
}));

import {
  SseConnectionFailedError,
  SseInvalidEventError,
  subscribeToHtmlEvents,
} from './sse';

/** The options object handed to the most recent fetchEventSource call. */
function lastFetchEventSourceOptions() {
  const calls = fetchEventSourceMock.mock.calls;
  return calls[calls.length - 1][1] as {
    onmessage: (event: { data: string }) => void;
    onopen: (response: Response) => Promise<void>;
    onerror: (error: unknown) => number | undefined;
    signal: AbortSignal;
  };
}

/** A minimal successful SSE response for driving `onopen`. */
function okResponse(): Response {
  return { ok: true, status: 200, statusText: 'OK' } as Response;
}

// A valid HtmlEvent payload (matches HtmlEventSchema).
const validHtmlEvent = {
  date_submitted: '2025-01-01T00:00:00Z',
  date_started: '2025-01-01T00:00:01Z',
  date_finished: null,
  execution_status: 'in_progress',
  execution_duration: null,
  html_hash: null,
  html_url: 'https://example.com/html',
};

// A terminal successful event: execution completed and HTML is available.
const completeHtmlEvent = {
  ...validHtmlEvent,
  date_finished: '2025-01-01T00:00:09Z',
  execution_status: 'complete',
  execution_duration: 8.5,
  html_hash: 'abc123def456789012345678901234567890abcd',
};

// A terminal failed event: execution finished with an error and no HTML.
const failedHtmlEvent = {
  ...validHtmlEvent,
  date_finished: '2025-01-01T00:00:09Z',
  execution_status: 'complete',
  execution_duration: 8.5,
  html_hash: null,
  execution_error: {
    code: 'timeout',
    title: 'Notebook execution timed out',
    message: 'The notebook did not finish executing within the allowed time.',
  },
};

beforeEach(() => {
  fetchEventSourceMock.mockReset();
  // fetchEventSource returns a promise that resolves when the stream ends.
  fetchEventSourceMock.mockResolvedValue(undefined);
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('subscribeToHtmlEvents onmessage', () => {
  it('delivers a schema-valid event to onEvent', () => {
    const onEvent = vi.fn();
    subscribeToHtmlEvents('https://example.com/events', undefined, { onEvent });

    const { onmessage } = lastFetchEventSourceOptions();
    onmessage({ data: JSON.stringify(validHtmlEvent) });

    expect(onEvent).toHaveBeenCalledTimes(1);
    expect(onEvent.mock.calls[0][0]).toMatchObject({
      execution_status: 'in_progress',
    });
  });

  it('ignores non-JSON events (heartbeats) without calling onError', () => {
    const onEvent = vi.fn();
    const onError = vi.fn();
    subscribeToHtmlEvents('https://example.com/events', undefined, {
      onEvent,
      onError,
    });

    const { onmessage } = lastFetchEventSourceOptions();
    onmessage({ data: 'not json at all' });

    expect(onEvent).not.toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
  });

  it('invokes onError with an SseInvalidEventError when a JSON event fails schema parse', () => {
    const onEvent = vi.fn();
    const onError = vi.fn();
    subscribeToHtmlEvents('https://example.com/events', undefined, {
      onEvent,
      onError,
    });

    const { onmessage } = lastFetchEventSourceOptions();
    // Valid JSON, but not a valid HtmlEvent (missing required fields).
    onmessage({ data: JSON.stringify({ unexpected: 'shape' }) });

    expect(onEvent).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledTimes(1);
    const reported = onError.mock.calls[0][0];
    // Event-level validation failures use the named, non-fatal subtype so
    // consumers can distinguish them from connection-level errors.
    expect(reported).toBeInstanceOf(SseInvalidEventError);
    expect(reported.name).toBe('SseInvalidEventError');
    // The originating ZodError rides along as `cause` for the classifier.
    expect(reported.cause).toBeDefined();
  });

  it('fires onError once per invalid event (non-fatal, may repeat)', () => {
    const onEvent = vi.fn();
    const onError = vi.fn();
    subscribeToHtmlEvents('https://example.com/events', undefined, {
      onEvent,
      onError,
    });

    const { onmessage } = lastFetchEventSourceOptions();
    // A drifted stream emits several invalid events; each surfaces once and the
    // subscription is not torn down between them.
    onmessage({ data: JSON.stringify({ unexpected: 'shape' }) });
    onmessage({ data: JSON.stringify({ still: 'wrong' }) });

    expect(onError).toHaveBeenCalledTimes(2);
    for (const call of onError.mock.calls) {
      expect(call[0]).toBeInstanceOf(SseInvalidEventError);
    }
  });
});

describe('subscribeToHtmlEvents auto-abort', () => {
  it('completes and aborts on an event carrying an execution_error', () => {
    const onEvent = vi.fn();
    const onComplete = vi.fn();
    subscribeToHtmlEvents('https://example.com/events', undefined, {
      onEvent,
      onComplete,
    });

    const { onmessage, signal } = lastFetchEventSourceOptions();
    onmessage({ data: JSON.stringify(failedHtmlEvent) });

    // The terminal event still reaches the consumer before the subscription
    // tears down, so the UI can render the failure it describes.
    expect(onEvent).toHaveBeenCalledTimes(1);
    expect(onEvent.mock.calls[0][0]).toMatchObject({
      execution_error: { code: 'timeout' },
    });
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onEvent.mock.invocationCallOrder[0]).toBeLessThan(
      onComplete.mock.invocationCallOrder[0]
    );
    expect(signal.aborted).toBe(true);
  });

  it('completes and aborts on a successful complete event', () => {
    const onEvent = vi.fn();
    const onComplete = vi.fn();
    subscribeToHtmlEvents('https://example.com/events', undefined, {
      onEvent,
      onComplete,
    });

    const { onmessage, signal } = lastFetchEventSourceOptions();
    onmessage({ data: JSON.stringify(completeHtmlEvent) });

    expect(onEvent).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(signal.aborted).toBe(true);
  });

  it('stays open for a non-terminal event', () => {
    const onEvent = vi.fn();
    const onComplete = vi.fn();
    subscribeToHtmlEvents('https://example.com/events', undefined, {
      onEvent,
      onComplete,
    });

    const { onmessage, signal } = lastFetchEventSourceOptions();
    onmessage({ data: JSON.stringify(validHtmlEvent) });

    expect(onEvent).toHaveBeenCalledTimes(1);
    expect(onComplete).not.toHaveBeenCalled();
    expect(signal.aborted).toBe(false);
  });

  it('leaves the stream open on failure when autoAbortOnComplete is false', () => {
    const onEvent = vi.fn();
    const onComplete = vi.fn();
    subscribeToHtmlEvents('https://example.com/events', undefined, {
      onEvent,
      onComplete,
      autoAbortOnComplete: false,
    });

    const { onmessage, signal } = lastFetchEventSourceOptions();
    onmessage({ data: JSON.stringify(failedHtmlEvent) });

    // Opting out disables both terminal conditions, not just the success one.
    expect(onEvent).toHaveBeenCalledTimes(1);
    expect(onComplete).not.toHaveBeenCalled();
    expect(signal.aborted).toBe(false);
  });

  it('leaves the stream open on success when autoAbortOnComplete is false', () => {
    const onEvent = vi.fn();
    const onComplete = vi.fn();
    subscribeToHtmlEvents('https://example.com/events', undefined, {
      onEvent,
      onComplete,
      autoAbortOnComplete: false,
    });

    const { onmessage, signal } = lastFetchEventSourceOptions();
    onmessage({ data: JSON.stringify(completeHtmlEvent) });

    expect(onComplete).not.toHaveBeenCalled();
    expect(signal.aborted).toBe(false);
  });
});

describe('subscribeToHtmlEvents bounded reconnect', () => {
  it('terminates with SseConnectionFailedError once maxReconnectAttempts is reached', () => {
    const onEvent = vi.fn();
    const onError = vi.fn();
    subscribeToHtmlEvents('https://example.com/events', undefined, {
      onEvent,
      onError,
      maxReconnectAttempts: 2,
    });

    const { onerror, signal } = lastFetchEventSourceOptions();
    const first = new Error('connection reset');
    expect(onerror(first)).toBeUndefined();
    expect(signal.aborted).toBe(false);

    // The second consecutive failure hits the limit: fetch-event-source is told
    // to stop reconnecting (by throwing) and the stream is aborted.
    const second = new Error('connection reset again');
    expect(() => onerror(second)).toThrow();
    expect(signal.aborted).toBe(true);

    // The underlying error is still reported for each failure, plus a final
    // distinguishable terminal error carrying the last failure as `cause`.
    expect(onError).toHaveBeenCalledTimes(3);
    expect(onError.mock.calls[0][0]).toBe(first);
    expect(onError.mock.calls[1][0]).toBe(second);
    const terminal = onError.mock.calls[2][0];
    expect(terminal).toBeInstanceOf(SseConnectionFailedError);
    expect(terminal.name).toBe('SseConnectionFailedError');
    expect(terminal.cause).toBe(second);
    expect(terminal.attempts).toBe(2);
  });

  it('applies a configurable backoff delay that grows with each attempt', () => {
    const onEvent = vi.fn();
    subscribeToHtmlEvents('https://example.com/events', undefined, {
      onEvent,
      maxReconnectAttempts: 5,
      reconnectBackoffMs: 250,
    });

    const { onerror } = lastFetchEventSourceOptions();

    expect(onerror(new Error('boom'))).toBe(250);
    expect(onerror(new Error('boom'))).toBe(500);
    expect(onerror(new Error('boom'))).toBe(750);
  });

  it('leaves retry behavior unbounded and undelayed by default', () => {
    const onEvent = vi.fn();
    const onError = vi.fn();
    subscribeToHtmlEvents('https://example.com/events', undefined, {
      onEvent,
      onError,
    });

    const { onerror, signal } = lastFetchEventSourceOptions();

    // No reconnect options: every failure is reported as a plain Error, the
    // transport's own retry interval is left in place (no number returned), and
    // the subscription never gives up.
    for (let i = 0; i < 10; i++) {
      expect(onerror(new Error(`boom ${i}`))).toBeUndefined();
    }

    expect(signal.aborted).toBe(false);
    expect(onError).toHaveBeenCalledTimes(10);
    for (const call of onError.mock.calls) {
      expect(call[0]).not.toBeInstanceOf(SseConnectionFailedError);
    }
  });

  it('resets the failure count after a connection opens successfully', async () => {
    const onEvent = vi.fn();
    const onError = vi.fn();
    subscribeToHtmlEvents('https://example.com/events', undefined, {
      onEvent,
      onError,
      maxReconnectAttempts: 2,
    });

    const { onerror, onopen, signal } = lastFetchEventSourceOptions();

    onerror(new Error('boom'));
    await onopen(okResponse());

    // The reconnect succeeded, so the next failure starts a fresh run rather
    // than tripping the limit.
    expect(onerror(new Error('boom again'))).toBeUndefined();
    expect(signal.aborted).toBe(false);
    expect(onError).toHaveBeenCalledTimes(2);
  });
});
