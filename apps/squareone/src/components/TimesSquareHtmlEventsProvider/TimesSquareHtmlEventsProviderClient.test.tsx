import { fetchEventSource } from '@microsoft/fetch-event-source';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Capture the options object passed to fetchEventSource so the test can drive
// its onerror callback directly and assert the reconnect/terminal behavior.
type FetchEventSourceInit = {
  onerror?: (err: unknown) => number | null | undefined;
};
let capturedInit: FetchEventSourceInit | null = null;
vi.mock('@microsoft/fetch-event-source', () => {
  function noop(): void {}
  return {
    fetchEventSource: vi.fn(
      (_url: string, init: FetchEventSourceInit): Promise<void> => {
        capturedInit = init;
        // Never resolves; the connection stays "open" so onerror drives the test.
        return new Promise<void>(noop);
      }
    ),
  };
});

// Pin the app's Sentry reporter so we can assert connection-error captures are
// throttled/deduped.
const mockReportError = vi.fn();
vi.mock('@/lib/sentry/reportError', () => ({
  makeReportError: () => mockReportError,
}));

// Give the client a concrete html_events_url to subscribe to.
vi.mock('@lsst-sqre/times-square-client', () => ({
  useTimesSquarePage: () => ({
    htmlEventsUrl: 'https://example.com/html/events',
  }),
}));
vi.mock('../../hooks/useRepertoireUrl', () => ({
  useRepertoireUrl: (): string | undefined => undefined,
}));

import TimesSquareHtmlEventsProviderClient, {
  MAX_SSE_RECONNECT_ATTEMPTS,
} from './TimesSquareHtmlEventsProviderClient';

const fetchEventSourceMock = vi.mocked(fetchEventSource);

describe('TimesSquareHtmlEventsProviderClient SSE terminal failure', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedInit = null;
  });

  it('reaches a terminal-failure state after bounded retries and throttles capture', async () => {
    render(
      <TimesSquareHtmlEventsProviderClient>
        <div>child</div>
      </TimesSquareHtmlEventsProviderClient>
    );

    // The client-only effect subscribes after the isClient flip.
    await waitFor(() => {
      expect(capturedInit?.onerror).toBeInstanceOf(Function);
    });

    const onerror = capturedInit?.onerror;
    if (!onerror) {
      throw new Error(
        'fetchEventSource was not called with an onerror handler'
      );
    }
    const connectionError = new Error('connection refused');

    // While under the retry budget, onerror must request a reconnect (returns a
    // numeric backoff) rather than throwing (which would abort permanently).
    for (let i = 0; i < MAX_SSE_RECONNECT_ATTEMPTS - 1; i++) {
      const result = onerror(connectionError);
      expect(typeof result).toBe('number');
    }

    // The attempt that exhausts the budget must throw to stop fetch-event-source
    // from reconnecting (terminal failure).
    expect(() => onerror(connectionError)).toThrow();

    // A user-facing terminal-failure state is shown.
    expect(await screen.findByRole('alert')).toBeInTheDocument();

    // Repeated identical connection errors are deduped to a single capture even
    // though onerror fired MAX_SSE_RECONNECT_ATTEMPTS times.
    expect(mockReportError).toHaveBeenCalledTimes(1);
    expect(mockReportError.mock.calls[0][1]).toMatchObject({
      site: 'times-square-sse',
    });
  });

  it('does not leak an unhandled rejection when the terminal throw rejects fetchEventSource', async () => {
    // The real @microsoft/fetch-event-source rejects the promise it returned
    // once onerror throws (dispose(); reject(innerErr)). Reproduce that exact
    // shape: resolve the captured onerror to the caller, then reject with the
    // thrown error — mirroring the library's terminal-failure path.
    fetchEventSourceMock.mockImplementationOnce(
      (_input, init): Promise<void> => {
        capturedInit = init as FetchEventSourceInit;
        return new Promise<void>((_resolve, reject) => {
          const terminalError = new Error('connection refused');
          // Drive onerror up to and past the retry budget synchronously, then
          // reject exactly as the library does when onerror throws.
          for (let i = 0; i < MAX_SSE_RECONNECT_ATTEMPTS - 1; i++) {
            init.onerror?.(terminalError);
          }
          try {
            init.onerror?.(terminalError);
          } catch (thrown) {
            reject(thrown);
          }
        });
      }
    );

    const unhandledRejections: unknown[] = [];
    const onUnhandled = (reason: unknown) => {
      unhandledRejections.push(reason);
    };
    process.on('unhandledRejection', onUnhandled);

    try {
      render(
        <TimesSquareHtmlEventsProviderClient>
          <div>child</div>
        </TimesSquareHtmlEventsProviderClient>
      );

      // The terminal-failure alert renders once the effect subscribes.
      expect(await screen.findByRole('alert')).toBeInTheDocument();

      // Give the microtask/macrotask queue a chance to flush any rejection the
      // runtime would report as unhandled.
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(unhandledRejections).toEqual([]);
    } finally {
      process.off('unhandledRejection', onUnhandled);
    }
  });
});
