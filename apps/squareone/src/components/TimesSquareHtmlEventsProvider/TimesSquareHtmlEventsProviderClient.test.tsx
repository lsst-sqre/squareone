import type {
  HtmlEvent,
  SubscribeOptions,
} from '@lsst-sqre/times-square-client';
import {
  mockHtmlEventFailed,
  SseConnectionFailedError,
} from '@lsst-sqre/times-square-client';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Capture the arguments the provider hands to the package transport so the test
// can drive its callbacks directly and assert the subscription options.
const subscribeSpy =
  vi.fn<
    (
      url: string,
      params: Record<string, string> | undefined,
      options: SubscribeOptions
    ) => () => void
  >();
const unsubscribeSpy = vi.fn();

// Partially mock the package: the transport is spied on, but the real error
// classes, URL builder, and fixtures are kept so `instanceof` checks in the
// provider see the same classes the test constructs.
vi.mock('@lsst-sqre/times-square-client', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@lsst-sqre/times-square-client')>();
  return {
    ...actual,
    useTimesSquarePage: () => ({
      htmlEventsUrl: 'https://example.com/html/events',
    }),
    subscribeToHtmlEvents: (
      url: string,
      params: Record<string, string> | undefined,
      options: SubscribeOptions
    ) => {
      subscribeSpy(url, params, options);
      return unsubscribeSpy;
    },
  };
});

// Pin the app's Sentry reporter so we can assert connection-error captures are
// throttled/deduped.
const mockReportError = vi.fn();
vi.mock('@/lib/sentry/reportError', () => ({
  makeReportError: () => mockReportError,
}));

vi.mock('../../hooks/useRepertoireUrl', () => ({
  useRepertoireUrl: (): string | undefined => undefined,
}));

import { TimesSquareUrlParametersContext } from '../TimesSquareUrlParametersProvider';
import { TimesSquareHtmlEventsContext } from './TimesSquareHtmlEventsProvider';
import TimesSquareHtmlEventsProviderClient from './TimesSquareHtmlEventsProviderClient';

/** Surfaces the execution-error context field for assertions. */
function ExecutionErrorProbe() {
  const context = React.useContext(TimesSquareHtmlEventsContext);
  return (
    <div data-testid="execution-error-title">
      {context?.executionError?.title ?? 'none'}
    </div>
  );
}

/** Await the provider's client-only subscription and return its options. */
async function waitForSubscription(): Promise<SubscribeOptions> {
  await waitFor(() => {
    expect(subscribeSpy).toHaveBeenCalled();
  });
  const call = subscribeSpy.mock.calls[0];
  if (!call) {
    throw new Error('subscribeToHtmlEvents was not called');
  }
  return call[2];
}

describe('TimesSquareHtmlEventsProviderClient subscription', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('subscribes through the package transport with bounded reconnects', async () => {
    render(
      <TimesSquareHtmlEventsProviderClient>
        <div>child</div>
      </TimesSquareHtmlEventsProviderClient>
    );

    const options = await waitForSubscription();

    expect(subscribeSpy.mock.calls[0][0]).toBe(
      'https://example.com/html/events'
    );
    expect(options).toMatchObject({
      maxReconnectAttempts: 5,
      reconnectBackoffMs: 1000,
    });
  });

  it('appends the page URL query parameters to the events URL', async () => {
    render(
      <TimesSquareUrlParametersContext.Provider
        value={
          {
            githubSlug: 'owner/repo/notebook',
            urlQueryString: 'ts_hide_code=1&myvar=2',
          } as React.ContextType<typeof TimesSquareUrlParametersContext>
        }
      >
        <TimesSquareHtmlEventsProviderClient>
          <div>child</div>
        </TimesSquareHtmlEventsProviderClient>
      </TimesSquareUrlParametersContext.Provider>
    );

    await waitForSubscription();

    expect(subscribeSpy.mock.calls[0][0]).toBe(
      'https://example.com/html/events?ts_hide_code=1&myvar=2'
    );
  });
});

describe('TimesSquareHtmlEventsProviderClient SSE terminal failure', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders a terminal-failure alert only once the connection gives up', async () => {
    render(
      <TimesSquareHtmlEventsProviderClient>
        <div>child</div>
      </TimesSquareHtmlEventsProviderClient>
    );

    const { onError } = await waitForSubscription();
    const connectionError = new Error('connection refused');

    // Individual connection errors precede the terminal signal: the transport
    // is still reconnecting, so no user-facing failure state yet.
    onError?.(connectionError);
    onError?.(connectionError);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    // The terminal error from the bounded-reconnect budget drives the alert.
    onError?.(
      new SseConnectionFailedError('gave up', {
        cause: connectionError,
        attempts: 5,
      })
    );

    expect(await screen.findByRole('alert')).toBeInTheDocument();
  });

  it('captures the first connection error once per subscription', async () => {
    render(
      <TimesSquareHtmlEventsProviderClient>
        <div>child</div>
      </TimesSquareHtmlEventsProviderClient>
    );

    const { onError } = await waitForSubscription();
    const connectionError = new Error('connection refused');

    for (let i = 0; i < 5; i++) {
      onError?.(connectionError);
    }
    onError?.(
      new SseConnectionFailedError('gave up', {
        cause: connectionError,
        attempts: 5,
      })
    );

    // Repeated errors — and the terminal wrapper that follows them — dedupe to
    // a single capture of the underlying cause.
    expect(mockReportError).toHaveBeenCalledTimes(1);
    expect(mockReportError.mock.calls[0][0]).toBe(connectionError);
    expect(mockReportError.mock.calls[0][1]).toMatchObject({
      site: 'times-square-sse',
    });
  });
});

describe('TimesSquareHtmlEventsProviderClient execution errors', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exposes the execution error from a terminal event on the context', async () => {
    render(
      <TimesSquareHtmlEventsProviderClient>
        <ExecutionErrorProbe />
      </TimesSquareHtmlEventsProviderClient>
    );

    const { onEvent } = await waitForSubscription();

    expect(screen.getByTestId('execution-error-title')).toHaveTextContent(
      'none'
    );

    onEvent(mockHtmlEventFailed as HtmlEvent);

    await waitFor(() => {
      expect(screen.getByTestId('execution-error-title')).toHaveTextContent(
        mockHtmlEventFailed.execution_error?.title as string
      );
    });
  });
});
