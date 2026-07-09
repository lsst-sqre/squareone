import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useMarkNotificationsUnread } from './useMarkNotificationsUnread';

const url = 'https://example.com/semaphore';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { Wrapper, queryClient };
}

describe('useMarkNotificationsUnread', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('exposes a mark-unread mutation', () => {
    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useMarkNotificationsUnread(url), {
      wrapper: Wrapper,
    });

    expect(typeof result.current.mutate).toBe('function');
    expect(typeof result.current.mutateAsync).toBe('function');
    expect(result.current.isPending).toBe(false);
  });

  it('POSTs { ids } to the unread path with the CSRF header and credentials', async () => {
    const mockFetch = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(null, { status: 204 }));
    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useMarkNotificationsUnread(url), {
      wrapper: Wrapper,
    });

    await act(async () => {
      await result.current.mutateAsync({
        ids: ['n1', 'n2'],
        csrfToken: 'csrf-token-abc',
      });
    });

    const [calledUrl, init] = mockFetch.mock.calls[0];
    expect(calledUrl).toBe(
      'https://example.com/semaphore/v1/notifications/unread'
    );
    expect(init?.method).toBe('POST');
    expect(init?.credentials).toBe('include');
    expect((init?.headers as Record<string, string>)['x-csrf-token']).toBe(
      'csrf-token-abc'
    );
    expect(JSON.parse(init?.body as string)).toEqual({ ids: ['n1', 'n2'] });
  });

  it('invalidates the user list, the unread count, and each detail on success', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(null, { status: 204 })
    );
    const { Wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useMarkNotificationsUnread(url), {
      wrapper: Wrapper,
    });

    await act(async () => {
      await result.current.mutateAsync({
        ids: ['n1'],
        csrfToken: 'csrf-token-abc',
      });
    });

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['user-notifications', url],
      });
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['unread-notification-count', url],
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['user-notification', url, 'n1'],
    });
  });
});
