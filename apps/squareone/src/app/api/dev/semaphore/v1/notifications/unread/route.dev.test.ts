import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  getDevUserNotificationById,
  resetDevUserNotifications,
} from '@/lib/mocks/userNotificationsStore';

import { POST } from './route.dev';

const BASE = 'http://localhost:3000/semaphore/v1/notifications/unread';

function postUnread(ids: unknown): Promise<Response> {
  return POST(
    new Request(BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    })
  );
}

beforeEach(() => {
  resetDevUserNotifications();
});

afterEach(() => {
  resetDevUserNotifications();
});

describe('POST /api/dev/semaphore/v1/notifications/unread', () => {
  it('marks the given ids unread and returns 204', async () => {
    // ntf-002 and ntf-005 are seeded read.
    expect(getDevUserNotificationById('ntf-005')?.read).not.toBeNull();

    const response = await postUnread(['ntf-002', 'ntf-005']);

    expect(response.status).toBe(204);
    expect(getDevUserNotificationById('ntf-002')?.read).toBeNull();
    expect(getDevUserNotificationById('ntf-005')?.read).toBeNull();
  });

  it('is idempotent for already-unread ids', async () => {
    // ntf-001 is a seeded unread fixture.
    expect(getDevUserNotificationById('ntf-001')?.read).toBeNull();

    const response = await postUnread(['ntf-001']);

    expect(response.status).toBe(204);
    expect(getDevUserNotificationById('ntf-001')?.read).toBeNull();
  });

  it('silently ignores unknown ids', async () => {
    const response = await postUnread(['does-not-exist']);

    expect(response.status).toBe(204);
  });

  it('rejects a payload whose ids is not an array of strings', async () => {
    const response = await postUnread('not-an-array');

    expect(response.status).toBe(400);
  });

  it('rejects an invalid JSON body', async () => {
    const response = await POST(
      new Request(BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'not json',
      })
    );

    expect(response.status).toBe(400);
  });
});
