import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAdminNotification } from './useAdminNotification';

const url = 'https://example.com/semaphore';

const detail = {
  id: '4561-a7513',
  created: '2026-06-12T17:10:32+00:00',
  read: null,
  sender: 'bot-quota',
  recipient: 'alice',
  summary: 'A summary',
  body: 'A body',
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

describe('useAdminNotification', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns a single notification on success', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(detail), { status: 200 })
    );

    const { result } = renderHook(
      () => useAdminNotification(url, '4561-a7513'),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.notification).toEqual(detail);
    expect(result.current.isError).toBe(false);
  });

  it('exposes an error state when the fetch fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('Not Found', { status: 404, statusText: 'Not Found' })
    );

    const { result } = renderHook(() => useAdminNotification(url, 'missing'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.notification).toBeUndefined();
  });
});
