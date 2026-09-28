import {
  gafaelfawrKeys,
  getEmptyUserInfo,
  mockUserInfo,
} from '@lsst-sqre/gafaelfawr-client';
import {
  createDiscoveryQuery,
  discoveryQueryOptions,
  getEmptyDiscovery,
  mockDiscovery,
  type ServiceDiscovery,
} from '@lsst-sqre/repertoire-client';
import { dehydrate, QueryClient } from '@tanstack/react-query';
import { headers } from 'next/headers';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import logger from '../logger';
import { prefetchUserInfo } from './prefetchUserInfo';

vi.mock('next/headers', () => ({ headers: vi.fn() }));

vi.mock('../logger', () => ({
  default: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

// The Sentry reporter injected into the user-info query.
const { reportError } = vi.hoisted(() => ({ reportError: vi.fn() }));
vi.mock('../sentry/reportError', () => ({
  makeReportError: () => reportError,
}));

const REPERTOIRE_URL = 'https://data.lsst.cloud/repertoire';
const GAFAELFAWR_URL = createDiscoveryQuery(mockDiscovery).getGafaelfawrUrl();
const SESSION_COOKIE = 'gafaelfawr=encrypted-session; theme=dark';

/** The incoming request's headers, as `next/headers` reports them. */
function givenRequestHeaders(init: Record<string, string>) {
  vi.mocked(headers).mockResolvedValue(
    new Headers(init) as unknown as Awaited<ReturnType<typeof headers>>
  );
}

/** A query client holding the discovery document the layout prefetched. */
function clientWithDiscovery(discovery: ServiceDiscovery = mockDiscovery) {
  const queryClient = new QueryClient();
  queryClient.setQueryData(
    discoveryQueryOptions(REPERTOIRE_URL).queryKey,
    discovery
  );
  return queryClient;
}

/** The user-info entry of the state the layout would dehydrate. */
function dehydratedUserInfo(queryClient: QueryClient) {
  return dehydrate(queryClient).queries.find(
    (query) =>
      JSON.stringify(query.queryKey) ===
      JSON.stringify(gafaelfawrKeys.userInfo())
  );
}

describe('prefetchUserInfo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(headers).mockReset();
  });

  test('hydrates a signed-in user by forwarding their session cookie', async () => {
    givenRequestHeaders({ cookie: SESSION_COOKIE });
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(Response.json(mockUserInfo));
    const queryClient = clientWithDiscovery();

    await prefetchUserInfo(queryClient, REPERTOIRE_URL);

    expect(fetchMock).toHaveBeenCalledWith(`${GAFAELFAWR_URL}/user-info`, {
      credentials: 'include',
      headers: { cookie: SESSION_COOKIE },
      cache: 'no-store',
    });
    expect(dehydratedUserInfo(queryClient)?.state.data).toEqual(mockUserInfo);
  });

  test('hydrates an anonymous visitor as empty user info', async () => {
    givenRequestHeaders({ accept: 'text/html' });
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response('Not logged in', { status: 401 }));
    const queryClient = clientWithDiscovery();

    await prefetchUserInfo(queryClient, REPERTOIRE_URL);

    // No cookie to forward, but still never cached.
    expect(fetchMock).toHaveBeenCalledWith(`${GAFAELFAWR_URL}/user-info`, {
      credentials: 'include',
      cache: 'no-store',
    });
    // Empty user info is what `useUserInfo` reads as "not logged in", so the
    // server and the first client render agree on showing "Log in".
    const entry = dehydratedUserInfo(queryClient);
    expect(entry?.state.status).toBe('success');
    expect(entry?.state.data).toEqual(getEmptyUserInfo());
    // A 401 is the expected anonymous answer, not a report-worthy failure.
    expect(reportError).not.toHaveBeenCalled();
  });

  test('logs an anonymous visitor at debug level, not as an error', async () => {
    givenRequestHeaders({});
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('Not logged in', { status: 401 })
    );

    await prefetchUserInfo(clientWithDiscovery(), REPERTOIRE_URL);

    // Every anonymous page view makes this request: an error-level record per
    // view would flood the server logs and Sentry Logs.
    expect(logger.error).not.toHaveBeenCalled();
    expect(logger.debug).toHaveBeenCalled();
  });

  test('logs and reports a Gafaelfawr outage, and hydrates empty user info', async () => {
    givenRequestHeaders({ cookie: SESSION_COOKIE });
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('Service Unavailable', { status: 503 })
    );
    const queryClient = clientWithDiscovery();

    await prefetchUserInfo(queryClient, REPERTOIRE_URL);

    expect(logger.error).toHaveBeenCalledTimes(1);
    expect(reportError).toHaveBeenCalledWith(expect.any(Error), {
      site: 'user-info',
      package: 'gafaelfawr-client',
    });
    expect(dehydratedUserInfo(queryClient)?.state.data).toEqual(
      getEmptyUserInfo()
    );
  });

  test('skips the prefetch when repertoireUrl is unset', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch');
    const queryClient = new QueryClient();

    await prefetchUserInfo(queryClient, undefined);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(headers).not.toHaveBeenCalled();
    expect(dehydratedUserInfo(queryClient)).toBeUndefined();
  });

  test('skips the prefetch when discovery has no Gafaelfawr URL', async () => {
    // What the layout's discovery prefetch caches when Repertoire is down.
    const fetchMock = vi.spyOn(globalThis, 'fetch');
    const queryClient = clientWithDiscovery(getEmptyDiscovery());

    await prefetchUserInfo(queryClient, REPERTOIRE_URL);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(dehydratedUserInfo(queryClient)).toBeUndefined();
  });
});
