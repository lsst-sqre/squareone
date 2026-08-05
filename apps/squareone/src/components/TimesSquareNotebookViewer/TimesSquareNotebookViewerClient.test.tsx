import {
  mockExecutionError,
  mockHtmlStatusAvailable,
  mockHtmlStatusFailed,
  mockPage,
} from '@lsst-sqre/times-square-client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TimesSquareUrlParametersContext } from '../TimesSquareUrlParametersProvider';

// The viewer resolves the Times Square base URL through Repertoire service
// discovery; without a URL the package falls back to its default relative base,
// which keeps these tests free of a ConfigProvider.
vi.mock('../../hooks/useRepertoireUrl', () => ({
  useRepertoireUrl: (): string | undefined => undefined,
}));

// Pin the app's Sentry reporter so a failed re-run request is observable.
const mockReportError = vi.fn();
vi.mock('@/lib/sentry/reportError', () => ({
  makeReportError: () => mockReportError,
}));

import TimesSquareNotebookViewerClient from './TimesSquareNotebookViewerClient';

const githubSlug = 'lsst-sqre/times-square-demo/weather/summit-weather';

type UrlParameters = NonNullable<
  React.ContextType<typeof TimesSquareUrlParametersContext>
>;

const urlParameters: UrlParameters = {
  tsPageUrl: `/times-square/api/v1/github/${githubSlug}`,
  displaySettings: { ts_hide_code: '1' },
  notebookParameters: { units: 'metric' },
  owner: null,
  repo: null,
  commit: null,
  tsSlug: githubSlug.split('/'),
  githubSlug,
  urlQueryString: 'units=metric',
};

/** Page metadata response, whose html_status_url the viewer polls. */
const pageResponse = JSON.stringify(mockPage);

/** Body shape returned by the Times Square soft-delete (re-run) endpoint. */
const deleteResponseBody = JSON.stringify({
  html_url: mockPage.html_url,
  html_events_url: mockPage.html_events_url,
});

type FetchStub = {
  /** Queue of html-status bodies; the last one repeats once exhausted. */
  htmlStatuses: unknown[];
  /** Response for the soft-delete (re-run) request. */
  deleteResponse?: () => Response;
};

/**
 * Route the three requests the viewer makes (page metadata, html status, and
 * the re-run soft delete) to canned responses, and return the spy so tests can
 * assert on the requests themselves.
 */
function stubFetch({ htmlStatuses, deleteResponse }: FetchStub) {
  const statuses = [...htmlStatuses];

  return vi
    .spyOn(global, 'fetch')
    .mockImplementation(async (input, init?: RequestInit) => {
      const url = String(input);

      if (init?.method === 'DELETE') {
        return (
          deleteResponse?.() ??
          new Response(deleteResponseBody, { status: 200 })
        );
      }
      if (url.startsWith(mockPage.html_status_url)) {
        const body = statuses.length > 1 ? statuses.shift() : statuses[0];
        return new Response(JSON.stringify(body), { status: 200 });
      }
      if (url.endsWith(`/github/${githubSlug}`)) {
        return new Response(pageResponse, { status: 200 });
      }
      throw new Error(`Unexpected request: ${url}`);
    });
}

function renderViewer() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <TimesSquareUrlParametersContext.Provider value={urlParameters}>
        <TimesSquareNotebookViewerClient />
      </TimesSquareUrlParametersContext.Provider>
    </QueryClientProvider>
  );
}

describe('TimesSquareNotebookViewerClient execution errors', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the API execution error title and message', async () => {
    stubFetch({ htmlStatuses: [mockHtmlStatusFailed] });

    renderViewer();

    expect(
      await screen.findByText(mockExecutionError.title)
    ).toBeInTheDocument();
    expect(screen.getByText(mockExecutionError.message)).toBeInTheDocument();
    // The terminal state replaces the loading state entirely.
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  it('stops issuing html-status requests once the failure is terminal', async () => {
    const fetchSpy = stubFetch({ htmlStatuses: [mockHtmlStatusFailed] });

    renderViewer();
    await screen.findByText(mockExecutionError.title);

    const statusRequests = () =>
      fetchSpy.mock.calls.filter(([input]) =>
        String(input).startsWith(mockPage.html_status_url)
      ).length;
    const requestsAtTerminalState = statusRequests();

    // Longer than the package's 1 s poll cadence: were polling still running,
    // at least one more status request would have gone out by now.
    await new Promise((resolve) => setTimeout(resolve, 1500));

    expect(statusRequests()).toBe(requestsAtTerminalState);
  });

  it('re-runs the page instance and returns to the loading state', async () => {
    const user = userEvent.setup();
    const fetchSpy = stubFetch({
      htmlStatuses: [mockHtmlStatusFailed, mockHtmlStatusAvailable],
    });

    renderViewer();
    await screen.findByText(mockExecutionError.title);

    await user.click(screen.getByRole('button', { name: /re-run/i }));

    // The soft delete targets the page instance: the page's html_url carrying
    // this instance's notebook parameters and display settings.
    await waitFor(() => {
      expect(
        fetchSpy.mock.calls.some(([, init]) => init?.method === 'DELETE')
      ).toBe(true);
    });
    const deleteCall = fetchSpy.mock.calls.find(
      ([, init]) => init?.method === 'DELETE'
    );
    expect(String(deleteCall?.[0])).toBe(
      `${mockPage.html_url}?units=metric&ts_hide_code=1`
    );

    // Invalidation drops the cached terminal error, so polling resumes and the
    // next successful status renders the notebook HTML.
    expect(await screen.findByTitle('Notebook viewer')).toBeInTheDocument();
    expect(
      screen.queryByText(mockExecutionError.title)
    ).not.toBeInTheDocument();
  });

  it('surfaces and reports a failed re-run request', async () => {
    const user = userEvent.setup();
    stubFetch({
      htmlStatuses: [mockHtmlStatusFailed],
      deleteResponse: () =>
        new Response(null, {
          status: 500,
          statusText: 'Internal Server Error',
        }),
    });

    renderViewer();
    await screen.findByText(mockExecutionError.title);

    await user.click(screen.getByRole('button', { name: /re-run/i }));

    expect(
      await screen.findByText(/failed to request a re-run/i)
    ).toBeVisible();
    await waitFor(() => {
      expect(mockReportError).toHaveBeenCalledTimes(1);
    });
    expect(mockReportError.mock.calls[0][1]).toMatchObject({
      site: 'times-square-rerun',
    });
  });
});

/** An html-status body from a Times Square predating the DM-55470 contract. */
type LegacyHtmlStatus = {
  available: boolean;
  html_url: string;
  html_hash: string | null;
};

describe('TimesSquareNotebookViewerClient without execution_error', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('behaves as before against a pre-DM-55470 response shape', async () => {
    // Times Square deployments predating DM-55470 omit the key entirely.
    const legacyPending: LegacyHtmlStatus = {
      available: false,
      html_url: mockPage.html_url,
      html_hash: null,
    };
    const legacyAvailable: LegacyHtmlStatus = {
      available: true,
      html_url: mockPage.html_url,
      html_hash: 'abc123',
    };
    stubFetch({ htmlStatuses: [legacyPending, legacyAvailable] });

    renderViewer();

    expect(await screen.findByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    // Polling is unaffected: the next 1 s poll picks up the available render.
    expect(
      await screen.findByTitle('Notebook viewer', undefined, { timeout: 3000 })
    ).toBeInTheDocument();
  });
});
