import { describe, expect, it } from 'vitest';
import {
  filterAndPaginateNotifications,
  filterAndPaginateUserNotifications,
  markUserNotificationsRead,
  mockAdminNotifications,
  mockUserNotification,
  mockUserNotifications,
} from './mock-notifications';
import {
  UserNotificationFormattedSchema,
  UserNotificationSummarySchema,
} from './schemas';

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

describe('mockUserNotifications fixture', () => {
  it('is sorted most-recent first', () => {
    const times = mockUserNotifications.map((n) =>
      new Date(n.created).getTime()
    );
    const sorted = [...times].sort((a, b) => b - a);
    expect(times).toEqual(sorted);
  });

  it('matches the user summary schema (FormattedText summary)', () => {
    for (const n of mockUserNotifications) {
      expect(() => UserNotificationSummarySchema.parse(n)).not.toThrow();
    }
  });

  it('includes a mix of read and unread notifications', () => {
    expect(mockUserNotifications.some((n) => n.read === null)).toBe(true);
    expect(mockUserNotifications.some((n) => n.read !== null)).toBe(true);
  });
});

describe('mockUserNotification fixture', () => {
  it('matches the formatted detail schema with a FormattedText body', () => {
    expect(() =>
      UserNotificationFormattedSchema.parse(mockUserNotification)
    ).not.toThrow();
    expect(mockUserNotification.body).not.toBeNull();
  });
});

describe('filterAndPaginateUserNotifications', () => {
  it('returns all entries with no filters or limit', () => {
    const page = filterAndPaginateUserNotifications(mockUserNotifications, {});
    expect(page.entries).toEqual(mockUserNotifications);
    expect(page.totalCount).toBe(mockUserNotifications.length);
    expect(page.nextCursor).toBeNull();
  });

  it('filters to unread notifications only', () => {
    const page = filterAndPaginateUserNotifications(mockUserNotifications, {
      unread: true,
    });
    expect(page.entries.every((n) => n.read === null)).toBe(true);
    expect(page.totalCount).toBe(
      mockUserNotifications.filter((n) => n.read === null).length
    );
  });

  it('paginates with limit and an opaque cursor', () => {
    const page1 = filterAndPaginateUserNotifications(mockUserNotifications, {
      limit: 2,
    });
    expect(page1.entries).toHaveLength(2);
    expect(page1.totalCount).toBe(mockUserNotifications.length);
    expect(page1.nextCursor).not.toBeNull();

    const page2 = filterAndPaginateUserNotifications(mockUserNotifications, {
      limit: 2,
      cursor: page1.nextCursor,
    });
    expect(page2.entries[0]).toEqual(mockUserNotifications[2]);
  });

  it('combines the unread filter with pagination, keeping totalCount of the filtered set', () => {
    const unreadCount = mockUserNotifications.filter(
      (n) => n.read === null
    ).length;
    const page = filterAndPaginateUserNotifications(mockUserNotifications, {
      unread: true,
      limit: 1,
    });
    expect(page.entries).toHaveLength(1);
    expect(page.entries[0].read).toBeNull();
    expect(page.totalCount).toBe(unreadCount);
    expect(page.nextCursor).not.toBeNull();
  });
});

describe('markUserNotificationsRead', () => {
  const readDate = '2026-06-20T00:00:00+00:00';

  it('marks the given unread ids read with the provided date', () => {
    const unread = mockUserNotifications.find((n) => n.read === null);
    if (!unread) throw new Error('fixture must contain an unread notification');

    const updated = markUserNotificationsRead(
      mockUserNotifications,
      [unread.id],
      readDate
    );

    expect(updated.find((n) => n.id === unread.id)?.read).toBe(readDate);
  });

  it('leaves already-read notifications untouched (idempotent)', () => {
    const alreadyRead = mockUserNotifications.find((n) => n.read !== null);
    if (!alreadyRead)
      throw new Error('fixture must contain a read notification');

    const updated = markUserNotificationsRead(
      mockUserNotifications,
      [alreadyRead.id],
      readDate
    );

    expect(updated.find((n) => n.id === alreadyRead.id)?.read).toBe(
      alreadyRead.read
    );
  });

  it('leaves ids not in the set untouched and does not mutate the input', () => {
    const target = mockUserNotifications.find((n) => n.read === null);
    if (!target) throw new Error('fixture must contain an unread notification');

    const updated = markUserNotificationsRead(
      mockUserNotifications,
      [target.id],
      readDate
    );

    const others = mockUserNotifications.filter((n) => n.id !== target.id);
    for (const other of others) {
      expect(updated.find((n) => n.id === other.id)?.read).toBe(other.read);
    }
    // The original fixture is not mutated.
    expect(
      mockUserNotifications.find((n) => n.id === target.id)?.read
    ).toBeNull();
  });
});
