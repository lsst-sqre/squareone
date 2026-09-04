import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

// Mock the RSC config loader so generateMetadata and the page can run without
// the filesystem-backed config.
vi.mock('../../lib/config/rsc', () => ({
  getStaticConfig: vi.fn(),
}));

// The index page resolves its redirect target from the user's Gafaelfawr
// scopes, so mock login info (and the Repertoire URL it is fetched from).
vi.mock('@lsst-sqre/gafaelfawr-client', () => ({
  useLoginInfo: vi.fn(),
}));

vi.mock('../../hooks/useRepertoireUrl', () => ({
  useRepertoireUrl: vi.fn(() => undefined),
}));

const replace = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
}));

import type { UseLoginInfoReturn } from '@lsst-sqre/gafaelfawr-client';
// Import after mocking.
import { useLoginInfo } from '@lsst-sqre/gafaelfawr-client';
import type { AppConfig } from '../../lib/config/loader';
import { getStaticConfig } from '../../lib/config/rsc';
import AdminPage, { generateMetadata } from './page';

function makeConfig(overrides: Partial<AppConfig> = {}): AppConfig {
  return {
    siteName: 'Rubin Science Platform',
    ...overrides,
  } as AppConfig;
}

/** A useLoginInfo return whose query reports the given scopes. */
function mockLoginInfoWithScopes(
  scopes: string[],
  isLoading = false
): UseLoginInfoReturn {
  return {
    loginInfo: null,
    query: { scopes } as UseLoginInfoReturn['query'],
    csrfToken: null,
    isLoading,
    isPending: false,
    error: null,
    refetch: vi.fn(),
  };
}

describe('AdminPage generateMetadata', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('sets the page title from config.siteName', async () => {
    vi.mocked(getStaticConfig).mockResolvedValue(makeConfig());

    const metadata = await generateMetadata();

    expect(metadata.title).toBe('Admin | Rubin Science Platform');
  });

  test('uses the configured siteName when it differs', async () => {
    vi.mocked(getStaticConfig).mockResolvedValue(
      makeConfig({ siteName: 'Telescope Ops' })
    );

    const metadata = await generateMetadata();

    expect(metadata.title).toBe('Admin | Telescope Ops');
  });
});

describe('AdminPage redirect', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getStaticConfig).mockResolvedValue(makeConfig());
  });

  test('redirects a user holding only admin:notifications to /admin/notifications', async () => {
    vi.mocked(useLoginInfo).mockReturnValue(
      mockLoginInfoWithScopes(['admin:notifications'])
    );

    render(await AdminPage());

    expect(replace).toHaveBeenCalledWith('/admin/notifications');
  });

  test('redirects a user holding only admin:token to the first page they can see', async () => {
    // The nav order is code-defined, so a user who cannot see User
    // notifications lands on the next visible page rather than a 403.
    vi.mocked(useLoginInfo).mockReturnValue(
      mockLoginInfoWithScopes(['admin:token'])
    );

    render(await AdminPage());

    expect(replace).toHaveBeenCalledWith('/admin/service-tokens');
  });

  test('shows the empty state, and does not redirect, for a user with no admin page scopes', async () => {
    vi.mocked(useLoginInfo).mockReturnValue(
      mockLoginInfoWithScopes(['read:tap'])
    );

    render(await AdminPage());

    expect(replace).not.toHaveBeenCalled();
    expect(
      screen.getByText(/no admin pages are available for your account/i)
    ).toBeInTheDocument();
  });

  test('renders an h1 heading with the empty state', async () => {
    // Nothing redirects the page away, so it needs a top-level heading like
    // every other page.
    vi.mocked(useLoginInfo).mockReturnValue(mockLoginInfoWithScopes([]));

    render(await AdminPage());

    expect(
      screen.getByRole('heading', { level: 1, name: /admin/i })
    ).toBeInTheDocument();
  });

  test('waits for login info before deciding, so an admin never flashes the empty state', async () => {
    vi.mocked(useLoginInfo).mockReturnValue(
      mockLoginInfoWithScopes([], /* isLoading */ true)
    );

    render(await AdminPage());

    expect(replace).not.toHaveBeenCalled();
    expect(
      screen.queryByText(/no admin pages are available/i)
    ).not.toBeInTheDocument();
  });

  test('shows the empty state when login info could not be fetched', async () => {
    vi.mocked(useLoginInfo).mockReturnValue({
      loginInfo: null,
      query: null,
      csrfToken: null,
      isLoading: false,
      isPending: false,
      error: null,
      refetch: vi.fn(),
    });

    render(await AdminPage());

    expect(replace).not.toHaveBeenCalled();
    expect(
      screen.getByText(/no admin pages are available for your account/i)
    ).toBeInTheDocument();
  });
});
