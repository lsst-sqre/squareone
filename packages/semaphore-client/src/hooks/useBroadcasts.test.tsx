import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clearBroadcastsCache } from '../client';
import { mockBroadcasts } from '../mock-broadcasts';
import { useBroadcasts } from './useBroadcasts';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe('useBroadcasts', () => {
  beforeEach(() => {
    clearBroadcastsCache();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    clearBroadcastsCache();
  });

  it('returns broadcasts on successful fetch', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(mockBroadcasts), { status: 200 })
    );

    const { result } = renderHook(
      () => useBroadcasts('https://example.com/semaphore'),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });

    expect(result.current.broadcasts).toEqual(mockBroadcasts);
    expect(result.current.isError).toBe(false);
  });

  it('returns empty array on fetch error (graceful degradation)', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(
      new TypeError('fetch failed')
    );

    const { result } = renderHook(
      () => useBroadcasts('https://example.com/semaphore'),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });

    // queryFn catches errors and returns []
    expect(result.current.broadcasts).toEqual([]);
  });
});
