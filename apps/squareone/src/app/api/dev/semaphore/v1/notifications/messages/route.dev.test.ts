import {
  type UserNotificationSummary,
  UserNotificationSummarySchema,
} from '@lsst-sqre/semaphore-client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { resetDevUserNotifications } from '@/lib/mocks/userNotificationsStore';

import { GET } from './route.dev';

const BASE = 'http://localhost:3000/semaphore/v1/notifications/messages';

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

describe('GET /api/dev/semaphore/v1/notifications/messages', () => {
  it("returns the user's notifications as FormattedText summaries", async () => {
    const response = await GET(new Request(BASE));

    expect(response.status).toBe(200);

    const entries = await readEntries(response);
    // The seeded user fixtures: six summaries, four unread and two read.
    expect(entries).toHaveLength(6);
    expect(entries.filter((n) => n.read === null)).toHaveLength(4);
    expect(entries.filter((n) => n.read !== null)).toHaveLength(2);

    // Summaries are user-shaped FormattedText ({ gfm, html }); sender/recipient
    // are intentionally absent from the user surface.
    expect(entries[0].summary.gfm).toContain('**quota**');
    expect(entries[0]).not.toHaveProperty('recipient');
    expect(entries[0]).not.toHaveProperty('sender');
  });

  it('reports the unread total via X-Total-Count (the badge query)', async () => {
    const response = await GET(new Request(`${BASE}?unread=true&limit=1`));

    expect(response.status).toBe(200);
    // The header badge reads the unread total from this count, which is derived
    // from the persistent store rather than a dev-set number.
    expect(response.headers.get('X-Total-Count')).toBe('4');

    const entries = await readEntries(response);
    expect(entries).toHaveLength(1);
    expect(entries[0].read).toBeNull();
  });

  it('omits X-Total-Count when no limit is provided (matching the real contract)', async () => {
    const response = await GET(new Request(BASE));

    expect(response.headers.get('X-Total-Count')).toBeNull();
    expect(response.headers.get('Link')).toBeNull();
  });

  it('filters to unread notifications when unread=true', async () => {
    const response = await GET(new Request(`${BASE}?unread=true`));

    const entries = await readEntries(response);
    expect(entries).toHaveLength(4);
    expect(entries.every((entry) => entry.read === null)).toBe(true);
  });

  it('honors limit, conveying the next cursor through a Link header', async () => {
    const response = await GET(new Request(`${BASE}?limit=2`));

    const entries = await readEntries(response);
    expect(entries).toHaveLength(2);
    expect(response.headers.get('X-Total-Count')).toBe('6');

    const link = response.headers.get('Link');
    expect(link).toContain('rel="next"');
    expect(link).toContain('cursor=2');
  });

  it('honors the cursor and omits the Link header once exhausted', async () => {
    const response = await GET(new Request(`${BASE}?cursor=4&limit=2`));

    const entries = await readEntries(response);
    expect(entries).toHaveLength(2);
    expect(response.headers.get('Link')).toBeNull();
    expect(response.headers.get('X-Total-Count')).toBe('6');
  });
});
