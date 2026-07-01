import {
  type UserNotificationFormatted,
  UserNotificationFormattedSchema,
} from '@lsst-sqre/semaphore-client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  getDevUserNotifications,
  resetDevUserNotifications,
} from '@/lib/mocks/userNotificationsStore';

import { GET } from './route.dev';

const BASE = 'http://localhost:3000/semaphore/v1/notifications';

beforeEach(() => {
  resetDevUserNotifications();
});

afterEach(() => {
  resetDevUserNotifications();
});

function getDetail(id: string): Promise<Response> {
  return GET(new Request(`${BASE}/${id}`), {
    params: Promise.resolve({ id }),
  });
}

async function readDetail(
  response: Response
): Promise<UserNotificationFormatted> {
  const data = await response.json();
  return UserNotificationFormattedSchema.parse(data);
}

describe('GET /api/dev/semaphore/v1/notifications/[id]', () => {
  it('returns the formatted notification with summary and body as FormattedText', async () => {
    const response = await getDetail('ntf-001');

    expect(response.status).toBe(200);

    const notification = await readDetail(response);
    expect(notification.id).toBe('ntf-001');
    // summary/body carry the Markdown through the `gfm` field (user shape).
    expect(notification.summary.gfm).toContain('**quota**');
    // The dev body is synthesized from the summary plus a development note,
    // since the shared user fixtures are summary-only.
    expect(notification.body?.gfm).toContain('**quota**');
    expect(notification.body?.gfm).toContain('Development mock body');
    // sender/recipient are intentionally absent from the user surface.
    expect(notification).not.toHaveProperty('sender');
    expect(notification).not.toHaveProperty('recipient');
  });

  it('serves a read notification with its read timestamp', async () => {
    // ntf-002 is a seeded read fixture.
    const response = await getDetail('ntf-002');

    expect(response.status).toBe(200);
    const notification = await readDetail(response);
    expect(notification.read).not.toBeNull();
  });

  it('does not mark the notification read', async () => {
    const response = await getDetail('ntf-001');

    const notification = await readDetail(response);
    // The fetched record is still unread...
    expect(notification.read).toBeNull();
    // ...and the underlying store was not mutated.
    const stored = getDevUserNotifications().find((n) => n.id === 'ntf-001');
    expect(stored?.read).toBeNull();
  });

  it('returns 404 for an unknown id', async () => {
    const response = await getDetail('does-not-exist');

    expect(response.status).toBe(404);
  });
});
