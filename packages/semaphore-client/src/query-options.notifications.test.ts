import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  adminNotificationQueryOptions,
  adminNotificationsInfiniteQueryOptions,
  unreadNotificationCountQueryOptions,
  userNotificationQueryOptions,
  userNotificationsInfiniteQueryOptions,
} from './query-options';
import type { AdminNotificationsPage, UserNotificationsPage } from './types';

const url = 'https://example.com/semaphore';

describe('adminNotificationsInfiniteQueryOptions', () => {
  it('includes the URL and serialized filters in the query key', () => {
    const since = new Date('2026-01-01T00:00:00Z');
    const opts = adminNotificationsInfiniteQueryOptions(url, {
      recipient: 'some-user',
      since,
    });

    expect(opts.queryKey).toEqual([
      'admin-notifications',
      url,
      { recipient: 'some-user', since: since.toISOString() },
    ]);
  });

  it('uses a null initial page param', () => {
    const opts = adminNotificationsInfiniteQueryOptions(url);
    expect(opts.initialPageParam).toBeNull();
  });

  it('derives the next page param from the last page nextCursor', () => {
    const opts = adminNotificationsInfiniteQueryOptions(url);
    const page: AdminNotificationsPage = {
      entries: [],
      nextCursor: '1614985055_4234',
      totalCount: 10,
    };
    expect(opts.getNextPageParam(page, [page], null, [null])).toBe(
      '1614985055_4234'
    );
  });

  it('returns null next page param when there is no next cursor', () => {
    const opts = adminNotificationsInfiniteQueryOptions(url);
    const page: AdminNotificationsPage = {
      entries: [],
      nextCursor: null,
      totalCount: 10,
    };
    expect(opts.getNextPageParam(page, [page], null, [null])).toBeNull();
  });

  it('is disabled when the URL is empty', () => {
    const opts = adminNotificationsInfiniteQueryOptions('');
    expect(opts.enabled).toBe(false);
  });
});

describe('adminNotificationQueryOptions', () => {
  it('produces a query key scoped to the URL and id', () => {
    const opts = adminNotificationQueryOptions(url, '4561-a7513');
    expect(opts.queryKey).toEqual(['admin-notification', url, '4561-a7513']);
  });

  it('is disabled when the id is empty', () => {
    const opts = adminNotificationQueryOptions(url, '');
    expect(opts.enabled).toBe(false);
  });
});

describe('userNotificationsInfiniteQueryOptions', () => {
  it('includes the URL and serialized filters in the query key', () => {
    const opts = userNotificationsInfiniteQueryOptions(url, {
      unread: true,
      limit: 25,
    });

    expect(opts.queryKey).toEqual([
      'user-notifications',
      url,
      { unread: true, limit: 25 },
    ]);
  });

  it('uses a null initial page param', () => {
    const opts = userNotificationsInfiniteQueryOptions(url);
    expect(opts.initialPageParam).toBeNull();
  });

  it('derives the next page param from the last page nextCursor', () => {
    const opts = userNotificationsInfiniteQueryOptions(url);
    const page: UserNotificationsPage = {
      entries: [],
      nextCursor: '1614985055_4234',
      totalCount: 10,
    };
    expect(opts.getNextPageParam(page, [page], null, [null])).toBe(
      '1614985055_4234'
    );
  });

  it('returns null next page param when there is no next cursor', () => {
    const opts = userNotificationsInfiniteQueryOptions(url);
    const page: UserNotificationsPage = {
      entries: [],
      nextCursor: null,
      totalCount: 10,
    };
    expect(opts.getNextPageParam(page, [page], null, [null])).toBeNull();
  });

  it('is disabled when the URL is empty', () => {
    const opts = userNotificationsInfiniteQueryOptions('');
    expect(opts.enabled).toBe(false);
  });
});

describe('userNotificationQueryOptions', () => {
  it('produces a query key scoped to the URL and id', () => {
    const opts = userNotificationQueryOptions(url, '4561-a7513');
    expect(opts.queryKey).toEqual(['user-notification', url, '4561-a7513']);
  });

  it('is disabled when the id is empty', () => {
    const opts = userNotificationQueryOptions(url, '');
    expect(opts.enabled).toBe(false);
  });
});

describe('unreadNotificationCountQueryOptions', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('produces a query key scoped to the URL', () => {
    const opts = unreadNotificationCountQueryOptions(url);
    expect(opts.queryKey).toEqual(['unread-notification-count', url]);
  });

  it('queries unread=true&limit=1 and returns the X-Total-Count', async () => {
    const mockFetch = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'X-Total-Count': '3' },
      })
    );

    const opts = unreadNotificationCountQueryOptions(url);
    const queryFn = opts.queryFn as () => Promise<number>;
    const count = await queryFn();

    expect(count).toBe(3);
    const calledUrl = new URL(mockFetch.mock.calls[0][0] as string);
    expect(calledUrl.pathname).toBe('/semaphore/v1/notifications/messages');
    expect(calledUrl.searchParams.get('unread')).toBe('true');
    expect(calledUrl.searchParams.get('limit')).toBe('1');
  });

  it('returns 0 when the X-Total-Count header is absent', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify([]), { status: 200 })
    );

    const opts = unreadNotificationCountQueryOptions(url);
    const queryFn = opts.queryFn as () => Promise<number>;
    expect(await queryFn()).toBe(0);
  });

  it('applies the refetchInterval from config', () => {
    const opts = unreadNotificationCountQueryOptions(url, {
      refetchInterval: 300_000,
    });
    expect(opts.refetchInterval).toBe(300_000);
  });

  it('is disabled when the URL is empty', () => {
    const opts = unreadNotificationCountQueryOptions('');
    expect(opts.enabled).toBe(false);
  });
});
