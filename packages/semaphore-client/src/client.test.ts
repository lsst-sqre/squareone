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
});
