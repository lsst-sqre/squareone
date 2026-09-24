/**
 * Unit-test helpers that set what service discovery and Gafaelfawr login info
 * report, for components that show or hide entries by the user's scopes.
 *
 * The helpers drive `vi.mocked(...)` hooks, so a test file using them must mock
 * both hooks itself (vi.mock is hoisted per file and cannot be shared):
 *
 * ```ts
 * vi.mock('@lsst-sqre/repertoire-client', async (importOriginal) => ({
 *   ...(await importOriginal<typeof import('@lsst-sqre/repertoire-client')>()),
 *   useServiceDiscovery: vi.fn(),
 * }));
 * vi.mock('@lsst-sqre/gafaelfawr-client', () => ({ useLoginInfo: vi.fn() }));
 * ```
 *
 * Test-support only: nothing in the app bundle imports this module.
 */

import {
  type UseLoginInfoReturn,
  useLoginInfo,
} from '@lsst-sqre/gafaelfawr-client';
import {
  createDiscoveryQuery,
  mockDiscovery,
  type ServiceDiscovery,
  useServiceDiscovery,
} from '@lsst-sqre/repertoire-client';
import { vi } from 'vitest';

/** mockDiscovery as a Repertoire 2.x environment publishes it: no scopes. */
export const discoveryWithoutRequiredScopes: ServiceDiscovery = {
  ...mockDiscovery,
  services: {
    ...mockDiscovery.services,
    ui: Object.fromEntries(
      Object.entries(mockDiscovery.services.ui).map(([name, service]) => [
        name,
        { ...service, required_scopes: [] as string[] },
      ])
    ),
  },
};

/** Make useServiceDiscovery report `discovery` (or a pending query). */
export function mockDiscoveryState({
  discovery = mockDiscovery,
  isPending = false,
}: {
  discovery?: ServiceDiscovery;
  isPending?: boolean;
} = {}) {
  vi.mocked(useServiceDiscovery).mockReturnValue({
    discovery: isPending ? undefined : discovery,
    query: isPending ? null : createDiscoveryQuery(discovery),
    refetch: vi.fn(),
    isStale: false,
    isPending,
    isError: false,
    error: null,
  } as unknown as ReturnType<typeof useServiceDiscovery>);
}

/** A signed-in user holding exactly `scopes`. */
export function mockSignedIn(scopes: string[]) {
  vi.mocked(useLoginInfo).mockReturnValue({
    loginInfo: null,
    query: {
      scopes,
      hasScope: (scope: string) => scopes.includes(scope),
    } as UseLoginInfoReturn['query'],
    csrfToken: null,
    isLoading: false,
    isPending: false,
    error: null,
    refetch: vi.fn(),
  });
}

/** An anonymous visitor: Gafaelfawr answers 401, so there is no login info. */
export function mockAnonymous() {
  vi.mocked(useLoginInfo).mockReturnValue({
    loginInfo: null,
    query: null,
    csrfToken: null,
    isLoading: false,
    isPending: false,
    error: null,
    refetch: vi.fn(),
  });
}
