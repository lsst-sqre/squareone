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
};

function renderExecStats(context: TimesSquareHtmlEventsContextValue) {
  return render(
    <TimesSquareHtmlEventsContext.Provider value={context}>
      <ExecStats />
    </TimesSquareHtmlEventsContext.Provider>
  );
}

describe('ExecStats recompute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
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
      new Response(null, { status: 202 })
    );

    renderExecStats(completeContext);

    await user.click(screen.getByRole('button', { name: /recompute/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
    expect(mockReportError).not.toHaveBeenCalled();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
