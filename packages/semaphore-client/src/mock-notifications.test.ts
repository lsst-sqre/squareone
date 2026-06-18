import { describe, expect, it } from 'vitest';
import {
  filterAndPaginateNotifications,
  mockAdminNotifications,
} from './mock-notifications';

describe('mockAdminNotifications fixture', () => {
  it('is sorted most-recent first', () => {
    const times = mockAdminNotifications.map((n) =>
      new Date(n.created).getTime()
    );
    const sorted = [...times].sort((a, b) => b - a);
    expect(times).toEqual(sorted);
  });
});

describe('filterAndPaginateNotifications', () => {
  it('returns all entries with no filters or limit', () => {
    const page = filterAndPaginateNotifications(mockAdminNotifications, {});
    expect(page.entries).toEqual(mockAdminNotifications);
    expect(page.totalCount).toBe(mockAdminNotifications.length);
    expect(page.nextCursor).toBeNull();
  });

  it('filters by recipient', () => {
    const page = filterAndPaginateNotifications(mockAdminNotifications, {
      recipient: 'alice',
    });
    expect(page.entries.every((n) => n.recipient === 'alice')).toBe(true);
    expect(page.totalCount).toBe(4);
  });

  it('filters by sender', () => {
    const page = filterAndPaginateNotifications(mockAdminNotifications, {
      sender: 'ops-runbook',
    });
    expect(page.entries.every((n) => n.sender === 'ops-runbook')).toBe(true);
    expect(page.totalCount).toBe(3);
  });

  it('filters by since (inclusive) using a Date', () => {
    const page = filterAndPaginateNotifications(mockAdminNotifications, {
      since: new Date('2026-06-10T00:00:00Z'),
    });
    expect(page.totalCount).toBe(3);
    expect(
      page.entries.every(
        (n) =>
          new Date(n.created).getTime() >=
          new Date('2026-06-10T00:00:00Z').getTime()
      )
    ).toBe(true);
  });

  it('filters by until (inclusive) using an ISO string', () => {
    const page = filterAndPaginateNotifications(mockAdminNotifications, {
      until: '2026-06-08T23:59:59Z',
    });
    expect(page.totalCount).toBe(4);
    expect(
      page.entries.every(
        (n) =>
          new Date(n.created).getTime() <=
          new Date('2026-06-08T23:59:59Z').getTime()
      )
    ).toBe(true);
  });

  it('paginates with limit and an opaque cursor', () => {
    const page1 = filterAndPaginateNotifications(mockAdminNotifications, {
      limit: 3,
    });
    expect(page1.entries).toHaveLength(3);
    expect(page1.totalCount).toBe(8);
    expect(page1.nextCursor).not.toBeNull();

    const page2 = filterAndPaginateNotifications(mockAdminNotifications, {
      limit: 3,
      cursor: page1.nextCursor,
    });
    expect(page2.entries).toHaveLength(3);
    expect(page2.totalCount).toBe(8);
    expect(page2.nextCursor).not.toBeNull();

    const page3 = filterAndPaginateNotifications(mockAdminNotifications, {
      limit: 3,
      cursor: page2.nextCursor,
    });
    expect(page3.entries).toHaveLength(2);
    expect(page3.nextCursor).toBeNull();

    // The three pages together reconstruct the full filtered set in order.
    expect([...page1.entries, ...page2.entries, ...page3.entries]).toEqual(
      mockAdminNotifications
    );
  });

  it('combines a filter with pagination, keeping totalCount of the filtered set', () => {
    const page = filterAndPaginateNotifications(mockAdminNotifications, {
      recipient: 'alice',
      limit: 2,
    });
    expect(page.entries).toHaveLength(2);
    expect(page.entries.every((n) => n.recipient === 'alice')).toBe(true);
    expect(page.totalCount).toBe(4);
    expect(page.nextCursor).not.toBeNull();
  });
});
