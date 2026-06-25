import type { QueryClient } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  type CreateAdminNotificationVariables,
  createAdminNotificationMutationOptions,
  type MarkNotificationsReadVariables,
  markNotificationsReadMutationOptions,
} from './mutation-options';
import type { UserNotificationWithUrl } from './schemas';

const url = 'https://example.com/semaphore';

const variables: CreateAdminNotificationVariables = {
  notification: { recipient: 'some-user', summary: 'Heads up' },
  csrfToken: 'csrf-token-abc',
};

const created: UserNotificationWithUrl = {
  id: '4561-a7513',
  created: '2026-06-12T17:10:32+00:00',
  read: null,
  sender: 'some-admin',
  recipient: 'some-user',
  summary: 'Heads up',
  body: null,
  url: 'https://example.com/semaphore/v1/admin/notifications/4561-a7513',
};

describe('createAdminNotificationMutationOptions', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('posts the notification via createAdminNotification', async () => {
    const mockFetch = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(JSON.stringify(created), { status: 200 })
      );
    const queryClient = {
      invalidateQueries: vi.fn(),
    } as unknown as QueryClient;

    const opts = createAdminNotificationMutationOptions(url, queryClient);
    // Invoke the mutationFn directly. It's cast to its single-variable call
    // shape so the test doesn't couple to TanStack's internal context arg.
    const mutationFn = opts.mutationFn as (
      v: CreateAdminNotificationVariables
    ) => Promise<UserNotificationWithUrl>;
    const result = await mutationFn(variables);

    expect(result).toEqual(created);
    const [calledUrl, init] = mockFetch.mock.calls[0];
    expect(calledUrl).toBe(
      'https://example.com/semaphore/v1/admin/notifications'
    );
    expect(init?.method).toBe('POST');
    expect((init?.headers as Record<string, string>)['x-csrf-token']).toBe(
      'csrf-token-abc'
    );
  });

  it('invalidates the admin-notifications list query on success', () => {
    const invalidateQueries = vi.fn();
    const queryClient = { invalidateQueries } as unknown as QueryClient;

    const opts = createAdminNotificationMutationOptions(url, queryClient);
    // Cast away the lifecycle-callback arity so the test only exercises the
    // invalidation behavior, not TanStack's exact onSuccess signature.
    const onSuccess = opts.onSuccess as (
      data: UserNotificationWithUrl,
      variables: CreateAdminNotificationVariables
    ) => void;
    onSuccess(created, variables);

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['admin-notifications', url],
    });
  });
});

describe('markNotificationsReadMutationOptions', () => {
  const variables: MarkNotificationsReadVariables = {
    ids: ['n1', 'n2'],
    csrfToken: 'csrf-token-abc',
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('marks the notifications read via markNotificationsRead', async () => {
    const mockFetch = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    const queryClient = {
      invalidateQueries: vi.fn(),
    } as unknown as QueryClient;

    const opts = markNotificationsReadMutationOptions(url, queryClient);
    const mutationFn = opts.mutationFn as (
      v: MarkNotificationsReadVariables
    ) => Promise<void>;
    await mutationFn(variables);

    const [calledUrl, init] = mockFetch.mock.calls[0];
    expect(calledUrl).toBe(
      'https://example.com/semaphore/v1/notifications/read'
    );
    expect(init?.method).toBe('POST');
    expect((init?.headers as Record<string, string>)['x-csrf-token']).toBe(
      'csrf-token-abc'
    );
    expect(JSON.parse(init?.body as string)).toEqual({ ids: ['n1', 'n2'] });
  });

  it('invalidates the user list, the unread count, and each affected detail on success', () => {
    const invalidateQueries = vi.fn();
    const queryClient = { invalidateQueries } as unknown as QueryClient;

    const opts = markNotificationsReadMutationOptions(url, queryClient);
    const onSuccess = opts.onSuccess as (
      data: undefined,
      variables: MarkNotificationsReadVariables
    ) => void;
    onSuccess(undefined, variables);

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['user-notifications', url],
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['unread-notification-count', url],
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['user-notification', url, 'n1'],
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['user-notification', url, 'n2'],
    });
  });
});
