import { subscribeToEventSource } from '@lsst-sqre/sse-client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createHtmlEventsUrl, subscribeToHtmlEvents } from './sse';

vi.mock('@lsst-sqre/sse-client', () => ({
  subscribeToEventSource: vi.fn(() => vi.fn()),
}));

const subscribeMock = vi.mocked(subscribeToEventSource);

/**
 * Get the URL and options from the most recent subscribeToEventSource call.
 */
function lastSubscription() {
  const call = subscribeMock.mock.calls.at(-1);
  if (!call) {
    throw new Error('subscribeToEventSource was not called');
  }
  return { url: call[0], options: call[1] };
}

/**
 * Emit a raw SSE message through the captured onMessage callback.
 */
function emitMessage(data: string) {
  lastSubscription().options.onMessage({ data });
}

const inProgressEvent = {
  date_submitted: '2026-07-03T00:00:00Z',
  date_started: '2026-07-03T00:00:01Z',
  date_finished: null,
  execution_status: 'in_progress',
  execution_duration: null,
  html_hash: null,
  html_url: 'https://example.com/times-square/v1/pages/mypage/html',
};

beforeEach(() => {
  subscribeMock.mockClear();
});

const completeEvent = {
  ...inProgressEvent,
  date_finished: '2026-07-03T00:00:42Z',
  execution_status: 'complete',
  execution_duration: 41.0,
  html_hash: 'abc123',
};

describe('subscribeToHtmlEvents', () => {
  it('delivers a valid event to onEvent', () => {
    const onEvent = vi.fn();

    subscribeToHtmlEvents('https://example.com/events', undefined, {
      onEvent,
    });

    emitMessage(JSON.stringify(inProgressEvent));

    expect(onEvent).toHaveBeenCalledTimes(1);
    expect(onEvent).toHaveBeenCalledWith(inProgressEvent);
  });

  it('auto-aborts the connection and calls onComplete on a completion event', () => {
    const onEvent = vi.fn();
    const onComplete = vi.fn();

    subscribeToHtmlEvents('https://example.com/events', undefined, {
      onEvent,
      onComplete,
    });

    const { options } = lastSubscription();
    expect(options.signal?.aborted).toBe(false);

    emitMessage(JSON.stringify(completeEvent));

    expect(onEvent).toHaveBeenCalledWith(completeEvent);
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(options.signal?.aborted).toBe(true);
  });

  it('aborts the connection when the cleanup function is called', () => {
    const cleanup = subscribeToHtmlEvents('https://example.com/events');

    const { options } = lastSubscription();
    expect(options.signal?.aborted).toBe(false);

    cleanup();

    expect(options.signal?.aborted).toBe(true);
  });

  it('aborts the connection when the external signal aborts', () => {
    const externalController = new AbortController();

    subscribeToHtmlEvents('https://example.com/events', undefined, {
      onEvent: vi.fn(),
      signal: externalController.signal,
    });

    const { options } = lastSubscription();
    expect(options.signal?.aborted).toBe(false);

    externalController.abort();

    expect(options.signal?.aborted).toBe(true);
  });

  it('logs scheduled reconnects through the logger', () => {
    const logger = { debug: vi.fn(), warn: vi.fn(), error: vi.fn() };

    subscribeToHtmlEvents('https://example.com/events', undefined, {
      onEvent: vi.fn(),
      logger,
    });

    lastSubscription().options.onScheduleReconnect?.({ delay: 2000 });

    expect(logger.debug).toHaveBeenCalledWith(
      expect.objectContaining({ delay: 2000 }),
      expect.any(String)
    );
  });

  it('surfaces connection loss through onError', () => {
    const onError = vi.fn();

    subscribeToHtmlEvents('https://example.com/events', undefined, {
      onEvent: vi.fn(),
      onError,
    });

    lastSubscription().options.onDisconnect?.();

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(expect.any(Error));
  });

  it('does not report connection loss after the subscription is aborted', () => {
    const onError = vi.fn();

    const cleanup = subscribeToHtmlEvents(
      'https://example.com/events',
      undefined,
      {
        onEvent: vi.fn(),
        onError,
      }
    );

    cleanup();
    lastSubscription().options.onDisconnect?.();

    expect(onError).not.toHaveBeenCalled();
  });

  it('appends params to the subscription URL', () => {
    subscribeToHtmlEvents('https://example.com/events', {
      ts_hide_code: '0',
    });

    expect(lastSubscription().url).toBe(
      'https://example.com/events?ts_hide_code=0'
    );
  });

  it('ignores malformed JSON messages such as heartbeats', () => {
    const onEvent = vi.fn();
    const onError = vi.fn();

    subscribeToHtmlEvents('https://example.com/events', undefined, {
      onEvent,
      onError,
    });

    emitMessage(': heartbeat');

    expect(onEvent).not.toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
  });

  it('rejects Zod-invalid payloads with a logger warning', () => {
    const onEvent = vi.fn();
    const logger = { debug: vi.fn(), warn: vi.fn(), error: vi.fn() };

    subscribeToHtmlEvents('https://example.com/events', undefined, {
      onEvent,
      logger,
    });

    emitMessage(JSON.stringify({ execution_status: 'not-a-real-status' }));

    expect(onEvent).not.toHaveBeenCalled();
    expect(logger.warn).toHaveBeenCalledWith(
      expect.objectContaining({ zodError: expect.anything() }),
      expect.any(String)
    );
  });

  it('does not auto-abort when autoAbortOnComplete is false', () => {
    const onComplete = vi.fn();

    subscribeToHtmlEvents('https://example.com/events', undefined, {
      onEvent: vi.fn(),
      onComplete,
      autoAbortOnComplete: false,
    });

    emitMessage(JSON.stringify(completeEvent));

    expect(onComplete).not.toHaveBeenCalled();
    expect(lastSubscription().options.signal?.aborted).toBe(false);
  });
});

describe('createHtmlEventsUrl', () => {
  it('appends params to the base events URL', () => {
    expect(
      createHtmlEventsUrl('https://example.com/events', { a: '1', b: '2' })
    ).toBe('https://example.com/events?a=1&b=2');
  });

  it('returns the base URL unchanged without params', () => {
    expect(createHtmlEventsUrl('https://example.com/events')).toBe(
      'https://example.com/events'
    );
  });
});
