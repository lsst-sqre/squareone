import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { mockPage } from '../mock-data';

import { useTimesSquarePage } from './useTimesSquarePage';

const displayPath = 'lsst-sqre/times-square-demo/weather/summit-weather';

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

function mockFetch() {
  return vi.spyOn(globalThis, 'fetch').mockResolvedValue(
    new Response(JSON.stringify(mockPage), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  );
}

function requestedUrl(fetchSpy: ReturnType<typeof mockFetch>): string {
  const [input] = fetchSpy.mock.calls[0];
  return typeof input === 'string' ? input : (input as URL).toString();
}

describe('useTimesSquarePage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('requests the merged-page endpoint when no PR coordinates are given', async () => {
    const fetchSpy = mockFetch();

    const { result } = renderHook(() => useTimesSquarePage(displayPath), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(requestedUrl(fetchSpy)).toContain(
      `/times-square/api/v1/github/${displayPath}`
    );
    expect(result.current.htmlStatusUrl).toBe(mockPage.html_status_url);
    expect(result.current.htmlEventsUrl).toBe(mockPage.html_events_url);
    expect(result.current.renderedUrl).toBe(mockPage.rendered_url);
    expect(result.current.parameters).toEqual(mockPage.parameters);
    expect(result.current.github).toEqual(mockPage.github);
  });

  it('requests the PR-page endpoint when owner, repo, and commit are all provided', async () => {
    const fetchSpy = mockFetch();

    const { result } = renderHook(
      () =>
        useTimesSquarePage(displayPath, {
          owner: 'lsst-sqre',
          repo: 'times-square-demo',
          commit: 'abc123',
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(requestedUrl(fetchSpy)).toContain(
      `/times-square/api/v1/github-pr/lsst-sqre/times-square-demo/abc123/${displayPath}`
    );
    expect(result.current.htmlStatusUrl).toBe(mockPage.html_status_url);
    expect(result.current.htmlEventsUrl).toBe(mockPage.html_events_url);
    expect(result.current.renderedUrl).toBe(mockPage.rendered_url);
    expect(result.current.parameters).toEqual(mockPage.parameters);
    expect(result.current.github).toEqual(mockPage.github);
  });

  it('falls back to the merged-page endpoint when a PR coordinate is missing', async () => {
    const fetchSpy = mockFetch();

    const { result } = renderHook(
      () =>
        useTimesSquarePage(displayPath, {
          owner: 'lsst-sqre',
          repo: 'times-square-demo',
          // commit intentionally omitted
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const url = requestedUrl(fetchSpy);
    expect(url).toContain(`/times-square/api/v1/github/${displayPath}`);
    expect(url).not.toContain('github-pr');
    expect(result.current.htmlStatusUrl).toBe(mockPage.html_status_url);
  });
});
