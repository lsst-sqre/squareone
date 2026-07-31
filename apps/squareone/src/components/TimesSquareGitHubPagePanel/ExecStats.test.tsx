import { mockExecutionError } from '@lsst-sqre/times-square-client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  TimesSquareHtmlEventsContext,
  type TimesSquareHtmlEventsContextValue,
} from '../TimesSquareHtmlEventsProvider';

// Pin the app's Sentry reporter so we can assert it fires on a failed
// recompute request.
const mockReportError = vi.fn();
vi.mock('@/lib/sentry/reportError', () => ({
  makeReportError: () => mockReportError,
}));

import ExecStats from './ExecStats';

const completeContext: TimesSquareHtmlEventsContextValue = {
  dateSubmitted: '2021-09-01T12:00:00Z',
  dateStarted: '2021-09-01T12:00:01Z',
  dateFinished: '2021-09-01T12:00:10Z',
  executionStatus: 'complete',
  executionDuration: 10.12,
  htmlHash: 'abc123',
  htmlUrl: 'https://example.com/html',
  connectionFailed: false,
  executionError: null,
};

/*
 * A failed run still reports `execution_status: 'complete'` — the failure is
 * carried by `execution_error` alone (DM-55470).
 */
const failedContext: TimesSquareHtmlEventsContextValue = {
  ...completeContext,
  executionDuration: 14.2,
  executionError: mockExecutionError,
};

/** Body shape returned by the Times Square soft-delete endpoint. */
const deleteResponseBody = JSON.stringify({
  html_url: 'https://example.com/html',
  html_events_url: 'https://example.com/html/events',
});

function renderExecStats(context: TimesSquareHtmlEventsContextValue) {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <TimesSquareHtmlEventsContext.Provider value={context}>
        <ExecStats />
      </TimesSquareHtmlEventsContext.Provider>
    </QueryClientProvider>
  );
}

describe('ExecStats execution failure', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('summarizes the failure with the API title instead of a computed duration', () => {
    renderExecStats(failedContext);

    expect(screen.getByText(mockExecutionError.title)).toBeInTheDocument();
    expect(screen.queryByText(/Computed/)).not.toBeInTheDocument();
    expect(screen.queryByText(/seconds/)).not.toBeInTheDocument();
  });

  it('shows when the run finished', () => {
    const { container } = renderExecStats(failedContext);

    const time = container.querySelector('time');
    expect(time).toHaveAttribute('datetime', failedContext.dateFinished);
  });

  it('omits the timestamp when the failed run has no finish time', () => {
    const { container } = renderExecStats({
      ...failedContext,
      dateFinished: null,
      executionDuration: null,
    });

    expect(screen.getByText(mockExecutionError.title)).toBeInTheDocument();
    expect(container.querySelector('time')).toBeNull();
  });

  it('keeps the recompute path available in the failed state', async () => {
    const user = userEvent.setup();
    const fetchSpy = vi
      .spyOn(global, 'fetch')
      .mockResolvedValue(new Response(deleteResponseBody, { status: 200 }));

    renderExecStats(failedContext);

    await user.click(screen.getByRole('button', { name: /recompute/i }));

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });
    expect(fetchSpy.mock.calls[0][0]).toBe('https://example.com/html');
    expect(fetchSpy.mock.calls[0][1]).toMatchObject({ method: 'DELETE' });
  });

  it('surfaces a failed recompute request from the failed state', async () => {
    const user = userEvent.setup();
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(null, { status: 500, statusText: 'Internal Server Error' })
    );

    renderExecStats(failedContext);

    await user.click(screen.getByRole('button', { name: /recompute/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/recompute/i);
  });

  it('renders the computed summary when there is no execution error', () => {
    renderExecStats(completeContext);

    expect(screen.getByText(/Computed/)).toHaveTextContent(
      /Computed .* in 10\.1 seconds\./
    );
  });
});

describe('ExecStats recompute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('requests the recompute through the shared soft-delete mutation', async () => {
    const user = userEvent.setup();
    const fetchSpy = vi
      .spyOn(global, 'fetch')
      .mockResolvedValue(new Response(deleteResponseBody, { status: 200 }));

    renderExecStats(completeContext);

    await user.click(screen.getByRole('button', { name: /recompute/i }));

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });
    // The package client sends credentials; a bare app-side fetch did not.
    expect(fetchSpy.mock.calls[0][0]).toBe('https://example.com/html');
    expect(fetchSpy.mock.calls[0][1]).toMatchObject({
      method: 'DELETE',
      credentials: 'include',
    });
  });

  it('surfaces and reports a failed (non-ok) recompute request', async () => {
    const user = userEvent.setup();
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(null, { status: 500, statusText: 'Internal Server Error' })
    );

    renderExecStats(completeContext);

    await user.click(screen.getByRole('button', { name: /recompute/i }));

    // User-facing failure indication.
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/recompute/i);

    // Reported to Sentry with site context.
    await waitFor(() => {
      expect(mockReportError).toHaveBeenCalledTimes(1);
    });
    expect(mockReportError.mock.calls[0][1]).toMatchObject({
      site: 'times-square-recompute',
    });
  });

  it('surfaces and reports a recompute request that throws', async () => {
    const user = userEvent.setup();
    vi.spyOn(global, 'fetch').mockRejectedValue(new TypeError('network down'));

    renderExecStats(completeContext);

    await user.click(screen.getByRole('button', { name: /recompute/i }));

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    await waitFor(() => {
      expect(mockReportError).toHaveBeenCalledTimes(1);
    });
  });

  it('does not report or show an error on a successful recompute', async () => {
    const user = userEvent.setup();
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(deleteResponseBody, { status: 200 })
    );

    renderExecStats(completeContext);

    await user.click(screen.getByRole('button', { name: /recompute/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
    expect(mockReportError).not.toHaveBeenCalled();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('clears a previous failure when a retry succeeds', async () => {
    const user = userEvent.setup();
    vi.spyOn(global, 'fetch')
      .mockResolvedValueOnce(
        new Response(null, { status: 500, statusText: 'Internal Server Error' })
      )
      .mockResolvedValueOnce(new Response(deleteResponseBody, { status: 200 }));

    renderExecStats(completeContext);

    const button = screen.getByRole('button', { name: /recompute/i });
    await user.click(button);
    expect(await screen.findByRole('alert')).toBeInTheDocument();

    await user.click(button);
    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });
});
