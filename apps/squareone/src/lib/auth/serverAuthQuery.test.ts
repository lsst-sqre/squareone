import {
  createDiscoveryQuery,
  discoveryQueryOptions,
  mockDiscovery,
} from '@lsst-sqre/repertoire-client';
import { QueryClient } from '@tanstack/react-query';
import { headers } from 'next/headers';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import logger from '../logger';
import { serverAuthQuery } from './serverAuthQuery';

vi.mock('next/headers', () => ({ headers: vi.fn() }));

vi.mock('../logger', () => ({
  default: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

vi.mock('../sentry/reportError', () => ({
  makeReportError: () => vi.fn(),
}));

const REPERTOIRE_URL = 'https://data.lsst.cloud/repertoire';
const GAFAELFAWR_URL = createDiscoveryQuery(mockDiscovery).getGafaelfawrUrl();
const SESSION_COOKIE = 'gafaelfawr=encrypted-session; theme=dark';
const DELEGATED_TOKEN = 'gt-delegated-internal-token';

/** The incoming request's headers, as `next/headers` reports them. */
function givenRequestHeaders(init: Record<string, string>) {
  vi.mocked(headers).mockResolvedValue(
    new Headers(init) as unknown as Awaited<ReturnType<typeof headers>>
  );
}

/** A query client holding the discovery document the layout prefetched. */
function clientWithDiscovery() {
  const queryClient = new QueryClient();
  queryClient.setQueryData(
    discoveryQueryOptions(REPERTOIRE_URL).queryKey,
    mockDiscovery
  );
  return queryClient;
}

describe('serverAuthQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(headers).mockReset();
  });

  test('forwards the session cookie on a plain-ingress route', async () => {
    givenRequestHeaders({ cookie: SESSION_COOKIE });

    const request = await serverAuthQuery(
      clientWithDiscovery(),
      REPERTOIRE_URL,
      'user-info'
    );

    expect(request).toMatchObject({
      gafaelfawrUrl: GAFAELFAWR_URL,
      mode: 'cookie',
      config: { headers: { cookie: SESSION_COOKIE }, isServer: true },
    });
  });

  test('presents the delegated token as a bearer token on a GafaelfawrIngress route', async () => {
    // The ingress strips Gafaelfawr's own cookie, so whatever cookie header
    // arrives cannot authenticate; the delegated token can.
    givenRequestHeaders({
      cookie: 'theme=dark',
      'x-auth-request-user': 'someuser',
      'x-auth-request-token': DELEGATED_TOKEN,
    });

    const request = await serverAuthQuery(
      clientWithDiscovery(),
      REPERTOIRE_URL,
      'user-info'
    );

    expect(request?.mode).toBe('delegated');
    expect(request?.config.headers).toEqual({
      authorization: `Bearer ${DELEGATED_TOKEN}`,
    });
  });

  test('warns once per process when the ingress delegates no token', async () => {
    // X-Auth-Request-User without X-Auth-Request-Token: the request crossed a
    // GafaelfawrIngress whose config lacks `delegate`, so the cookie mode this
    // falls back to will hydrate the user as anonymous.
    givenRequestHeaders({
      cookie: 'theme=dark',
      'x-auth-request-user': 'someuser',
    });
    const queryClient = clientWithDiscovery();

    const first = await serverAuthQuery(
      queryClient,
      REPERTOIRE_URL,
      'user-info'
    );
    const second = await serverAuthQuery(
      queryClient,
      REPERTOIRE_URL,
      'login-info'
    );

    expect(first?.mode).toBe('cookie');
    expect(second?.mode).toBe('cookie');
    expect(logger.warn).toHaveBeenCalledTimes(1);
  });
});
