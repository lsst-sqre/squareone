import { mockAdminNotifications } from '@lsst-sqre/semaphore-client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  addDevNotification,
  getDevNotificationById,
  getDevNotifications,
  resetDevNotifications,
} from './notificationsStore';

beforeEach(() => {
  resetDevNotifications();
});

afterEach(() => {
  resetDevNotifications();
});

describe('notificationsStore', () => {
  it('seeds from the shared mock fixtures', () => {
    const notifications = getDevNotifications();

    expect(notifications).toHaveLength(mockAdminNotifications.length);
    expect(notifications[0].id).toBe(mockAdminNotifications[0].id);
  });

  it('does not mutate the shared fixtures when a notification is added', () => {
    addDevNotification({ recipient: 'erin', summary: 'Hello' }, 'vera');

    expect(mockAdminNotifications).toHaveLength(8);
  });

  it('looks up a notification by id', () => {
    const found = getDevNotificationById('ntf-003');

    expect(found?.recipient).toBe('alice');
  });

  it('returns undefined for an unknown id', () => {
    expect(getDevNotificationById('does-not-exist')).toBeUndefined();
  });

  it('prepends a created notification as the most recent entry', () => {
    const created = addDevNotification(
      { recipient: 'erin', summary: 'A **new** message', body: 'Body text' },
      'vera'
    );

    expect(created.recipient).toBe('erin');
    expect(created.summary).toBe('A **new** message');
    expect(created.body).toBe('Body text');
    expect(created.sender).toBe('vera');
    expect(created.read).toBeNull();
    expect(created.id).toBeTruthy();
    expect(created.url).toContain(created.id);

    const notifications = getDevNotifications();
    expect(notifications).toHaveLength(mockAdminNotifications.length + 1);
    expect(notifications[0].id).toBe(created.id);
    expect(getDevNotificationById(created.id)?.summary).toBe(
      'A **new** message'
    );
  });

  it('stores a null body when none is provided', () => {
    const created = addDevNotification(
      { recipient: 'erin', summary: 'No body' },
      'vera'
    );

    expect(created.body).toBeNull();
  });

  it('generates a distinct id for each created notification', () => {
    const first = addDevNotification({ recipient: 'a', summary: 's' }, 'vera');
    const second = addDevNotification({ recipient: 'b', summary: 's' }, 'vera');

    expect(first.id).not.toBe(second.id);
  });
});
