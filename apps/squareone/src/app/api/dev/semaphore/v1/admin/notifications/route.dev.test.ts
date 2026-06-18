import {
  type UserNotificationWithUrl,
  UserNotificationWithUrlSchema,
} from '@lsst-sqre/semaphore-client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { resetDevNotifications } from '@/lib/mocks/notificationsStore';

import { GET, POST } from './route.dev';

const BASE = 'http://localhost:3000/semaphore/v1/admin/notifications';

beforeEach(() => {
  resetDevNotifications();
});

afterEach(() => {
  resetDevNotifications();
});

async function readEntries(
  response: Response
): Promise<UserNotificationWithUrl[]> {
  const data = (await response.json()) as unknown[];
  return data.map((entry) => UserNotificationWithUrlSchema.parse(entry));
}

describe('GET /api/dev/semaphore/v1/admin/notifications', () => {
  it('returns the first page with a Link cursor and X-Total-Count', async () => {
    const response = await GET(new Request(BASE));

    expect(response.status).toBe(200);
    expect(response.headers.get('X-Total-Count')).toBe('8');

    const entries = await readEntries(response);
    expect(entries).toHaveLength(5);

    const link = response.headers.get('Link');
    expect(link).toContain('rel="next"');
    expect(link).toContain('cursor=5');
  });

  it('returns the final page without a Link header when exhausted', async () => {
    const response = await GET(new Request(`${BASE}?cursor=5`));

    const entries = await readEntries(response);
    expect(entries).toHaveLength(3);
    expect(response.headers.get('Link')).toBeNull();
    expect(response.headers.get('X-Total-Count')).toBe('8');
  });

  it('applies the recipient filter to results and total count', async () => {
    const response = await GET(new Request(`${BASE}?recipient=alice`));

    const entries = await readEntries(response);
    expect(entries.every((entry) => entry.recipient === 'alice')).toBe(true);
    expect(response.headers.get('X-Total-Count')).toBe('4');
  });
});

describe('POST /api/dev/semaphore/v1/admin/notifications', () => {
  it('appends a created notification and echoes it back', async () => {
    const response = await POST(
      new Request(BASE, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          recipient: 'erin',
          summary: 'A **new** message',
          body: 'Body text',
        }),
      })
    );

    expect(response.status).toBe(201);

    const created = UserNotificationWithUrlSchema.parse(await response.json());
    expect(created.recipient).toBe('erin');
    expect(created.summary).toBe('A **new** message');
    expect(created.body).toBe('Body text');

    // The created notification is now the most recent entry.
    const listResponse = await GET(new Request(BASE));
    expect(listResponse.headers.get('X-Total-Count')).toBe('9');
    const entries = await readEntries(listResponse);
    expect(entries[0].id).toBe(created.id);
  });

  it('rejects an invalid payload with a 400', async () => {
    const response = await POST(
      new Request(BASE, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ summary: 'missing recipient' }),
      })
    );

    expect(response.status).toBe(400);
  });
});
