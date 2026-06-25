import {
  type UserNotificationSummary,
  UserNotificationSummarySchema,
} from '@lsst-sqre/semaphore-client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  resetDevUserNotifications,
  setDevUnreadCount,
} from '@/lib/mocks/userNotificationsStore';

import { GET } from './route.dev';

const BASE = 'http://localhost:3000/semaphore/v1/notifications';

beforeEach(() => {
  resetDevUserNotifications();
});

afterEach(() => {
  resetDevUserNotifications();
});

async function readEntries(
  response: Response
): Promise<UserNotificationSummary[]> {
  const data = (await response.json()) as unknown[];
  return data.map((entry) => UserNotificationSummarySchema.parse(entry));
}

describe('GET /api/dev/semaphore/v1/notifications', () => {
  it('reports the dev-selected unread total via X-Total-Count (badge query)', async () => {
    setDevUnreadCount(3);

    const response = await GET(new Request(`${BASE}?unread=true&limit=1`));

    expect(response.status).toBe(200);
    expect(response.headers.get('X-Total-Count')).toBe('3');

    const entries = await readEntries(response);
    expect(entries).toHaveLength(1);
    expect(entries[0].read).toBeNull();
  });

  it('reports zero unread when the count is set to 0', async () => {
    setDevUnreadCount(0);

    const response = await GET(new Request(`${BASE}?unread=true&limit=1`));

    expect(response.headers.get('X-Total-Count')).toBe('0');
    const entries = await readEntries(response);
    expect(entries).toHaveLength(0);
  });

  it('omits X-Total-Count when no limit is provided (matching the real contract)', async () => {
    const response = await GET(new Request(BASE));

    expect(response.headers.get('X-Total-Count')).toBeNull();
    expect(response.headers.get('Link')).toBeNull();
  });

  it('returns the selected unread entries plus the static read fixtures unfiltered', async () => {
    setDevUnreadCount(2);

    const response = await GET(new Request(BASE));

    const entries = await readEntries(response);
    const unread = entries.filter((n) => n.read === null);
    const read = entries.filter((n) => n.read !== null);
    expect(unread).toHaveLength(2);
    expect(read.length).toBeGreaterThan(0);
  });

  it('paginates unread results with a Link cursor when a limit is set', async () => {
    setDevUnreadCount(5);

    const response = await GET(new Request(`${BASE}?unread=true&limit=2`));

    const entries = await readEntries(response);
    expect(entries).toHaveLength(2);
    expect(response.headers.get('X-Total-Count')).toBe('5');

    const link = response.headers.get('Link');
    expect(link).toContain('rel="next"');
    expect(link).toContain('cursor=2');
  });
});
