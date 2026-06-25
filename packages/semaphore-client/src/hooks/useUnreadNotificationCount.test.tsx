import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useUnreadNotificationCount } from './useUnreadNotificationCount';

const url = 'https://example.com/semaphore';

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

describe('useUnreadNotificationCount', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns the unread count read from X-Total-Count', async () => {
    const mockFetch = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'X-Total-Count': '5' },
      })
    );

    const { result } = renderHook(() => useUnreadNotificationCount(url), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.count).toBe(5);
    });

    // Queries the unread, single-item page purely to read the count header.
    const calledUrl = new URL(mockFetch.mock.calls[0][0] as string);
    expect(calledUrl.searchParams.get('unread')).toBe('true');
    expect(calledUrl.searchParams.get('limit')).toBe('1');
  });

  it('does not report loading and does not fetch when disabled (empty url)', () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    const { result } = renderHook(() => useUnreadNotificationCount(''), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.count).toBeUndefined();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('still resolves the count when a poll interval is configured', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'X-Total-Count': '2' },
      })
    );

    const { result } = renderHook(
      () => useUnreadNotificationCount(url, { pollIntervalSeconds: 300 }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.count).toBe(2);
    });
  });
});
