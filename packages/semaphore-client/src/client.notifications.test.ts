import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createAdminNotification,
  fetchAdminNotification,
  fetchAdminNotifications,
  fetchUserNotification,
  fetchUserNotifications,
  markNotificationsRead,
  markNotificationsUnread,
  SemaphoreError,
} from './client';

const listPayload = [
  {
    id: '4561-a7513',
    created: '2026-06-12T17:10:32+00:00',
    read: null,
    sender: 'bot-quota-notifier',
    recipient: 'some-user',
    summary: 'You are approaching your disk space quota limit',
    body: 'You are using 448GiB of disk out of a quota of 500GiB.',
    url: 'https://example.com/semaphore/v1/admin/notifications/4561-a7513',
  },
];

const detailPayload = {
  id: '4561-a7513',
  created: '2026-06-12T17:10:32+00:00',
  read: null,
  sender: 'bot-quota-notifier',
  recipient: 'some-user',
  summary: 'You are approaching your disk space quota limit',
  body: 'You are using 448GiB of disk out of a quota of 500GiB.',
};

const userListPayload = [
  {
    id: '4561-a7513',
    created: '2026-06-12T17:10:32+00:00',
    read: null,
    summary: {
      gfm: 'You are approaching your disk space **quota** limit',
      html: '<p>You are approaching your disk space <strong>quota</strong> limit</p>',
    },
    url: 'https://example.com/semaphore/v1/notifications/messages/4561-a7513',
  },
];

const userDetailPayload = {
  id: '4561-a7513',
  created: '2026-06-12T17:10:32+00:00',
  read: null,
  summary: { gfm: 'Heads up', html: '<p>Heads up</p>' },
  body: {
    gfm: 'You are using **448GiB** of disk.',
    html: '<p>You are using <strong>448GiB</strong> of disk.</p>',
  },
};

describe('fetchAdminNotifications', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('parses entries and maps Link header to nextCursor and X-Total-Count to totalCount', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify(listPayload), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          Link: '<https://example.com/semaphore/v1/admin/notifications?cursor=1614985055_4234>; rel="next"',
          'X-Total-Count': '42',
        },
      })
    );

    const page = await fetchAdminNotifications('https://example.com/semaphore');

    expect(page.entries).toEqual(listPayload);
    expect(page.nextCursor).toBe('1614985055_4234');
    expect(page.totalCount).toBe(42);
  });

  it('returns null nextCursor and totalCount when headers are absent', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify(listPayload), { status: 200 })
    );

    const page = await fetchAdminNotifications('https://example.com/semaphore');

    expect(page.nextCursor).toBeNull();
    expect(page.totalCount).toBeNull();
  });

  it('applies recipient, sender, since, until, limit, and cursor query params', async () => {
    const mockFetch = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify([]), { status: 200 }));

    await fetchAdminNotifications(
      'https://example.com/semaphore',
      {
        recipient: 'some-user',
        sender: 'bot-quota',
        since: new Date('2026-01-01T00:00:00Z'),
        until: new Date('2026-02-01T00:00:00Z'),
        limit: 25,
      },
      'p123_4'
    );

    const calledUrl = new URL(mockFetch.mock.calls[0][0] as string);
    expect(calledUrl.pathname).toBe('/semaphore/v1/admin/notifications');
    expect(calledUrl.searchParams.get('recipient')).toBe('some-user');
    expect(calledUrl.searchParams.get('sender')).toBe('bot-quota');
    expect(calledUrl.searchParams.get('since')).toBe(
      '2026-01-01T00:00:00.000Z'
    );
    expect(calledUrl.searchParams.get('until')).toBe(
      '2026-02-01T00:00:00.000Z'
    );
    expect(calledUrl.searchParams.get('limit')).toBe('25');
    expect(calledUrl.searchParams.get('cursor')).toBe('p123_4');
  });

  it('omits query params that are not provided', async () => {
    const mockFetch = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify([]), { status: 200 }));

    await fetchAdminNotifications('https://example.com/semaphore');

    const calledUrl = mockFetch.mock.calls[0][0] as string;
    expect(calledUrl).toBe(
      'https://example.com/semaphore/v1/admin/notifications'
    );
  });

  it('throws SemaphoreError on HTTP error', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response('Forbidden', { status: 403, statusText: 'Forbidden' })
    );

    await expect(
      fetchAdminNotifications('https://example.com/semaphore')
    ).rejects.toThrow(SemaphoreError);
  });
});

