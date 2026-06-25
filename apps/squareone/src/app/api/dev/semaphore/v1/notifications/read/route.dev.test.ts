import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  getDevUserNotificationById,
  resetDevUserNotifications,
} from '@/lib/mocks/userNotificationsStore';

import { POST } from './route.dev';

const BASE = 'http://localhost:3000/semaphore/v1/notifications/read';

function postRead(ids: unknown): Promise<Response> {
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

describe('POST /api/dev/semaphore/v1/notifications/read', () => {
  it('marks the given ids read and returns 204', async () => {
    // ntf-001 and ntf-003 are seeded unread.
    expect(getDevUserNotificationById('ntf-001')?.read).toBeNull();

    const response = await postRead(['ntf-001', 'ntf-003']);

    expect(response.status).toBe(204);
    expect(getDevUserNotificationById('ntf-001')?.read).not.toBeNull();
    expect(getDevUserNotificationById('ntf-003')?.read).not.toBeNull();
  });

  it('is idempotent for already-read ids', async () => {
    // ntf-005 is a seeded read fixture.
    const before = getDevUserNotificationById('ntf-005')?.read;
    expect(before).not.toBeNull();

    const response = await postRead(['ntf-005']);

    expect(response.status).toBe(204);
    expect(getDevUserNotificationById('ntf-005')?.read).toBe(before);
  });

  it('silently ignores unknown ids', async () => {
    const response = await postRead(['does-not-exist']);

    expect(response.status).toBe(204);
  });

  it('rejects a payload whose ids is not an array of strings', async () => {
    const response = await postRead('not-an-array');

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
