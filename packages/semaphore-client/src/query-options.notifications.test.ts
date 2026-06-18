import { describe, expect, it } from 'vitest';
import {
  adminNotificationQueryOptions,
  adminNotificationsInfiniteQueryOptions,
} from './query-options';
import type { AdminNotificationsPage } from './types';

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
