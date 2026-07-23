import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Capture the options passed to fetchEventSource so tests can drive its
// handlers (onmessage/onopen/onerror) directly without a real network call.
const fetchEventSourceMock = vi.hoisted(() => vi.fn());

vi.mock('@microsoft/fetch-event-source', () => ({
  fetchEventSource: fetchEventSourceMock,
}));

import { subscribeToHtmlEvents } from './sse';

/** The options object handed to the most recent fetchEventSource call. */
function lastFetchEventSourceOptions() {
  const calls = fetchEventSourceMock.mock.calls;
  return calls[calls.length - 1][1] as {
    onmessage: (event: { data: string }) => void;
    onopen: (response: Response) => Promise<void>;
    onerror: (error: unknown) => void;
  };
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

  it('invokes onError with an Error when a JSON event fails schema parse', () => {
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
    expect(onError.mock.calls[0][0]).toBeInstanceOf(Error);
  });
});
