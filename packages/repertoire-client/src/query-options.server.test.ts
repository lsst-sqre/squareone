// @vitest-environment node
//
// Server-side behaviour of `discoveryQueryOptions` (the root layout's
// discovery prefetch): how its `reportingQueryFn` wrapper meets the timeout,
// the stale fallback and the fail-fast window of `fetchServiceDiscovery`.
// These apply only where there is no `window` global, so these tests run in
// the Node environment rather than jsdom.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearDiscoveryCache,
  fetchServiceDiscovery,
  getEmptyDiscovery,
  RepertoireError,
} from './client';
import { mockDiscovery } from './mock-discovery';
import { discoveryQueryOptions } from './query-options';

const URL = 'https://example.com/repertoire';
const CACHE_TTL_MS = 5 * 60 * 1000;
const CONTEXT = { site: 'service-discovery', package: 'repertoire-client' };

/** A logger whose methods are mocks. */
function mockLogger() {
  return { debug: vi.fn(), warn: vi.fn(), error: vi.fn() };
}

/** An OK response carrying the discovery document. */
function okResponse() {
  return {
    ok: true,
    status: 200,
    statusText: 'OK',
    json: () => Promise.resolve(mockDiscovery),
  };
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

/** The layout's discovery prefetch query function. */
function prefetchQueryFn(reportError = vi.fn()) {
  const { queryFn } = discoveryQueryOptions(URL, {
    logger: mockLogger(),
    isServer: true,
    reportError,
    context: CONTEXT,
  });
  if (!queryFn) {
    throw new Error('queryFn should always be defined');
  }
  return () => queryFn({} as never);
}

describe('discoveryQueryOptions (server-side)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    clearDiscoveryCache();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    clearDiscoveryCache();
  });

  /** Cache `mockDiscovery` for URL, then let it expire. */
  async function givenExpiredDocument() {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(okResponse()));
    await fetchServiceDiscovery(URL, { logger: mockLogger() });
    await vi.advanceTimersByTimeAsync(CACHE_TTL_MS);
  }

  describe('with an expired document', () => {
    it('returns it and reports a refresh that fails with a 5xx', async () => {
      await givenExpiredDocument();
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: false,
          status: 503,
          statusText: 'Service Unavailable',
        })
      );
      const reportError = vi.fn();

      await expect(prefetchQueryFn(reportError)()).resolves.toEqual(
        mockDiscovery
      );
      expect(reportError).toHaveBeenCalledTimes(1);
      expect(reportError).toHaveBeenCalledWith(
        expect.any(RepertoireError),
        CONTEXT
      );
    });

    it('retries a single connection reset and reports nothing', async () => {
      await givenExpiredDocument();
      const fresh = { ...mockDiscovery, applications: ['fresh'] };
      const mockFetch = vi
        .fn()
        .mockRejectedValueOnce(new TypeError('fetch failed'))
        .mockResolvedValueOnce({ ...okResponse(), json: async () => fresh });
      vi.stubGlobal('fetch', mockFetch);
      const reportError = vi.fn();

      await expect(prefetchQueryFn(reportError)()).resolves.toEqual(fresh);
      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(reportError).not.toHaveBeenCalled();
    });

    it('returns it and reports once when the retry of a connection reset fails too', async () => {
      await givenExpiredDocument();
      const mockFetch = vi
        .fn()
        .mockRejectedValue(new TypeError('fetch failed'));
      vi.stubGlobal('fetch', mockFetch);
      const reportError = vi.fn();

      await expect(prefetchQueryFn(reportError)()).resolves.toEqual(
        mockDiscovery
      );
      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(reportError).toHaveBeenCalledTimes(1);
      expect(reportError).toHaveBeenCalledWith(expect.any(TypeError), CONTEXT);
    });

    it('returns it and reports a refresh that times out', async () => {
      await givenExpiredDocument();
      vi.stubGlobal(
        'fetch',
        vi.fn(() => new Promise<never>(() => {}))
      );
      const reportError = vi.fn();

      const result = prefetchQueryFn(reportError)();
      await vi.advanceTimersByTimeAsync(5000);

      await expect(result).resolves.toEqual(mockDiscovery);
      expect(reportError).toHaveBeenCalledTimes(1);
      expect(reportError).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'QueryTimeoutError' }),
        CONTEXT
      );
    });
  });

  // With Repertoire hung, one squareone request looks discovery up in turn in
  // getStaticConfig() (only when a discovery-backed config key is unset), the
  // layout's discovery prefetch and prefetchBroadcasts. Together they must
  // wait about one timeout, not one each.
  describe('one request against a Repertoire that never responds', () => {
    /** The lookups of one request, in the layout's order. */
    function renderRequest(options: { configLooksUp: boolean }) {
      const logger = mockLogger();
      const reportError = vi.fn();
      const lookups = (async () => {
        const config = options.configLooksUp
          ? await fetchServiceDiscovery(URL, { logger }).catch(() => null)
          : null;
        const prefetched = await prefetchQueryFn(reportError)();
        const broadcasts = await fetchServiceDiscovery(URL, { logger }).catch(
          () => null
        );
        return { config, prefetched, broadcasts };
      })();
      return { lookups, reportError };
    }

    beforeEach(() => {
      vi.stubGlobal(
        'fetch',
        vi.fn(() => new Promise<never>(() => {}))
      );
    });

    it.each([
      ['getStaticConfig looks discovery up', true],
      ['the prefetch is the first lookup', false],
    ])(
      'waits one timeout in total with a cold cache when %s',
      async (_label, configLooksUp) => {
        const { lookups, reportError } = renderRequest({ configLooksUp });
        lookups.catch(() => {});

        await vi.advanceTimersByTimeAsync(5000);

        expect(await isSettled(lookups)).toBe(true);
        await expect(lookups).resolves.toEqual({
          config: null,
          prefetched: getEmptyDiscovery(),
          broadcasts: null,
        });
        expect(fetch).toHaveBeenCalledTimes(1);
        expect(reportError).toHaveBeenCalledWith(
          expect.objectContaining({ name: 'QueryTimeoutError' }),
          CONTEXT
        );
      }
    );

    it.each([
      ['getStaticConfig looks discovery up', true],
      ['the prefetch is the first lookup', false],
    ])(
      'waits one timeout in total and serves the expired document when %s',
      async (_label, configLooksUp) => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue(okResponse()));
        await fetchServiceDiscovery(URL, { logger: mockLogger() });
        await vi.advanceTimersByTimeAsync(CACHE_TTL_MS);
        const hung = vi.fn(() => new Promise<never>(() => {}));
        vi.stubGlobal('fetch', hung);
        const { lookups, reportError } = renderRequest({ configLooksUp });
        lookups.catch(() => {});

        await vi.advanceTimersByTimeAsync(5000);

        expect(await isSettled(lookups)).toBe(true);
        await expect(lookups).resolves.toEqual({
          config: configLooksUp ? mockDiscovery : null,
          prefetched: mockDiscovery,
          broadcasts: mockDiscovery,
        });
        expect(hung).toHaveBeenCalledTimes(1);
        expect(reportError).toHaveBeenCalledTimes(1);
      }
    );
  });

  it('falls back to the empty discovery with no document to fall back to', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
      })
    );

    await expect(prefetchQueryFn()()).resolves.toEqual(getEmptyDiscovery());
  });
});
