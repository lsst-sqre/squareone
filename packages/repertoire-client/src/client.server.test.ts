// @vitest-environment node
//
// Server-side behaviour of `fetchServiceDiscovery`: the timeout, the stale
// fallback and the fail-fast window apply only where there is no `window`
// global, so these tests run in the Node environment rather than jsdom.

import { QueryTimeoutError } from '@lsst-sqre/api-client-core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearDiscoveryCache,
  DEFAULT_DISCOVERY_TIMEOUT_MS,
  DISCOVERY_FAIL_FAST_WINDOW_MS,
  fetchServiceDiscovery,
} from './client';
import { mockDiscovery } from './mock-discovery';

const URL = 'https://example.com/repertoire';

/** A `fetch` mock whose requests never settle, as with a hung Repertoire. */
function hungFetch() {
  return vi.fn(
    (_url: string, _init?: RequestInit) => new Promise<Response>(() => {})
  );
}

/** A `fetch` mock that answers every request with an OK JSON body. */
function okFetch(body: unknown) {
  return vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    statusText: 'OK',
    json: () => Promise.resolve(body),
  });
}

/** A `fetch` mock that answers every request with an HTTP error. */
function statusFetch(status: number) {
  return vi.fn().mockResolvedValue({
    ok: false,
    status,
    statusText: 'Error',
    json: () => Promise.resolve({}),
  });
}

/** A logger whose methods are mocks. */
function mockLogger() {
  return { debug: vi.fn(), warn: vi.fn(), error: vi.fn() };
}

/**
 * Whether a promise settles without any (fake) time passing: only pending
 * microtasks are run, never a timer.
 */
async function isSettled(promise: Promise<unknown>): Promise<boolean> {
  let settled = false;
  promise.then(
    () => {
      settled = true;
    },
    () => {
      settled = true;
    }
  );
  for (let tick = 0; tick < 20; tick++) {
    await Promise.resolve();
  }
  return settled;
}

