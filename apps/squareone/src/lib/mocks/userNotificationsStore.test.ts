import { mockUserNotifications } from '@lsst-sqre/semaphore-client';
import { afterEach, describe, expect, it } from 'vitest';

import {
  getDevUserNotificationById,
  getDevUserNotifications,
  markDevUserNotificationsRead,
  markDevUserNotificationsUnread,
  resetDevUserNotifications,
} from './userNotificationsStore';

afterEach(() => {
  resetDevUserNotifications();
});

describe('userNotificationsStore', () => {
  it('returns the seeded user notifications, most-recent first', () => {
    const notifications = getDevUserNotifications();

    // Six seeded summaries: four unread and two read.
    expect(notifications).toHaveLength(6);
    expect(notifications.filter((n) => n.read === null)).toHaveLength(4);
    expect(notifications.filter((n) => n.read !== null)).toHaveLength(2);
    expect(notifications[0].id).toBe(mockUserNotifications[0].id);
  });

  it('isolates the store from the shared fixtures', () => {
    // The store is a deep clone, so mutating its records never leaks back into
    // the shared `mockUserNotifications` fixtures.
    const notifications = getDevUserNotifications();
    notifications[0].read = '2026-01-01T00:00:00+00:00';

    expect(mockUserNotifications[0].read).toBeNull();
  });

  describe('getDevUserNotificationById', () => {
    it('returns the detail shape with a synthesized body', () => {
      const detail = getDevUserNotificationById('ntf-001');

      expect(detail?.id).toBe('ntf-001');
      expect(detail?.body?.gfm).toContain('Development mock body');
    });

    it('returns undefined for an unknown id', () => {
      expect(getDevUserNotificationById('does-not-exist')).toBeUndefined();
    });
  });

  describe('markDevUserNotificationsRead', () => {
    it('marks a seeded unread notification read', () => {
      expect(getDevUserNotificationById('ntf-001')?.read).toBeNull();

      markDevUserNotificationsRead(['ntf-001']);

      expect(getDevUserNotificationById('ntf-001')?.read).not.toBeNull();
    });

    it('leaves an already-read notification untouched (idempotent)', () => {
      const before = getDevUserNotificationById('ntf-005')?.read;
      expect(before).not.toBeNull();

      markDevUserNotificationsRead(['ntf-005']);

      // The original read timestamp is preserved, not overwritten.
      expect(getDevUserNotificationById('ntf-005')?.read).toBe(before);
    });

    it('ignores unknown ids without throwing', () => {
      expect(() =>
        markDevUserNotificationsRead(['does-not-exist'])
      ).not.toThrow();
    });

    it('is undone by resetDevUserNotifications', () => {
      markDevUserNotificationsRead(['ntf-001']);
      expect(getDevUserNotificationById('ntf-001')?.read).not.toBeNull();

      resetDevUserNotifications();

      expect(getDevUserNotificationById('ntf-001')?.read).toBeNull();
    });
  });

  describe('markDevUserNotificationsUnread', () => {
    it('marks a seeded read notification unread', () => {
      // ntf-005 is a seeded read fixture.
      expect(getDevUserNotificationById('ntf-005')?.read).not.toBeNull();

      markDevUserNotificationsUnread(['ntf-005']);

      expect(getDevUserNotificationById('ntf-005')?.read).toBeNull();
    });

    it('leaves an already-unread notification untouched (idempotent)', () => {
      // ntf-001 is a seeded unread fixture.
      expect(getDevUserNotificationById('ntf-001')?.read).toBeNull();

      markDevUserNotificationsUnread(['ntf-001']);

      expect(getDevUserNotificationById('ntf-001')?.read).toBeNull();
    });

    it('ignores unknown ids without throwing', () => {
      expect(() =>
        markDevUserNotificationsUnread(['does-not-exist'])
      ).not.toThrow();
    });

    it('is undone by resetDevUserNotifications', () => {
      markDevUserNotificationsUnread(['ntf-005']);
      expect(getDevUserNotificationById('ntf-005')?.read).toBeNull();

      resetDevUserNotifications();

      expect(getDevUserNotificationById('ntf-005')?.read).not.toBeNull();
    });
  });
});
