import { render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

// Mock the RSC config loader so generateMetadata can run without the
// filesystem-backed config.
vi.mock('../../../../lib/config/rsc', () => ({
  getStaticConfig: vi.fn(),
}));

// The page body is stubbed: this suite is about the scope gate around it, not
// about the create flow (covered by NewOIDCClientPageClient's own tests).
vi.mock('./NewOIDCClientPageClient', () => ({
  default: () => <div>New OIDC client page body</div>,
}));

// The gate composes AuthRequired (useUserInfo) with the page scope check
// (useLoginInfo) against the `adminPageScopes` config.
vi.mock('@lsst-sqre/gafaelfawr-client', () => ({
  useUserInfo: vi.fn(),
  useLoginInfo: vi.fn(),
}));

vi.mock('../../../../hooks/useRepertoireUrl', () => ({
  useRepertoireUrl: vi.fn(() => undefined),
}));

vi.mock('../../../../hooks/useStaticConfig', () => ({
  useStaticConfig: vi.fn(),
}));

import type {
  UseLoginInfoReturn,
  UseUserInfoReturn,
} from '@lsst-sqre/gafaelfawr-client';
// Import after mocking.
import { useLoginInfo, useUserInfo } from '@lsst-sqre/gafaelfawr-client';
import {
  type AppConfigContextValue,
  useStaticConfig,
} from '../../../../hooks/useStaticConfig';
import type { AppConfig } from '../../../../lib/config/loader';
import { getStaticConfig } from '../../../../lib/config/rsc';
import NewOIDCClientPage, { generateMetadata } from './page';

function makeConfig(overrides: Partial<AppConfig> = {}): AppConfig {
  return {
    siteName: 'Rubin Science Platform',
    ...overrides,
  } as AppConfig;
}

function renderPageWithScopes(scopes: string[]) {
  vi.mocked(useStaticConfig).mockReturnValue(
    makeConfig() as AppConfigContextValue
  );
  vi.mocked(useUserInfo).mockReturnValue({
    userInfo: { username: 'testuser' } as UseUserInfoReturn['userInfo'],
    query: null,
    isLoggedIn: true,
    isLoading: false,
    isPending: false,
    error: null,
    refetch: vi.fn(),
  });
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

  render(<NewOIDCClientPage />);
}

describe('NewOIDCClientPage generateMetadata', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('sets the page title from config.siteName', async () => {
    vi.mocked(getStaticConfig).mockResolvedValue(makeConfig());

    const metadata = await generateMetadata();

    expect(metadata.title).toBe(
      'Register an OIDC client | Rubin Science Platform'
    );
  });

  test('uses the configured siteName when it differs', async () => {
    vi.mocked(getStaticConfig).mockResolvedValue(
      makeConfig({ siteName: 'Telescope Ops' })
    );

    const metadata = await generateMetadata();

    expect(metadata.title).toBe('Register an OIDC client | Telescope Ops');
  });
});

describe('NewOIDCClientPage scope gate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders the page for a user holding the oidcClients scope', () => {
    renderPageWithScopes(['admin:oidc']);

    expect(screen.getByText('New OIDC client page body')).toBeInTheDocument();
  });

  test('renders the unauthorized note for a direct visit without the scope', () => {
    // A user who holds another admin page's scope passes the section gate in
    // the layout, so arriving here directly must be refused in-page rather
    // than offering a form whose submit would 403.
    renderPageWithScopes(['admin:token']);

    expect(
      screen.getByRole('heading', { name: /unauthorized/i })
    ).toBeInTheDocument();
    expect(screen.getByText('admin:oidc')).toBeInTheDocument();
    expect(
      screen.queryByText('New OIDC client page body')
    ).not.toBeInTheDocument();
  });
});
