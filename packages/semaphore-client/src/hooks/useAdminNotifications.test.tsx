import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAdminNotifications } from './useAdminNotifications';

const url = 'https://example.com/semaphore';

const n1 = {
  id: 'n1',
  created: '2026-06-12T17:10:32+00:00',
  read: null,
  sender: 'bot-quota',
  recipient: 'alice',
  summary: 'First',
  body: null,
  url: 'https://example.com/semaphore/v1/admin/notifications/n1',
};

const n2 = {
  id: 'n2',
  created: '2026-06-11T17:10:32+00:00',
  read: null,
  sender: 'bot-quota',
  recipient: 'bob',
  summary: 'Second',
  body: null,
  url: 'https://example.com/semaphore/v1/admin/notifications/n2',
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

describe('useAdminNotifications', () => {
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
          Link: '<https://example.com/semaphore/v1/admin/notifications?cursor=c2>; rel="next"',
          'X-Total-Count': '2',
        },
      })
    );

    const { result } = renderHook(() => useAdminNotifications(url), {
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

    const { result } = renderHook(() => useAdminNotifications(''), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.entries).toBeUndefined();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('reports hasMore false when there is no next cursor', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify([n1]), { status: 200 })
    );

    const { result } = renderHook(() => useAdminNotifications(url), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.hasMore).toBe(false);
    expect(result.current.totalCount).toBeNull();
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
            Link: '<https://example.com/semaphore/v1/admin/notifications?cursor=c2>; rel="next"',
            'X-Total-Count': '2',
          },
        })
      );
    });

    const { result } = renderHook(() => useAdminNotifications(url), {
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
