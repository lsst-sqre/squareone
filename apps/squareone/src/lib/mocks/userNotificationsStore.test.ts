import { mockUserNotifications } from '@lsst-sqre/semaphore-client';
import { afterEach, describe, expect, it } from 'vitest';

import {
  getDevUserNotifications,
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
});
