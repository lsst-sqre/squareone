import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useUserNotifications } from './useUserNotifications';

const url = 'https://example.com/semaphore';

const n1 = {
  id: 'n1',
  created: '2026-06-12T17:10:32+00:00',
  read: null,
  summary: { gfm: 'First', html: '<p>First</p>' },
  url: 'https://example.com/semaphore/v1/notifications/messages/n1',
};

const n2 = {
  id: 'n2',
  created: '2026-06-11T17:10:32+00:00',
  read: null,
  summary: { gfm: 'Second', html: '<p>Second</p>' },
  url: 'https://example.com/semaphore/v1/notifications/messages/n2',
};

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

describe('useUserNotifications', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('exposes entries, totalCount, and hasMore from the first page', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify([n1]), {
        status: 200,
        headers: {
          Link: '<https://example.com/semaphore/v1/notifications/messages?cursor=c2>; rel="next"',
          'X-Total-Count': '2',
        },
      })
    );

    const { result } = renderHook(() => useUserNotifications(url), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.entries).toEqual([n1]);
    expect(result.current.totalCount).toBe(2);
    expect(result.current.hasMore).toBe(true);
  });

  it('does not report loading and does not fetch when disabled (empty url)', () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    const { result } = renderHook(() => useUserNotifications(''), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.entries).toBeUndefined();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('appends the next page to entries when loadMore is called', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation((input) => {
      const requested = String(input);
      if (requested.includes('cursor=c2')) {
        return Promise.resolve(
          new Response(JSON.stringify([n2]), { status: 200 })
        );
      }
      return Promise.resolve(
        new Response(JSON.stringify([n1]), {
          status: 200,
          headers: {
            Link: '<https://example.com/semaphore/v1/notifications/messages?cursor=c2>; rel="next"',
            'X-Total-Count': '2',
          },
        })
      );
    });

    const { result } = renderHook(() => useUserNotifications(url), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.entries).toEqual([n1]);
    });

    act(() => {
      result.current.loadMore();
    });

    await waitFor(() => {
      expect(result.current.entries).toEqual([n1, n2]);
    });

    expect(result.current.hasMore).toBe(false);
  });
});
