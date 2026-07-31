import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { mockHtmlStatusFailed } from '../mock-data';
import { timesSquareKeys } from '../query-keys';

import { useRerunPage } from './useRerunPage';

const deleteResponse = {
  html_url: 'https://example.com/v1/pages/summit-weather/html',
  html_events_url: 'https://example.com/v1/pages/summit-weather/html/events',
};

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

/** Stub `fetch` with a successful soft-delete response. */
function stubDeleteOk() {
  return vi.spyOn(globalThis, 'fetch').mockResolvedValue(
    new Response(JSON.stringify(deleteResponse), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  );
}

describe('useRerunPage', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('soft-deletes the page html and invalidates its cached status', async () => {
    const fetchSpy = stubDeleteOk();
    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });
    const params = { site: 'summit' };
    const statusKey = timesSquareKeys.htmlStatusForPage(
      'summit-weather',
      params
    );
    queryClient.setQueryData(statusKey, mockHtmlStatusFailed);

    const { result } = renderHook(() => useRerunPage(), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.rerunPage({ pageName: 'summit-weather', params });
    });

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });

    expect(fetchSpy.mock.calls[0][0]).toBe(
      '/times-square/api/v1/pages/summit-weather/html?site=summit'
    );
    expect(queryClient.getQueryState(statusKey)?.isInvalidated).toBe(true);
  });

  it('surfaces a failed re-run request as an error', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('{}', { status: 500, statusText: 'Server Error' })
    );
    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });

    const { result } = renderHook(() => useRerunPage(), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.rerunPage({
        htmlUrl: 'https://example.com/v1/pages/summit-weather/html',
      });
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toMatch(/re-run/);
  });
});
