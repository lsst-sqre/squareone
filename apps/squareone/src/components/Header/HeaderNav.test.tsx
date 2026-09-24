import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

// Keep the real discovery query helpers and mock data; only the hook that
// fetches discovery is replaced.
vi.mock('@lsst-sqre/repertoire-client', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@lsst-sqre/repertoire-client')>()),
  useServiceDiscovery: vi.fn(),
}));

// useLoginInfo supplies the signed-in user's scopes.
vi.mock('@lsst-sqre/gafaelfawr-client', () => ({
  useLoginInfo: vi.fn(),
}));

vi.mock('../../hooks/useRepertoireUrl', () => ({
  useRepertoireUrl: vi.fn(),
}));

vi.mock('../../hooks/useStaticConfig', () => ({
  useStaticConfig: vi.fn(),
}));

vi.mock('../../hooks/useCurrentUrl', () => ({
  default: () => new URL('https://data.lsst.cloud/'),
}));

// The login control and Apps menu have their own data dependencies and tests.
vi.mock('./Login', () => ({ default: (): null => null }));
vi.mock('./AppsMenu', () => ({ default: (): null => null }));

import type { UseLoginInfoReturn } from '@lsst-sqre/gafaelfawr-client';
// Import after mocking.
import { useLoginInfo } from '@lsst-sqre/gafaelfawr-client';
import {
  createDiscoveryQuery,
  mockDiscovery,
  type ServiceDiscovery,
  useServiceDiscovery,
} from '@lsst-sqre/repertoire-client';
import { useRepertoireUrl } from '../../hooks/useRepertoireUrl';
import {
  type AppConfigContextValue,
  useStaticConfig,
} from '../../hooks/useStaticConfig';
import HeaderNav from './HeaderNav';

const REPERTOIRE_URL = 'https://data.lsst.cloud/repertoire/discovery';

/** mockDiscovery as a Repertoire 2.x environment publishes it: no scopes. */
const discoveryWithoutRequiredScopes: ServiceDiscovery = {
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

function mockDiscoveryState({
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
function mockSignedIn(scopes: string[]) {
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
function mockAnonymous() {
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

function navLink(name: string) {
  return screen.queryByRole('link', { name });
}

describe('HeaderNav', () => {
  beforeEach(() => {
    vi.mocked(useRepertoireUrl).mockReturnValue(REPERTOIRE_URL);
    vi.mocked(useStaticConfig).mockReturnValue({
      enableAppsMenu: false,
    } as AppConfigContextValue);
    mockDiscoveryState();
    mockAnonymous();
  });

  test('hides Portal from a signed-in user without exec:portal', () => {
    mockSignedIn(['exec:notebook', 'read:tap']);

    render(<HeaderNav />);

    expect(navLink('Portal')).not.toBeInTheDocument();
    expect(navLink('Notebooks')).toHaveAttribute(
      'href',
      'https://data.lsst.cloud/nb'
    );
  });

  test('hides Notebooks from a signed-in user without exec:notebook', () => {
    mockSignedIn(['exec:portal', 'read:tap']);

    render(<HeaderNav />);

    expect(navLink('Notebooks')).not.toBeInTheDocument();
    expect(navLink('Portal')).toHaveAttribute(
      'href',
      'https://data.lsst.cloud/portal/app'
    );
  });

  test('shows Portal and Notebooks to an anonymous visitor', () => {
    mockAnonymous();

    render(<HeaderNav />);

    expect(navLink('Portal')).toBeInTheDocument();
    expect(navLink('Notebooks')).toBeInTheDocument();
  });

  test('shows Portal and Notebooks to a user holding both scopes', () => {
    mockSignedIn(['exec:portal', 'exec:notebook']);

    render(<HeaderNav />);

    expect(navLink('Portal')).toBeInTheDocument();
    expect(navLink('Notebooks')).toBeInTheDocument();
  });

  test('ignores scopes when discovery declares no required_scopes', () => {
    mockDiscoveryState({ discovery: discoveryWithoutRequiredScopes });
    mockSignedIn(['read:tap']);

    render(<HeaderNav />);

    expect(navLink('Portal')).toBeInTheDocument();
    expect(navLink('Notebooks')).toBeInTheDocument();
  });

  test('shows fallback entries while discovery is loading', () => {
    mockDiscoveryState({ isPending: true });
    mockSignedIn(['read:tap']);

    render(<HeaderNav />);

    expect(navLink('Portal')).toHaveAttribute('href', '/portal/app');
    expect(navLink('Notebooks')).toHaveAttribute('href', '/nb/hub');
  });

  test('shows fallback entries when discovery is not configured', () => {
    vi.mocked(useRepertoireUrl).mockReturnValue(undefined);
    mockDiscoveryState({ isPending: true });
    mockSignedIn(['read:tap']);

    render(<HeaderNav />);

    expect(navLink('Portal')).toHaveAttribute('href', '/portal/app');
    expect(navLink('Notebooks')).toHaveAttribute('href', '/nb/hub');
  });
});
