import {
  gafaelfawrKeys,
  type LoginInfo,
  mockLoginInfo,
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
import { prefetchLoginInfo } from './prefetchLoginInfo';

vi.mock('next/headers', () => ({ headers: vi.fn() }));

vi.mock('../logger', () => ({
  default: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

// The Sentry reporter injected into the login-info query.
const { reportError } = vi.hoisted(() => ({ reportError: vi.fn() }));
vi.mock('../sentry/reportError', () => ({
  makeReportError: () => reportError,
}));

const REPERTOIRE_URL = 'https://data.lsst.cloud/repertoire';
const GAFAELFAWR_URL = createDiscoveryQuery(mockDiscovery).getGafaelfawrUrl();
const SESSION_COOKIE = 'gafaelfawr=encrypted-session; theme=dark';
const DELEGATED_TOKEN = 'gt-delegated-internal-token';

const signedInLoginInfo: LoginInfo = {
  ...mockLoginInfo,
  scopes: ['exec:notebook', 'read:tap'],
};

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

/** The login-info entry of the state the layout would dehydrate. */
function dehydratedLoginInfo(queryClient: QueryClient) {
  return dehydrate(queryClient).queries.find(
    (query) =>
      JSON.stringify(query.queryKey) ===
      JSON.stringify(gafaelfawrKeys.loginInfo())
  );
}

describe('prefetchLoginInfo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(headers).mockReset();
  });

  test('hydrates a signed-in user by forwarding their session cookie', async () => {
    givenRequestHeaders({ cookie: SESSION_COOKIE });
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(Response.json(signedInLoginInfo));
    const queryClient = clientWithDiscovery();

    await prefetchLoginInfo(queryClient, REPERTOIRE_URL);

    expect(fetchMock).toHaveBeenCalledWith(`${GAFAELFAWR_URL}/login`, {
      credentials: 'include',
      headers: { cookie: SESSION_COOKIE },
      cache: 'no-store',
    });
    expect(dehydratedLoginInfo(queryClient)?.state.data).toEqual(
      signedInLoginInfo
    );
  });

  test('hydrates an anonymous visitor as null login info', async () => {
    givenRequestHeaders({ accept: 'text/html' });
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response('Not logged in', { status: 401 }));
    const queryClient = clientWithDiscovery();

    await prefetchLoginInfo(queryClient, REPERTOIRE_URL);

    // No cookie to forward, but still never cached.
    expect(fetchMock).toHaveBeenCalledWith(`${GAFAELFAWR_URL}/login`, {
      credentials: 'include',
      cache: 'no-store',
    });
    const entry = dehydratedLoginInfo(queryClient);
    expect(entry?.state.status).toBe('success');
    expect(entry?.state.data).toBeNull();
    // A 401 is the expected anonymous answer, not a report-worthy failure.
    expect(reportError).not.toHaveBeenCalled();
  });

  test('logs an anonymous visitor at debug level, not as an error', async () => {
    givenRequestHeaders({});
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('Not logged in', { status: 401 })
    );

    await prefetchLoginInfo(clientWithDiscovery(), REPERTOIRE_URL);

    // Every anonymous page view makes this request: an error-level record per
    // view would flood the server logs and Sentry Logs.
    expect(logger.error).not.toHaveBeenCalled();
    expect(logger.debug).toHaveBeenCalled();
  });

  test('logs and reports a Gafaelfawr outage, and hydrates null', async () => {
    givenRequestHeaders({ cookie: SESSION_COOKIE });
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('Service Unavailable', { status: 503 })
    );
    const queryClient = clientWithDiscovery();

    await prefetchLoginInfo(queryClient, REPERTOIRE_URL);

    expect(logger.error).toHaveBeenCalledTimes(1);
    expect(reportError).toHaveBeenCalledWith(expect.any(Error), {
      site: 'login-info',
      package: 'gafaelfawr-client',
    });
    expect(dehydratedLoginInfo(queryClient)?.state.data).toBeNull();
  });

  test('skips the prefetch on a GafaelfawrIngress route, leaving it to the browser', async () => {
    // Login info is cookie-only, and the ingress stripped the cookie: a fetch
    // with the delegated token would get a 401 and hydrate the signed-in user
    // as anonymous. Dehydrating nothing lets the browser fetch it instead.
    givenRequestHeaders({
      'x-auth-request-user': 'someuser',
      'x-auth-request-token': DELEGATED_TOKEN,
    });
    const fetchMock = vi.spyOn(globalThis, 'fetch');
    const queryClient = clientWithDiscovery();

    await prefetchLoginInfo(queryClient, REPERTOIRE_URL);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(dehydratedLoginInfo(queryClient)).toBeUndefined();
  });

  test('skips the prefetch when repertoireUrl is unset', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch');
    const queryClient = new QueryClient();

    await prefetchLoginInfo(queryClient, undefined);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(headers).not.toHaveBeenCalled();
    expect(dehydratedLoginInfo(queryClient)).toBeUndefined();
  });

  test('skips the prefetch when discovery has no Gafaelfawr URL', async () => {
    // What the layout's discovery prefetch caches when Repertoire is down.
    const fetchMock = vi.spyOn(globalThis, 'fetch');
    const queryClient = clientWithDiscovery(getEmptyDiscovery());

    await prefetchLoginInfo(queryClient, REPERTOIRE_URL);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(dehydratedLoginInfo(queryClient)).toBeUndefined();
  });
});