describe('fetchAdminNotification', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches a single notification by id', async () => {
    const mockFetch = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(JSON.stringify(detailPayload), { status: 200 })
      );

    const result = await fetchAdminNotification(
      'https://example.com/semaphore',
      '4561-a7513'
    );

    expect(result).toEqual(detailPayload);
    expect(mockFetch.mock.calls[0][0]).toBe(
      'https://example.com/semaphore/v1/admin/notifications/4561-a7513'
    );
  });

  it('throws SemaphoreError when the notification is not found', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response('Not Found', { status: 404, statusText: 'Not Found' })
    );

    await expect(
      fetchAdminNotification('https://example.com/semaphore', 'missing')
    ).rejects.toThrow(SemaphoreError);
  });
});

describe('createAdminNotification', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('POSTs the payload with credentials, the CSRF header, and a JSON body', async () => {
    const mockFetch = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({ ...detailPayload, url: listPayload[0].url }),
        {
          status: 200,
        }
      )
    );

    await createAdminNotification(
      'https://example.com/semaphore',
      {
        recipient: 'some-user',
        summary: 'You are approaching your disk space quota limit',
        body: 'You are using 448GiB of disk out of a quota of 500GiB.',
      },
      'csrf-token-abc'
    );

    const [calledUrl, init] = mockFetch.mock.calls[0];
    expect(calledUrl).toBe(
      'https://example.com/semaphore/v1/admin/notifications'
    );
    expect(init?.method).toBe('POST');
    expect(init?.credentials).toBe('include');

    const headers = init?.headers as Record<string, string>;
    expect(headers['x-csrf-token']).toBe('csrf-token-abc');
    expect(headers['Content-Type']).toBe('application/json');

    expect(JSON.parse(init?.body as string)).toEqual({
      recipient: 'some-user',
      summary: 'You are approaching your disk space quota limit',
      body: 'You are using 448GiB of disk out of a quota of 500GiB.',
    });
  });

  it('omits the body field when it is not provided', async () => {
    const mockFetch = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          ...detailPayload,
          body: null,
          url: listPayload[0].url,
        }),
        { status: 200 }
      )
    );

    await createAdminNotification(
      'https://example.com/semaphore',
      { recipient: 'some-user', summary: 'Heads up' },
      'csrf-token-abc'
    );

    const body = JSON.parse(mockFetch.mock.calls[0][1]?.body as string);
    expect(body).toEqual({ recipient: 'some-user', summary: 'Heads up' });
    expect(body).not.toHaveProperty('body');
  });

  it('strips stray keys from the payload before sending', async () => {
    const mockFetch = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({ ...detailPayload, url: listPayload[0].url }),
        {
          status: 200,
        }
      )
    );

    await createAdminNotification(
      'https://example.com/semaphore',
      {
        recipient: 'some-user',
        summary: 'Heads up',
        // @ts-expect-error - exercising runtime stripping of unknown keys
        extra: 'should not be sent',
      },
      'csrf-token-abc'
    );

    const body = JSON.parse(mockFetch.mock.calls[0][1]?.body as string);
    expect(body).toEqual({ recipient: 'some-user', summary: 'Heads up' });
    expect(body).not.toHaveProperty('extra');
  });

  it('returns the created notification parsed from the response', async () => {
    const created = {
      ...detailPayload,
      url: 'https://example.com/semaphore/v1/admin/notifications/4561-a7513',
    };
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify(created), { status: 200 })
    );

    const result = await createAdminNotification(
      'https://example.com/semaphore',
      { recipient: 'some-user', summary: 'Heads up' },
      'csrf-token-abc'
    );

    expect(result).toEqual(created);
  });

  it('throws SemaphoreError on HTTP error', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response('Forbidden', { status: 403, statusText: 'Forbidden' })
    );

    await expect(
      createAdminNotification(
        'https://example.com/semaphore',
        { recipient: 'some-user', summary: 'Heads up' },
        'csrf-token-abc'
      )
    ).rejects.toThrow(SemaphoreError);
  });
});

