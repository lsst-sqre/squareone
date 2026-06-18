import { UserNotificationSchema } from '@lsst-sqre/semaphore-client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { resetDevNotifications } from '@/lib/mocks/notificationsStore';

import { GET } from './route.dev';

const BASE = 'http://localhost:3000/semaphore/v1/admin/notifications';

beforeEach(() => {
  resetDevNotifications();
});

afterEach(() => {
  resetDevNotifications();
});

function paramsFor(id: string): { params: Promise<{ id: string }> } {
  return { params: Promise.resolve({ id }) };
}

describe('GET /api/dev/semaphore/v1/admin/notifications/[id]', () => {
  it('returns the notification with the given id', async () => {
    const response = await GET(
      new Request(`${BASE}/ntf-003`),
      paramsFor('ntf-003')
    );

    expect(response.status).toBe(200);

    const notification = UserNotificationSchema.parse(await response.json());
    expect(notification.id).toBe('ntf-003');
    expect(notification.recipient).toBe('alice');
  });

  it('returns 404 for an unknown id', async () => {
    const response = await GET(
      new Request(`${BASE}/does-not-exist`),
      paramsFor('does-not-exist')
    );

    expect(response.status).toBe(404);
  });
});
