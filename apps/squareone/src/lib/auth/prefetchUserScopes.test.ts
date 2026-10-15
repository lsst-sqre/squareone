import {
  gafaelfawrKeys,
  type LoginInfo,
  mockLoginInfo,
  mockTokenDetail,
} from '@lsst-sqre/gafaelfawr-client';
import {
  createDiscoveryQuery,
  discoveryQueryOptions,
  getEmptyDiscovery,
  mockDiscovery,
  type ServiceDiscovery,
} from '@lsst-sqre/repertoire-client';
import { QueryClient } from '@tanstack/react-query';
import { headers } from 'next/headers';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import logger from '../logger';
import { dehydrateLayoutState } from './dehydrateLayoutState';
import { prefetchUserScopes } from './prefetchUserScopes';

vi.mock('next/headers', () => ({ headers: vi.fn() }));

vi.mock('../logger', () => ({
  default: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

// The Sentry reporter injected into the user-scopes query.
const { reportError } = vi.hoisted(() => ({ reportError: vi.fn() }));
vi.mock('../sentry/reportError', () => ({
  makeReportError: () => reportError,
}));

const REPERTOIRE_URL = 'https://data.lsst.cloud/repertoire';
const GAFAELFAWR_URL = createDiscoveryQuery(mockDiscovery).getGafaelfawrUrl();
const SESSION_COOKIE = 'gafaelfawr=encrypted-session; theme=dark';
const DELEGATED_TOKEN = 'gt-delegated-internal-token';
const SCOPES = ['exec:admin', 'exec:notebook'];

const signedInLoginInfo: LoginInfo = { ...mockLoginInfo, scopes: SCOPES };

/** The incoming request's headers, as `next/headers` reports them. */
function givenRequestHeaders(init: Record<string, string>) {
  vi.mocked(headers).mockResolvedValue(
    new Headers(init) as unknown as Awaited<ReturnType<typeof headers>>
  );
}

/** A GafaelfawrIngress route's request: cookie stripped, token delegated. */
function givenDelegatedRequest() {
  givenRequestHeaders({
    cookie: 'theme=dark',
    'x-auth-request-user': mockLoginInfo.username,
    'x-auth-request-token': DELEGATED_TOKEN,
  });
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

/** The entry for `queryKey` in the state the layout would dehydrate. */
function dehydratedEntry(
  queryClient: QueryClient,
  queryKey: readonly unknown[]
) {
  return dehydrateLayoutState(queryClient).queries.find(
    (query) => JSON.stringify(query.queryKey) === JSON.stringify(queryKey)
  );
}

const dehydratedScopes = (queryClient: QueryClient) =>
  dehydratedEntry(queryClient, gafaelfawrKeys.userScopes());

describe('prefetchUserScopes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(headers).mockReset();
  });

  describe('on a plain-ingress route (session cookie)', () => {
    test('hydrates the scopes from login info, but not the login info', async () => {
      givenRequestHeaders({ cookie: SESSION_COOKIE });
      const fetchMock = vi
        .spyOn(globalThis, 'fetch')
        .mockResolvedValue(Response.json(signedInLoginInfo));
      const queryClient = clientWithDiscovery();

      await prefetchUserScopes(queryClient, REPERTOIRE_URL);

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock).toHaveBeenCalledWith(`${GAFAELFAWR_URL}/login`, {
        credentials: 'include',
        headers: { cookie: SESSION_COOKIE },
        cache: 'no-store',
      });
      expect(dehydratedScopes(queryClient)?.state.data).toEqual(SCOPES);
      // Reading the scopes cached login info in the layout's client, but its
      // CSRF token is cookie-bound, so the browser must fetch its own.
      expect(queryClient.getQueryData(gafaelfawrKeys.loginInfo())).toEqual(
        signedInLoginInfo
      );
      expect(
        dehydratedEntry(queryClient, gafaelfawrKeys.loginInfo())
      ).toBeUndefined();
    });

    test('hydrates an anonymous visitor as null scopes without reporting', async () => {
      givenRequestHeaders({ accept: 'text/html' });
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response('Not logged in', { status: 401 })
      );
      const queryClient = clientWithDiscovery();

      await prefetchUserScopes(queryClient, REPERTOIRE_URL);

      const entry = dehydratedScopes(queryClient);
      expect(entry?.state.status).toBe('success');
      expect(entry?.state.data).toBeNull();
      expect(reportError).not.toHaveBeenCalled();
      expect(logger.error).not.toHaveBeenCalled();
    });
  });

  describe('on a GafaelfawrIngress route (delegated token)', () => {
    test("hydrates the delegated token's scopes from token info", async () => {
      givenDelegatedRequest();
      const fetchMock = vi
        .spyOn(globalThis, 'fetch')
        .mockResolvedValue(
          Response.json({ ...mockTokenDetail, scopes: SCOPES })
        );
      const queryClient = clientWithDiscovery();

      await prefetchUserScopes(queryClient, REPERTOIRE_URL);

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock).toHaveBeenCalledWith(`${GAFAELFAWR_URL}/token-info`, {
        credentials: 'include',
        headers: { authorization: `Bearer ${DELEGATED_TOKEN}` },
        cache: 'no-store',
      });
      expect(dehydratedScopes(queryClient)?.state.data).toEqual(SCOPES);
      // Login info is cookie-only, so it is not even read here.
      expect(
        queryClient.getQueryData(gafaelfawrKeys.loginInfo())
      ).toBeUndefined();
    });

    test('logs and reports a Gafaelfawr outage, and hydrates null', async () => {
      givenDelegatedRequest();
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response('Service Unavailable', { status: 503 })
      );
      const queryClient = clientWithDiscovery();

      await prefetchUserScopes(queryClient, REPERTOIRE_URL);

      expect(logger.error).toHaveBeenCalledTimes(1);
      expect(reportError).toHaveBeenCalledWith(expect.any(Error), {
        site: 'user-scopes',
        package: 'gafaelfawr-client',
      });
      expect(dehydratedScopes(queryClient)?.state.data).toBeNull();
    });
  });

  test('skips the prefetch when repertoireUrl is unset', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch');
    const queryClient = new QueryClient();

    await prefetchUserScopes(queryClient, undefined);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(headers).not.toHaveBeenCalled();
    expect(dehydratedScopes(queryClient)).toBeUndefined();
  });

  test('skips the prefetch when discovery has no Gafaelfawr URL', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch');
    const queryClient = clientWithDiscovery(getEmptyDiscovery());

    await prefetchUserScopes(queryClient, REPERTOIRE_URL);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(dehydratedScopes(queryClient)).toBeUndefined();
  });
});
