import {
  gafaelfawrKeys,
  type LoginInfo,
  mockLoginInfo,
  mockTokenDetail,
  mockUserInfo,
} from '@lsst-sqre/gafaelfawr-client';
import {
  createDiscoveryQuery,
  discoveryQueryOptions,
  mockDiscovery,
} from '@lsst-sqre/repertoire-client';
import {
  type DehydratedState,
  QueryClient,
  type QueryKey,
} from '@tanstack/react-query';
import { headers } from 'next/headers';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { dehydrateLayoutState } from './dehydrateLayoutState';
import { prefetchUserInfo } from './prefetchUserInfo';
import { prefetchUserScopes } from './prefetchUserScopes';

vi.mock('next/headers', () => ({ headers: vi.fn() }));

vi.mock('../logger', () => ({
  default: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

vi.mock('../sentry/reportError', () => ({
  makeReportError: () => vi.fn(),
}));

const REPERTOIRE_URL = 'https://data.lsst.cloud/repertoire';
const GAFAELFAWR_URL = createDiscoveryQuery(mockDiscovery).getGafaelfawrUrl();
const DISCOVERY_KEY = discoveryQueryOptions(REPERTOIRE_URL).queryKey;
const SCOPES = ['exec:notebook', 'read:tap'];

const signedInLoginInfo: LoginInfo = { ...mockLoginInfo, scopes: SCOPES };

/** A plain-ingress route's request: the session cookie reaches the pod. */
const COOKIE_REQUEST = { cookie: 'gafaelfawr=encrypted-session; theme=dark' };

/** A GafaelfawrIngress route's request: cookie stripped, token delegated. */
const DELEGATED_REQUEST = {
  cookie: 'theme=dark',
  'x-auth-request-user': mockLoginInfo.username,
  'x-auth-request-token': 'gt-delegated-internal-token',
};

/** Gafaelfawr's answers for a signed-in visitor, by endpoint. */
function stubGafaelfawr() {
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
    switch (String(input)) {
      case `${GAFAELFAWR_URL}/login`:
        return Response.json(signedInLoginInfo);
      case `${GAFAELFAWR_URL}/token-info`:
        return Response.json({ ...mockTokenDetail, scopes: SCOPES });
      case `${GAFAELFAWR_URL}/user-info`:
        return Response.json(mockUserInfo);
      default:
        return new Response('Not Found', { status: 404 });
    }
  });
}

/**
 * The root layout's per-request query client once its prefetches have run for
 * a signed-in visitor whose request carries `requestHeaders`.
 */
async function prefetchedLayoutClient(
  requestHeaders: Record<string, string>
): Promise<QueryClient> {
  vi.mocked(headers).mockResolvedValue(
    new Headers(requestHeaders) as unknown as Awaited<
      ReturnType<typeof headers>
    >
  );
  const queryClient = new QueryClient();
  queryClient.setQueryData(DISCOVERY_KEY, mockDiscovery);
  await Promise.all([
    prefetchUserScopes(queryClient, REPERTOIRE_URL),
    prefetchUserInfo(queryClient, REPERTOIRE_URL),
  ]);
  return queryClient;
}

/** The data `state` carries for `queryKey`, or undefined without an entry. */
function dehydratedData(state: DehydratedState, queryKey: QueryKey) {
  return state.queries.find(
    (query) => JSON.stringify(query.queryKey) === JSON.stringify(queryKey)
  )?.state.data;
}

/** The query keys `state` carries. */
function dehydratedKeys(state: DehydratedState): QueryKey[] {
  return state.queries.map((query) => query.queryKey);
}

describe('dehydrateLayoutState', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(headers).mockReset();
    stubGafaelfawr();
  });

  describe.each([
    {
      route: 'a plain-ingress route (session cookie)',
      requestHeaders: COOKIE_REQUEST,
    },
    {
      route: 'a GafaelfawrIngress route (delegated token)',
      requestHeaders: DELEGATED_REQUEST,
    },
  ])('on $route', ({ requestHeaders }) => {
    test('dehydrates discovery, the scopes, and user info', async () => {
      const state = dehydrateLayoutState(
        await prefetchedLayoutClient(requestHeaders)
      );

      expect(dehydratedData(state, DISCOVERY_KEY)).toEqual(mockDiscovery);
      expect(dehydratedData(state, gafaelfawrKeys.userScopes())).toEqual(
        SCOPES
      );
      expect(dehydratedData(state, gafaelfawrKeys.userInfo())).toEqual(
        mockUserInfo
      );
    });

    test('never dehydrates the login info the client holds', async () => {
      const queryClient = await prefetchedLayoutClient(requestHeaders);
      // On a plain-ingress route the scopes prefetch has already cached login
      // info; on a GafaelfawrIngress route nothing reads it, so put it there:
      // the filter alone, not the absence of a request, must keep it out.
      queryClient.setQueryData(gafaelfawrKeys.loginInfo(), signedInLoginInfo);

      const state = dehydrateLayoutState(queryClient);

      expect(dehydratedKeys(state)).not.toContainEqual(
        gafaelfawrKeys.loginInfo()
      );
    });
  });

  test('drops the login info the plain-ingress scopes prefetch caches', async () => {
    // The scopes come from `client.fetchQuery(loginInfoQueryOptions(...))`,
    // so the server-minted CSRF token sits in the layout's client even though
    // the layout never prefetches login info itself.
    const queryClient = await prefetchedLayoutClient(COOKIE_REQUEST);
    expect(queryClient.getQueryData(gafaelfawrKeys.loginInfo())).toEqual(
      signedInLoginInfo
    );

    const state = dehydrateLayoutState(queryClient);

    expect(dehydratedKeys(state)).not.toContainEqual(
      gafaelfawrKeys.loginInfo()
    );
  });

  test('dehydrates only successful queries, as dehydrate does by default', async () => {
    const queryClient = await prefetchedLayoutClient(COOKIE_REQUEST);
    await queryClient.prefetchQuery({
      queryKey: ['failing'],
      queryFn: () => Promise.reject(new Error('Boom')),
      retry: false,
    });

    const state = dehydrateLayoutState(queryClient);

    expect(dehydratedKeys(state)).not.toContainEqual(['failing']);
  });
});
