import * as semaphoreClient from '@lsst-sqre/semaphore-client';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useAutoMarkNotificationRead } from './useAutoMarkNotificationRead';

vi.mock('@lsst-sqre/semaphore-client', () => ({
  useMarkNotificationsRead: vi.fn(),
}));

const mutate = vi.fn();
const mockUseMarkNotificationsRead = vi.mocked(
  semaphoreClient.useMarkNotificationsRead
);

beforeEach(() => {
  vi.clearAllMocks();
  // The mutation object identity may change, but `mutate` is stable (as it is in
  // TanStack Query), so the auto-mark effect does not re-fire on every render.
  mockUseMarkNotificationsRead.mockReturnValue({
    mutate,
  } as unknown as ReturnType<typeof semaphoreClient.useMarkNotificationsRead>);
});

describe('useAutoMarkNotificationRead', () => {
  it('marks an unread notification read once it is viewed', () => {
    renderHook(() =>
      useAutoMarkNotificationRead({
        semaphoreUrl: 'https://semaphore.example.com',
        csrfToken: 'csrf-123',
        id: 'ntf-001',
        isUnread: true,
      })
    );

    expect(mutate).toHaveBeenCalledTimes(1);
    expect(mutate).toHaveBeenCalledWith({
      ids: ['ntf-001'],
      csrfToken: 'csrf-123',
    });
  });

  it('does not mark an already-read notification', () => {
    renderHook(() =>
      useAutoMarkNotificationRead({
        semaphoreUrl: 'https://semaphore.example.com',
        csrfToken: 'csrf-123',
        id: 'ntf-002',
        isUnread: false,
      })
    );

    expect(mutate).not.toHaveBeenCalled();
  });

  it('does nothing without a CSRF token', () => {
    renderHook(() =>
      useAutoMarkNotificationRead({
        semaphoreUrl: 'https://semaphore.example.com',
        csrfToken: null,
        id: 'ntf-001',
        isUnread: true,
      })
    );

    expect(mutate).not.toHaveBeenCalled();
  });

  it('does nothing before the Semaphore URL is discovered', () => {
    renderHook(() =>
      useAutoMarkNotificationRead({
        semaphoreUrl: undefined,
        csrfToken: 'csrf-123',
        id: 'ntf-001',
        isUnread: true,
      })
    );

    expect(mutate).not.toHaveBeenCalled();
  });

  it('does not re-mark the same notification across re-renders', () => {
    const { rerender } = renderHook(
      (props: { isUnread: boolean }) =>
        useAutoMarkNotificationRead({
          semaphoreUrl: 'https://semaphore.example.com',
          csrfToken: 'csrf-123',
          id: 'ntf-001',
          isUnread: props.isUnread,
        }),
      { initialProps: { isUnread: true } }
    );

    // A refetch after the mark still reports unread for one render before the
    // cache settles; the guard must not POST again.
    rerender({ isUnread: true });
    rerender({ isUnread: false });
    rerender({ isUnread: true });

    expect(mutate).toHaveBeenCalledTimes(1);
  });

  it('marks a different notification when the id changes', () => {
    const { rerender } = renderHook(
      (props: { id: string }) =>
        useAutoMarkNotificationRead({
          semaphoreUrl: 'https://semaphore.example.com',
          csrfToken: 'csrf-123',
          id: props.id,
          isUnread: true,
        }),
      { initialProps: { id: 'ntf-001' } }
    );

    rerender({ id: 'ntf-003' });

    expect(mutate).toHaveBeenCalledTimes(2);
    expect(mutate).toHaveBeenLastCalledWith({
      ids: ['ntf-003'],
      csrfToken: 'csrf-123',
    });
  });
});
