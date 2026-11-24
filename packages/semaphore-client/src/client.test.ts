import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearBroadcastsCache,
  fetchBroadcasts,
  SemaphoreError,
} from './client';
import { mockBroadcasts } from './mock-broadcasts';

describe('fetchBroadcasts', () => {
  beforeEach(() => {
    clearBroadcastsCache();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    clearBroadcastsCache();
  });

  it('fetches and parses broadcasts successfully', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify(mockBroadcasts), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const result = await fetchBroadcasts('https://example.com/semaphore');
    expect(result).toEqual(mockBroadcasts);
    expect(fetch).toHaveBeenCalledWith(
      'https://example.com/semaphore/v1/broadcasts',
      { cache: 'no-store' }
    );
  });

  it('strips trailing slashes from URL', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify([]), { status: 200 })
    );

    await fetchBroadcasts('https://example.com/semaphore///');
    expect(fetch).toHaveBeenCalledWith(
      'https://example.com/semaphore/v1/broadcasts',
      { cache: 'no-store' }
    );
  });

  it('throws SemaphoreError on HTTP error', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response('Internal Server Error', {
        status: 500,
        statusText: 'Internal Server Error',
      })
    );

    await expect(
      fetchBroadcasts('https://example.com/semaphore')
    ).rejects.toThrow(SemaphoreError);

    await expect(
      fetchBroadcasts('https://example.com/semaphore', { forceRefresh: true })
    ).rejects.toThrow(SemaphoreError);
  });

  it('parses broadcasts with a null body (DM-55599)', async () => {
    const broadcastWithNullBody = {
      active: true,
      body: null,
      category: 'notice',
      enabled: true,
      id: 'github.com/lsst-sqre/rsp_broadcast/broadcasts/110_major_change.md',
      stale: false,
      summary: {
        gfm: 'Platform unavailable 2026-07-27 (Monday)',
        html: '<p>Platform unavailable 2026-07-27 (Monday)</p>\n',
      },
    };
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify([broadcastWithNullBody]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const result = await fetchBroadcasts('https://example.com/semaphore');
    expect(result).toEqual([broadcastWithNullBody]);
  });

  it('throws on Zod validation error for invalid data', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify([{ id: 123, summary: 'not-an-object' }]), {
        status: 200,
      })
    );

    await expect(
      fetchBroadcasts('https://example.com/semaphore')
    ).rejects.toThrow();
  });

  it('throws on network error', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(
      new TypeError('fetch failed')
    );

    await expect(
      fetchBroadcasts('https://example.com/semaphore')
    ).rejects.toThrow(TypeError);
  });

  it('returns cached data on subsequent calls within TTL', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify(mockBroadcasts), { status: 200 })
    );

    const first = await fetchBroadcasts('https://example.com/semaphore');
    const second = await fetchBroadcasts('https://example.com/semaphore');

    expect(first).toEqual(second);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('bypasses cache with forceRefresh', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
      Promise.resolve(
        new Response(JSON.stringify(mockBroadcasts), { status: 200 })
      )
    );

    await fetchBroadcasts('https://example.com/semaphore');
    await fetchBroadcasts('https://example.com/semaphore', {
      forceRefresh: true,
    });

    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('passes the signal option to fetch', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify(mockBroadcasts), { status: 200 })
    );
    const { signal } = new AbortController();

    await fetchBroadcasts('https://example.com/semaphore', { signal });

    expect(fetch).toHaveBeenCalledWith(
      'https://example.com/semaphore/v1/broadcasts',
      { cache: 'no-store', signal }
    );
  });

  it('never caches the response of an aborted request', async () => {
    // The request is aborted while its body is read, but the body still
    // arrives (as with a fetch that ignores the abort): the caller has given
    // up, so the broadcasts must not be cached for later requests.
    const controller = new AbortController();
    const reason = new Error('timed out');
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce({
        ok: true,
        json: () => {
          controller.abort(reason);
          return Promise.resolve(mockBroadcasts);
        },
      } as unknown as Response)
      .mockResolvedValueOnce(
        new Response(JSON.stringify(mockBroadcasts), { status: 200 })
      );

    await expect(
      fetchBroadcasts('https://example.com/semaphore', {
        signal: controller.signal,
      })
    ).rejects.toBe(reason);
    await fetchBroadcasts('https://example.com/semaphore');

    expect(fetch).toHaveBeenCalledTimes(2);
  });
});
