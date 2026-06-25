import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { resetDevUserNotifications } from '@/lib/mocks/userNotificationsStore';

import { GET, POST } from './route.dev';

const BASE = 'http://localhost:3000/api/dev/notifications-count';

beforeEach(() => {
  resetDevUserNotifications();
});

afterEach(() => {
  resetDevUserNotifications();
});

function postCount(body: unknown): Promise<Response> {
  return POST(
    new Request(BASE, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    })
  );
}

describe('GET /api/dev/notifications-count', () => {
  it('returns the current count', async () => {
    const response = await GET();
    const data = (await response.json()) as { count: number };
    expect(typeof data.count).toBe('number');
  });
});

describe('POST /api/dev/notifications-count', () => {
  it('sets the count and echoes it back', async () => {
    const response = await postCount({ count: 7 });
    expect(response.status).toBe(200);
    expect(((await response.json()) as { count: number }).count).toBe(7);

    const after = (await (await GET()).json()) as { count: number };
    expect(after.count).toBe(7);
  });

  it('clamps a fractional count to an integer', async () => {
    const response = await postCount({ count: 3.9 });
    expect(((await response.json()) as { count: number }).count).toBe(3);
  });

  it('rejects a negative count with a 400', async () => {
    const response = await postCount({ count: -1 });
    expect(response.status).toBe(400);
  });

  it('rejects a non-numeric count with a 400', async () => {
    const response = await postCount({ count: 'lots' });
    expect(response.status).toBe(400);
  });
});