describe('fetchUserNotifications', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('parses entries and maps Link header to nextCursor and X-Total-Count to totalCount', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify(userListPayload), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          Link: '<https://example.com/semaphore/v1/notifications/messages?cursor=1614985055_4234>; rel="next"',
          'X-Total-Count': '7',
        },
      })
    );

    const page = await fetchUserNotifications('https://example.com/semaphore');

    expect(page.entries).toEqual(userListPayload);
    expect(page.nextCursor).toBe('1614985055_4234');
    expect(page.totalCount).toBe(7);
  });

  it('returns null nextCursor and totalCount when headers are absent', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify(userListPayload), { status: 200 })
    );

    const page = await fetchUserNotifications('https://example.com/semaphore');

    expect(page.nextCursor).toBeNull();
    expect(page.totalCount).toBeNull();
  });

  it('applies unread, limit, and cursor query params', async () => {
    const mockFetch = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify([]), { status: 200 }));

    await fetchUserNotifications('https://example.com/semaphore', {
      unread: true,
      limit: 25,
      cursor: 'p123_4',
    });

    const calledUrl = new URL(mockFetch.mock.calls[0][0] as string);
    expect(calledUrl.pathname).toBe('/semaphore/v1/notifications/messages');
    expect(calledUrl.searchParams.get('unread')).toBe('true');
    expect(calledUrl.searchParams.get('limit')).toBe('25');
    expect(calledUrl.searchParams.get('cursor')).toBe('p123_4');
  });

  it('omits the unread param when it is falsy', async () => {
    const mockFetch = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify([]), { status: 200 }));

    await fetchUserNotifications('https://example.com/semaphore', {
      unread: false,
    });

    const calledUrl = mockFetch.mock.calls[0][0] as string;
    expect(calledUrl).toBe(
      'https://example.com/semaphore/v1/notifications/messages'
    );
  });

  it('sends credentials with the request', async () => {
    const mockFetch = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify([]), { status: 200 }));

    await fetchUserNotifications('https://example.com/semaphore');

    expect(mockFetch.mock.calls[0][1]?.credentials).toBe('include');
  });

  it('throws SemaphoreError on HTTP error', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response('Forbidden', { status: 403, statusText: 'Forbidden' })
    );

    await expect(
      fetchUserNotifications('https://example.com/semaphore')
    ).rejects.toThrow(SemaphoreError);
  });
});

describe('fetchUserNotification', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches and parses a single formatted notification by id', async () => {
    const mockFetch = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(JSON.stringify(userDetailPayload), { status: 200 })
      );

    const result = await fetchUserNotification(
      'https://example.com/semaphore',
      '4561-a7513'
    );

    expect(result).toEqual(userDetailPayload);
    expect(mockFetch.mock.calls[0][0]).toBe(
      'https://example.com/semaphore/v1/notifications/messages/4561-a7513'
    );
    expect(mockFetch.mock.calls[0][1]?.credentials).toBe('include');
  });

  it('throws SemaphoreError when the notification is not found', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response('Not Found', { status: 404, statusText: 'Not Found' })
    );

    await expect(
      fetchUserNotification('https://example.com/semaphore', 'missing')
    ).rejects.toThrow(SemaphoreError);
  });
});

describe('markNotificationsRead', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('POSTs { ids } with credentials and the CSRF header, treating 204 as success', async () => {
    const mockFetch = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(null, { status: 204 }));

    await expect(
      markNotificationsRead(
        'https://example.com/semaphore',
        ['n1', 'n2'],
        'csrf-token-abc'
      )
    ).resolves.toBeUndefined();

    const [calledUrl, init] = mockFetch.mock.calls[0];
    expect(calledUrl).toBe(
      'https://example.com/semaphore/v1/notifications/read'
    );
    expect(init?.method).toBe('POST');
    expect(init?.credentials).toBe('include');

    const headers = init?.headers as Record<string, string>;
    expect(headers['x-csrf-token']).toBe('csrf-token-abc');
    expect(headers['Content-Type']).toBe('application/json');

    expect(JSON.parse(init?.body as string)).toEqual({ ids: ['n1', 'n2'] });
  });

  it('throws SemaphoreError on HTTP error', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response('Forbidden', { status: 403, statusText: 'Forbidden' })
    );

    await expect(
      markNotificationsRead(
        'https://example.com/semaphore',
        ['n1'],
        'csrf-token-abc'
      )
    ).rejects.toThrow(SemaphoreError);
  });
});

describe('markNotificationsUnread', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('POSTs { ids } to the unread path with credentials and the CSRF header, treating 204 as success', async () => {
    const mockFetch = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(null, { status: 204 }));

    await expect(
      markNotificationsUnread(
        'https://example.com/semaphore',
        ['n1', 'n2'],
        'csrf-token-abc'
      )
    ).resolves.toBeUndefined();

    const [calledUrl, init] = mockFetch.mock.calls[0];
    expect(calledUrl).toBe(
      'https://example.com/semaphore/v1/notifications/unread'
    );
    expect(init?.method).toBe('POST');
    expect(init?.credentials).toBe('include');

    const headers = init?.headers as Record<string, string>;
    expect(headers['x-csrf-token']).toBe('csrf-token-abc');
    expect(headers['Content-Type']).toBe('application/json');

    expect(JSON.parse(init?.body as string)).toEqual({ ids: ['n1', 'n2'] });
  });

  it('throws SemaphoreError on HTTP error', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response('Forbidden', { status: 403, statusText: 'Forbidden' })
    );

    await expect(
      markNotificationsUnread(
        'https://example.com/semaphore',
        ['n1'],
        'csrf-token-abc'
      )
    ).rejects.toThrow(SemaphoreError);
  });
});