describe('fetchServiceDiscovery (server-side)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    clearDiscoveryCache();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    clearDiscoveryCache();
  });

  describe('timeout', () => {
    it('rejects with a QueryTimeoutError and aborts the request after the default timeout', async () => {
      const mockFetch = hungFetch();
      vi.stubGlobal('fetch', mockFetch);

      const result = fetchServiceDiscovery(URL);
      result.catch(() => {});
      await vi.advanceTimersByTimeAsync(DEFAULT_DISCOVERY_TIMEOUT_MS - 1);
      expect(await isSettled(result)).toBe(false);

      await vi.advanceTimersByTimeAsync(1);
      await expect(result).rejects.toBeInstanceOf(QueryTimeoutError);
      await expect(result).rejects.toMatchObject({ name: 'QueryTimeoutError' });
      expect(DEFAULT_DISCOVERY_TIMEOUT_MS).toBe(5000);
      expect(mockFetch.mock.calls[0][1]?.signal?.aborted).toBe(true);
    });

    it('uses the timeoutMs option instead of the default', async () => {
      vi.stubGlobal('fetch', hungFetch());

      const result = fetchServiceDiscovery(URL, { timeoutMs: 1000 });
      result.catch(() => {});
      await vi.advanceTimersByTimeAsync(1000);

      await expect(result).rejects.toMatchObject({
        name: 'QueryTimeoutError',
        timeoutMs: 1000,
      });
    });

    it("aborts the request when the caller's signal aborts", async () => {
      const mockFetch = hungFetch();
      vi.stubGlobal('fetch', mockFetch);
      const controller = new AbortController();
      const reason = new Error('caller gave up');

      const result = fetchServiceDiscovery(URL, { signal: controller.signal });
      result.catch(() => {});
      controller.abort(reason);

      await expect(result).rejects.toBe(reason);
      expect(mockFetch.mock.calls[0][1]?.signal?.aborted).toBe(true);
    });

    it('never caches a response that arrives after the request was aborted', async () => {
      // The request is aborted while its body is read, but the body still
      // arrives (as with a fetch that ignores the abort).
      const controller = new AbortController();
      const mockFetch = vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => {
            controller.abort(new Error('caller gave up'));
            return Promise.resolve(mockDiscovery);
          },
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockDiscovery),
        });
      vi.stubGlobal('fetch', mockFetch);

      await expect(
        fetchServiceDiscovery(URL, { signal: controller.signal })
      ).rejects.toThrow('caller gave up');
      await fetchServiceDiscovery(URL);

      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('stale fallback', () => {
    const CACHE_TTL_MS = 5 * 60 * 1000;

    /** Cache `mockDiscovery` for URL, then let it expire. */
    async function givenExpiredDocument() {
      vi.stubGlobal('fetch', okFetch(mockDiscovery));
      await fetchServiceDiscovery(URL);
      await vi.advanceTimersByTimeAsync(CACHE_TTL_MS);
    }

    const failures: [string, () => ReturnType<typeof vi.fn>][] = [
      ['a timeout', hungFetch],
      [
        'a network error',
        () => vi.fn().mockRejectedValue(new TypeError('fetch failed')),
      ],
      ['a 5xx', () => statusFetch(503)],
      ['a schema error', () => okFetch({ applications: ['portal'] })],
    ];

    it.each(failures)(
      'returns the expired document and logs one warning when a refresh fails with %s',
      async (_label, makeFetch) => {
        await givenExpiredDocument();
        const mockFetch = makeFetch();
        vi.stubGlobal('fetch', mockFetch);
        const logger = mockLogger();

        const result = fetchServiceDiscovery(URL, { logger });
        result.catch(() => {});
        await vi.advanceTimersByTimeAsync(DEFAULT_DISCOVERY_TIMEOUT_MS);

        await expect(result).resolves.toEqual(mockDiscovery);
        expect(mockFetch).toHaveBeenCalledTimes(1);
        expect(logger.warn).toHaveBeenCalledTimes(1);
        expect(logger.warn).toHaveBeenCalledWith(
          expect.objectContaining({ err: expect.anything() }),
          expect.any(String)
        );
      }
    );

    it('does not fall back to a document from another Repertoire URL', async () => {
      await givenExpiredDocument();
      vi.stubGlobal('fetch', statusFetch(503));

      await expect(
        fetchServiceDiscovery('https://other.example.com/repertoire')
      ).rejects.toMatchObject({ statusCode: 503 });
    });

    it('does not fall back for a forced refresh', async () => {
      await givenExpiredDocument();
      vi.stubGlobal('fetch', statusFetch(503));

      await expect(
        fetchServiceDiscovery(URL, { forceRefresh: true })
      ).rejects.toMatchObject({ statusCode: 503 });
    });

    it('serves a document that is still fresh without a refresh', async () => {
      vi.stubGlobal('fetch', okFetch(mockDiscovery));
      await fetchServiceDiscovery(URL);
      const mockFetch = statusFetch(503);
      vi.stubGlobal('fetch', mockFetch);

      await expect(fetchServiceDiscovery(URL)).resolves.toEqual(mockDiscovery);
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe('fail-fast window', () => {
    /** Time a request out, with no document to fall back to. */
    async function givenTimedOutRequest(): Promise<unknown> {
      vi.stubGlobal('fetch', hungFetch());
      const result = fetchServiceDiscovery(URL);
      result.catch(() => {});
      await vi.advanceTimersByTimeAsync(DEFAULT_DISCOVERY_TIMEOUT_MS);
      return result.catch((err: unknown) => err);
    }

    it('rejects at once with the timeout error, without a request, inside the window', async () => {
      const timeoutError = await givenTimedOutRequest();
      const mockFetch = okFetch(mockDiscovery);
      vi.stubGlobal('fetch', mockFetch);

      const result = fetchServiceDiscovery(URL);
      result.catch(() => {});

      expect(await isSettled(result)).toBe(true);
      await expect(result).rejects.toBe(timeoutError);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('makes a request again once the window has passed', async () => {
      await givenTimedOutRequest();
      const mockFetch = okFetch(mockDiscovery);
      vi.stubGlobal('fetch', mockFetch);

      await vi.advanceTimersByTimeAsync(DISCOVERY_FAIL_FAST_WINDOW_MS);

      await expect(fetchServiceDiscovery(URL)).resolves.toEqual(mockDiscovery);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(DISCOVERY_FAIL_FAST_WINDOW_MS).toBe(5000);
    });

    it('is not opened by a fast network failure', async () => {
      // A connection reset fails fast, so the single retry in
      // reportingQueryFn must still make a real second request.
      const mockFetch = vi
        .fn()
        .mockRejectedValueOnce(new TypeError('fetch failed'))
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockDiscovery),
        });
      vi.stubGlobal('fetch', mockFetch);

      await expect(fetchServiceDiscovery(URL)).rejects.toThrow('fetch failed');
      await expect(fetchServiceDiscovery(URL)).resolves.toEqual(mockDiscovery);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('lets a forced refresh make a request, and ends the window when it succeeds', async () => {
      await givenTimedOutRequest();
      const mockFetch = okFetch(mockDiscovery);
      vi.stubGlobal('fetch', mockFetch);

      await expect(
        fetchServiceDiscovery(URL, { forceRefresh: true })
      ).resolves.toEqual(mockDiscovery);
      // Its document now answers later calls instead of the timeout.
      await expect(fetchServiceDiscovery(URL)).resolves.toEqual(mockDiscovery);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('is ended by a successful request for the URL', async () => {
      // A request for another URL then replaces the cached document, so only
      // the window decides whether a later call for URL makes a request.
      await givenTimedOutRequest();
      vi.stubGlobal('fetch', okFetch(mockDiscovery));
      await fetchServiceDiscovery(URL, { forceRefresh: true });
      await fetchServiceDiscovery('https://other.example.com/repertoire');
      const mockFetch = okFetch(mockDiscovery);
      vi.stubGlobal('fetch', mockFetch);

      await expect(fetchServiceDiscovery(URL)).resolves.toEqual(mockDiscovery);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('serves the last good document at once, without a request, inside the window', async () => {
      vi.stubGlobal('fetch', okFetch(mockDiscovery));
      await fetchServiceDiscovery(URL);
      await vi.advanceTimersByTimeAsync(5 * 60 * 1000);
      await givenTimedOutRequest();
      const mockFetch = okFetch(mockDiscovery);
      vi.stubGlobal('fetch', mockFetch);
      const logger = mockLogger();

      const result = fetchServiceDiscovery(URL, { logger });

      expect(await isSettled(result)).toBe(true);
      await expect(result).resolves.toEqual(mockDiscovery);
      expect(mockFetch).not.toHaveBeenCalled();
      expect(logger.warn).toHaveBeenCalledTimes(1);
    });

    it("is opened when the caller's signal aborts with a QueryTimeoutError", async () => {
      // reportingQueryFn aborts its attempt's signal with a QueryTimeoutError
      // when its own timeout runs out first.
      vi.stubGlobal('fetch', hungFetch());
      const controller = new AbortController();
      const timeoutError = new QueryTimeoutError(5000);
      const first = fetchServiceDiscovery(URL, { signal: controller.signal });
      first.catch(() => {});
      controller.abort(timeoutError);
      await expect(first).rejects.toBe(timeoutError);
      const mockFetch = okFetch(mockDiscovery);
      vi.stubGlobal('fetch', mockFetch);

      await expect(fetchServiceDiscovery(URL)).rejects.toBe(timeoutError);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("is not opened when the caller's signal aborts for another reason", async () => {
      vi.stubGlobal('fetch', hungFetch());
      const controller = new AbortController();
      const first = fetchServiceDiscovery(URL, { signal: controller.signal });
      first.catch(() => {});
      controller.abort(new Error('caller gave up'));
      await expect(first).rejects.toThrow('caller gave up');
      const mockFetch = okFetch(mockDiscovery);
      vi.stubGlobal('fetch', mockFetch);

      await expect(fetchServiceDiscovery(URL)).resolves.toEqual(mockDiscovery);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('clearDiscoveryCache', () => {
    it('forgets the last good document and closes the fail-fast window', async () => {
      vi.stubGlobal('fetch', okFetch(mockDiscovery));
      await fetchServiceDiscovery(URL);
      await vi.advanceTimersByTimeAsync(5 * 60 * 1000);
      vi.stubGlobal('fetch', hungFetch());
      const timedOut = fetchServiceDiscovery(URL, { logger: mockLogger() });
      await vi.advanceTimersByTimeAsync(DEFAULT_DISCOVERY_TIMEOUT_MS);
      await timedOut;

      clearDiscoveryCache();
      const mockFetch = statusFetch(503);
      vi.stubGlobal('fetch', mockFetch);

      await expect(fetchServiceDiscovery(URL)).rejects.toMatchObject({
        statusCode: 503,
      });
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });
});
