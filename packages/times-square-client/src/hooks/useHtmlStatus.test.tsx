import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { mockHtmlStatusFailed, mockHtmlStatusPending } from '../mock-data';
import type { HtmlStatus } from '../schemas';

import { useHtmlStatus } from './useHtmlStatus';

const htmlStatusUrl =
  'https://example.com/times-square/api/v1/pages/summit-weather/htmlstatus';

/** The 1 s poll cadence plus enough slack for a couple of refetches. */
const POLL_OBSERVATION_MS = 2500;

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

/** Stub `fetch` so every htmlstatus request resolves with `status`. */
function mockFetch(status: HtmlStatus) {
  return vi.spyOn(globalThis, 'fetch').mockImplementation(
    async () =>
      new Response(JSON.stringify(status), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
  );
}

/** Wait out `POLL_OBSERVATION_MS` of real time so any polling can happen. */
function observePolling() {
  return new Promise((resolve) => setTimeout(resolve, POLL_OBSERVATION_MS));
}

describe('useHtmlStatus', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('reports a null executionError while execution is still pending', async () => {
    mockFetch(mockHtmlStatusPending);

    const { result } = renderHook(
      () => useHtmlStatus('', undefined, { htmlStatusUrl }),
      {
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.executionError).toBeNull();
    expect(result.current.htmlAvailable).toBe(false);
  });

  it('exposes the execution error once the status reports one', async () => {
    mockFetch(mockHtmlStatusFailed);

    const { result } = renderHook(
      () => useHtmlStatus('', undefined, { htmlStatusUrl }),
      {
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.executionError).toEqual(
      mockHtmlStatusFailed.execution_error
    );
  });

  it('stops requesting status once an execution error is reported', async () => {
    const fetchSpy = mockFetch(mockHtmlStatusFailed);

    const { result } = renderHook(
      () => useHtmlStatus('', undefined, { htmlStatusUrl }),
      {
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    const callsWhenErrorObserved = fetchSpy.mock.calls.length;

    await observePolling();

    expect(fetchSpy.mock.calls.length).toBe(callsWhenErrorObserved);
  });

  it('keeps polling while no execution error is reported', async () => {
    const fetchSpy = mockFetch(mockHtmlStatusPending);

    const { result } = renderHook(
      () => useHtmlStatus('', undefined, { htmlStatusUrl }),
      {
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    const callsWhenPendingObserved = fetchSpy.mock.calls.length;

    await observePolling();

    expect(fetchSpy.mock.calls.length).toBeGreaterThan(
      callsWhenPendingObserved
    );
  });
});
