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

// The login control and Apps menu have their own data dependencies and tests;
// the Apps menu stands in as a bare navigation item so its placement shows.
vi.mock('./Login', () => ({ default: (): null => null }));
vi.mock('./AppsMenu', () => ({
  default: () => <li data-testid="apps-menu" />,
}));

// Import after mocking.
import { useRepertoireUrl } from '../../hooks/useRepertoireUrl';
import {
  type AppConfigContextValue,
  useStaticConfig,
} from '../../hooks/useStaticConfig';
import {
  discoveryWithoutRequiredScopes,
  mockAnonymous,
  mockDiscoveryState,
  mockSignedIn,
} from '../../tests/serviceAccessMocks';
import HeaderNav from './HeaderNav';

const REPERTOIRE_URL = 'https://data.lsst.cloud/repertoire/discovery';

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

  test('renders the Apps menu as its own item when enableAppsMenu is true', () => {
    vi.mocked(useStaticConfig).mockReturnValue({
      enableAppsMenu: true,
    } as AppConfigContextValue);

    render(<HeaderNav />);

    // AppsMenu renders its own navigation item (or nothing, with no items).
    expect(screen.getByTestId('apps-menu').parentElement?.tagName).toBe('UL');
  });

  test('hides the Apps menu when enableAppsMenu is false', () => {
    render(<HeaderNav />);

    expect(screen.queryByTestId('apps-menu')).not.toBeInTheDocument();
  });
});
