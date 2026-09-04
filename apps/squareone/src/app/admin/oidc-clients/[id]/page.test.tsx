import { render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

// Mock the RSC config loader so generateMetadata can run without the
// filesystem-backed config.
vi.mock('../../../../lib/config/rsc', () => ({
  getStaticConfig: vi.fn(),
}));

// The page body is stubbed: this suite is about the scope gate around it, not
// about the detail flows (covered by OIDCClientDetailPageClient's own tests).
vi.mock('./OIDCClientDetailPageClient', () => ({
  default: ({ clientId }: { clientId: string }) => (
    <div>OIDC client detail body for {clientId}</div>
  ),
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
import OIDCClientDetailPage, { generateMetadata } from './page';

const CLIENT_ID = 'a1b2c3d4-0000-4000-8000-000000000001';

function makeConfig(overrides: Partial<AppConfig> = {}): AppConfig {
  return {
    siteName: 'Rubin Science Platform',
    ...overrides,
  } as AppConfig;
}

async function renderPageWithScopes(scopes: string[]) {
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

  render(
    await OIDCClientDetailPage({ params: Promise.resolve({ id: CLIENT_ID }) })
  );
}

describe('OIDCClientDetailPage generateMetadata', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('sets the page title from the route id and config.siteName', async () => {
    vi.mocked(getStaticConfig).mockResolvedValue(makeConfig());

    const metadata = await generateMetadata({
      params: Promise.resolve({ id: CLIENT_ID }),
    });

    expect(metadata.title).toBe(
      `OIDC client ${CLIENT_ID} | Rubin Science Platform`
    );
  });

  test('uses the configured siteName when it differs', async () => {
    vi.mocked(getStaticConfig).mockResolvedValue(
      makeConfig({ siteName: 'Telescope Ops' })
    );

    const metadata = await generateMetadata({
      params: Promise.resolve({ id: CLIENT_ID }),
    });

    expect(metadata.title).toBe(`OIDC client ${CLIENT_ID} | Telescope Ops`);
  });
});

describe('OIDCClientDetailPage scope gate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders the page for a user holding the oidcClients scope', async () => {
    await renderPageWithScopes(['admin:oidc']);

    expect(
      screen.getByText(`OIDC client detail body for ${CLIENT_ID}`)
    ).toBeInTheDocument();
  });

  test('renders the unauthorized note for a direct visit without the scope', async () => {
    // A user who holds another admin page's scope passes the section gate in
    // the layout, so arriving here directly — from a bookmark, or a link a
    // colleague shared — must be refused in-page.
    await renderPageWithScopes(['admin:token']);

    expect(
      screen.getByRole('heading', { name: /unauthorized/i })
    ).toBeInTheDocument();
    expect(screen.getByText('admin:oidc')).toBeInTheDocument();
    expect(
      screen.queryByText(`OIDC client detail body for ${CLIENT_ID}`)
    ).not.toBeInTheDocument();
  });
});
