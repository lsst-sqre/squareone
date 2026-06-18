import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useCreateAdminNotification } from './useCreateAdminNotification';

const url = 'https://example.com/semaphore';

const created = {
  id: '4561-a7513',
  created: '2026-06-12T17:10:32+00:00',
  read: null,
  sender: 'some-admin',
  recipient: 'some-user',
  summary: 'Heads up',
  body: null,
  url: 'https://example.com/semaphore/v1/admin/notifications/4561-a7513',
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { Wrapper, queryClient };
}

describe('useCreateAdminNotification', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('exposes a create mutation', () => {
    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useCreateAdminNotification(url), {
      wrapper: Wrapper,
    });

    expect(typeof result.current.mutate).toBe('function');
    expect(typeof result.current.mutateAsync).toBe('function');
    expect(result.current.isPending).toBe(false);
  });

  it('POSTs with the CSRF header, credentials, and the notification body', async () => {
    const mockFetch = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(
        new Response(JSON.stringify(created), { status: 200 })
      );
    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useCreateAdminNotification(url), {
      wrapper: Wrapper,
    });

    await act(async () => {
      await result.current.mutateAsync({
        notification: { recipient: 'some-user', summary: 'Heads up' },
        csrfToken: 'csrf-token-abc',
      });
    });

    const [calledUrl, init] = mockFetch.mock.calls[0];
    expect(calledUrl).toBe(
      'https://example.com/semaphore/v1/admin/notifications'
    );
    expect(init?.method).toBe('POST');
    expect(init?.credentials).toBe('include');
    expect((init?.headers as Record<string, string>)['x-csrf-token']).toBe(
      'csrf-token-abc'
    );
    expect(JSON.parse(init?.body as string)).toEqual({
      recipient: 'some-user',
      summary: 'Heads up',
    });
  });

  it('invalidates the admin-notifications list query on success', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(created), { status: 200 })
    );
    const { Wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useCreateAdminNotification(url), {
      wrapper: Wrapper,
    });

    await act(async () => {
      await result.current.mutateAsync({
        notification: { recipient: 'some-user', summary: 'Heads up' },
        csrfToken: 'csrf-token-abc',
      });
    });

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['admin-notifications', url],
      });
    });
  });
});
