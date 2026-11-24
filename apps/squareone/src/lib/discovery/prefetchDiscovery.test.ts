import { QueryTimeoutError } from '@lsst-sqre/api-client-core';
import {
  discoveryQueryOptions,
  mockDiscovery,
  RepertoireError,
} from '@lsst-sqre/repertoire-client';
import { QueryClient } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { dehydrateLayoutState } from '../auth/dehydrateLayoutState';
import { prefetchUserInfo } from '../auth/prefetchUserInfo';
import { prefetchDiscovery } from './prefetchDiscovery';

vi.mock('next/headers', () => ({ headers: vi.fn() }));

vi.mock('../logger', () => ({
  default: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

// The Sentry reporter injected into the discovery query.
const { reportError } = vi.hoisted(() => ({ reportError: vi.fn() }));
vi.mock('../sentry/reportError', () => ({
  makeReportError: () => reportError,
}));

const CACHE_TTL_MS = 5 * 60 * 1000;
const CONTEXT = { site: 'service-discovery', package: 'repertoire-client' };

/**
 * A Repertoire URL of its own for each test: `fetchServiceDiscovery` keeps
 * its cache, last good document and fail-fast window per URL for the life of
 * the process.
 */
let repertoireUrl: string;
let urlCount = 0;

/** The discovery entry of the state the layout would dehydrate. */
function dehydratedDiscovery(queryClient: QueryClient) {
  const key = JSON.stringify(discoveryQueryOptions(repertoireUrl).queryKey);
  return dehydrateLayoutState(queryClient).queries.find(
    (query) => JSON.stringify(query.queryKey) === key
  );
}

/** Repertoire answering every request with `status`. */
function givenRepertoireStatus(status: number) {
  return vi
    .spyOn(globalThis, 'fetch')
    .mockResolvedValue(new Response('Error', { status }));
}

/** Repertoire answering every request with the discovery document. */
function givenRepertoireUp() {
  return vi
    .spyOn(globalThis, 'fetch')
    .mockImplementation(async () => Response.json(mockDiscovery));
}

describe('prefetchDiscovery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    urlCount += 1;
    repertoireUrl = `https://repertoire-${urlCount}.example.com/repertoire`;
    // The last good document and the fail-fast window are server-side only,
    // and `fetchServiceDiscovery` tells the server by the missing `window`.
    vi.stubGlobal('window', undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  test('hydrates the discovery document', async () => {
    givenRepertoireUp();
    const queryClient = new QueryClient();

    await prefetchDiscovery(queryClient, repertoireUrl);

    expect(dehydratedDiscovery(queryClient)?.state.data).toEqual(mockDiscovery);
  });

  describe('with no document received before', () => {
    // Hydrating the empty discovery would show no services, fresh for 5
    // minutes; the browser asks Repertoire itself instead.

    test('logs and reports a 5xx, and leaves discovery to the browser', async () => {
      givenRepertoireStatus(503);
      const queryClient = new QueryClient();

      await prefetchDiscovery(queryClient, repertoireUrl);

      expect(reportError).toHaveBeenCalledTimes(1);
      expect(reportError).toHaveBeenCalledWith(
        expect.any(RepertoireError),
        CONTEXT
      );
      expect(dehydratedDiscovery(queryClient)).toBeUndefined();
    });

    test('reports a timeout, and leaves discovery to the browser', async () => {
      vi.useFakeTimers();
      vi.spyOn(globalThis, 'fetch').mockImplementation(
        () => new Promise<Response>(() => {})
      );
      const queryClient = new QueryClient();

      const prefetch = prefetchDiscovery(queryClient, repertoireUrl);
      await vi.advanceTimersByTimeAsync(5000);
      await prefetch;

      expect(reportError).toHaveBeenCalledWith(
        expect.any(QueryTimeoutError),
        CONTEXT
      );
      expect(dehydratedDiscovery(queryClient)).toBeUndefined();
    });

    test('lets the auth prefetches of the same render skip, as without discovery', async () => {
      const fetchMock = givenRepertoireStatus(503);
      const queryClient = new QueryClient();

      await prefetchDiscovery(queryClient, repertoireUrl);
      await prefetchUserInfo(queryClient, repertoireUrl);

      // Only the discovery request: with no Gafaelfawr URL, user info is
      // left to the browser.
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
  });

  test('hydrates the last good document when Repertoire fails', async () => {
    vi.useFakeTimers();
    givenRepertoireUp();
    await prefetchDiscovery(new QueryClient(), repertoireUrl);
    await vi.advanceTimersByTimeAsync(CACHE_TTL_MS);
    vi.restoreAllMocks();
    givenRepertoireStatus(503);
    const queryClient = new QueryClient();

    await prefetchDiscovery(queryClient, repertoireUrl);

    expect(reportError).toHaveBeenCalledTimes(1);
    const entry = dehydratedDiscovery(queryClient);
    expect(entry?.state.status).toBe('success');
    expect(entry?.state.data).toEqual(mockDiscovery);
  });
});
