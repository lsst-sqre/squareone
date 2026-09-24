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
import HomepageHero from './HomepageHero';

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

/** The service card headings the hero renders, e.g. "Portal". */
function cardHeading(name: string) {
  return screen.queryByRole('heading', { level: 2, name });
}

describe('HomepageHero', () => {
  beforeEach(() => {
    vi.mocked(useRepertoireUrl).mockReturnValue(REPERTOIRE_URL);
    vi.mocked(useStaticConfig).mockReturnValue({
      siteName: 'Rubin Science Platform',
      showPreview: false,
      docsBaseUrl: 'https://rsp.lsst.io',
    } as AppConfigContextValue);
    mockDiscoveryState();
    mockAnonymous();
  });

  test('hides Portal from a signed-in user without exec:portal', () => {
    mockSignedIn(['exec:notebook', 'read:tap']);

    render(<HomepageHero />);

    expect(cardHeading('Portal')).not.toBeInTheDocument();
    expect(cardHeading('Notebooks')).toBeInTheDocument();
  });

  test('hides Notebooks from a signed-in user without exec:notebook', () => {
    mockSignedIn(['exec:portal', 'read:tap']);

    render(<HomepageHero />);

    expect(cardHeading('Notebooks')).not.toBeInTheDocument();
    expect(cardHeading('Portal')).toBeInTheDocument();
  });

  test('shows Portal and Notebooks to an anonymous visitor', () => {
    mockAnonymous();

    render(<HomepageHero />);

    expect(cardHeading('Portal')).toBeInTheDocument();
    expect(cardHeading('Notebooks')).toBeInTheDocument();
  });

  test('shows Portal and Notebooks to a user holding both scopes', () => {
    mockSignedIn(['exec:portal', 'exec:notebook']);

    render(<HomepageHero />);

    expect(cardHeading('Portal')).toBeInTheDocument();
    expect(cardHeading('Notebooks')).toBeInTheDocument();
  });

  test('ignores scopes when discovery declares no required_scopes', () => {
    mockDiscoveryState({ discovery: discoveryWithoutRequiredScopes });
    mockSignedIn(['read:tap']);

    render(<HomepageHero />);

    expect(cardHeading('Portal')).toBeInTheDocument();
    expect(cardHeading('Notebooks')).toBeInTheDocument();
  });

  test('hides Portal and Notebooks until discovery loads', () => {
    mockDiscoveryState({ isPending: true });
    mockAnonymous();

    render(<HomepageHero />);

    expect(cardHeading('Portal')).not.toBeInTheDocument();
    expect(cardHeading('Notebooks')).not.toBeInTheDocument();
    expect(cardHeading('APIs')).toBeInTheDocument();
  });

  test('shows fallback cards when discovery is not configured', () => {
    vi.mocked(useRepertoireUrl).mockReturnValue(undefined);
    mockDiscoveryState({ isPending: true });
    mockSignedIn(['read:tap']);

    render(<HomepageHero />);

    expect(cardHeading('Portal')).toBeInTheDocument();
    expect(cardHeading('Notebooks')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /Portal/ }).getAttribute('href')
    ).toBe('/portal/app/');
  });
});
