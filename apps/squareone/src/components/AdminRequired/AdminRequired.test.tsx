import { render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import AdminRequired from './AdminRequired';

// Mock the gafaelfawr hooks. AdminRequired composes AuthRequired (which checks
// login via useUserInfo) and additionally gates on the configured admin scopes
// via useLoginInfo.
vi.mock('@lsst-sqre/gafaelfawr-client', () => ({
  useUserInfo: vi.fn(),
  useLoginInfo: vi.fn(),
}));

vi.mock('../../hooks/useRepertoireUrl', () => ({
  useRepertoireUrl: vi.fn(() => undefined),
}));

// The scopes the gate checks come from `adminPageScopes` in the app config.
vi.mock('../../hooks/useStaticConfig', () => ({
  useStaticConfig: vi.fn(),
}));

import type {
  UseLoginInfoReturn,
  UseUserInfoReturn,
} from '@lsst-sqre/gafaelfawr-client';
// Import after mocking
import { useLoginInfo, useUserInfo } from '@lsst-sqre/gafaelfawr-client';
import {
  type AppConfigContextValue,
  useStaticConfig,
} from '../../hooks/useStaticConfig';
import type { AdminPageScopes } from '../../lib/config/adminPageScopes';

// Helper: an authenticated useUserInfo return (so AuthRequired renders through
// to the scope gate).
function mockAuthenticated(isLoading = false): UseUserInfoReturn {
  return {
    userInfo: { username: 'testuser' } as UseUserInfoReturn['userInfo'],
    query: null,
    isLoggedIn: true,
    isLoading,
    isPending: false,
    error: null,
    refetch: vi.fn(),
  };
}

// Helper: a useLoginInfo return whose query reports the given scopes.
function mockLoginInfoWithScopes(
  scopes: string[],
  isLoading = false
): UseLoginInfoReturn {
  return {
    loginInfo: null,
    query: {
      scopes,
      hasScope: (scope: string) => scopes.includes(scope),
    } as UseLoginInfoReturn['query'],
    csrfToken: null,
    isLoading,
    isPending: false,
    error: null,
    refetch: vi.fn(),
  };
}

// Helper: set the resolved static config. Omitting `adminPageScopes` exercises
// the baked-in defaults, which is what a deployment that has not configured the
// key sees.
function mockConfig(adminPageScopes?: AdminPageScopes) {
  vi.mocked(useStaticConfig).mockReturnValue({
    siteName: 'Rubin Science Platform',
    ...(adminPageScopes ? { adminPageScopes } : {}),
  } as AppConfigContextValue);
}

describe('AdminRequired', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockConfig();
    vi.mocked(useUserInfo).mockReturnValue(mockAuthenticated());
  });

  test('renders children for a user holding any configured page scope', () => {
    // admin:token grants only the service-tokens page, which is enough to be
    // in the admin section at all.
    vi.mocked(useLoginInfo).mockReturnValue(
      mockLoginInfoWithScopes(['admin:token'])
    );

    render(<AdminRequired>Admin Content</AdminRequired>);

    expect(screen.getByText('Admin Content')).toBeInTheDocument();
    expect(screen.queryByText(/unauthorized/i)).not.toBeInTheDocument();
  });

  test('renders children for exec:admin because the sentry page defaults to it', () => {
    vi.mocked(useLoginInfo).mockReturnValue(
      mockLoginInfoWithScopes(['exec:admin'])
    );

    render(<AdminRequired>Admin Content</AdminRequired>);

    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });

  test('refuses exec:admin when no configured page lists it', () => {
    // exec:admin is no longer privileged in its own right: it opens the admin
    // section only because a page's configured scopes name it.
    mockConfig({
      notifications: ['admin:notifications'],
      serviceTokens: ['admin:token'],
      oidcClients: ['admin:oidc'],
      sentry: ['admin:observability'],
    });
    vi.mocked(useLoginInfo).mockReturnValue(
      mockLoginInfoWithScopes(['exec:admin'])
    );

    render(<AdminRequired>Admin Content</AdminRequired>);

    expect(
      screen.getByRole('heading', { name: /unauthorized/i })
    ).toBeInTheDocument();
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });

  test('renders an unauthorized state for a logged-in user with no admin scopes', () => {
    vi.mocked(useLoginInfo).mockReturnValue(
      mockLoginInfoWithScopes(['read:tap', 'exec:notebook'])
    );

    render(<AdminRequired>Admin Content</AdminRequired>);

    expect(
      screen.getByRole('heading', { name: /unauthorized/i })
    ).toBeInTheDocument();
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });

  test('names every scope that would have granted access', () => {
    vi.mocked(useLoginInfo).mockReturnValue(mockLoginInfoWithScopes([]));

    render(<AdminRequired>Admin Content</AdminRequired>);

    for (const scope of [
      'admin:notifications',
      'admin:token',
      'admin:oidc',
      'exec:admin',
    ]) {
      expect(screen.getByText(scope)).toBeInTheDocument();
    }
  });

  test('renders an unauthorized state when the login-info fetch fails (query is null)', () => {
    vi.mocked(useLoginInfo).mockReturnValue({
      loginInfo: null,
      query: null,
      csrfToken: null,
      isLoading: false,
      isPending: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<AdminRequired>Admin Content</AdminRequired>);

    expect(
      screen.getByRole('heading', { name: /unauthorized/i })
    ).toBeInTheDocument();
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });

  test('renders a loading state while login info is loading', () => {
    vi.mocked(useLoginInfo).mockReturnValue(mockLoginInfoWithScopes([], true));

    render(<AdminRequired>Admin Content</AdminRequired>);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
    expect(screen.queryByText(/unauthorized/i)).not.toBeInTheDocument();
  });

  describe('with a pageId', () => {
    test('renders children when the user holds that page’s scope', () => {
      vi.mocked(useLoginInfo).mockReturnValue(
        mockLoginInfoWithScopes(['admin:token'])
      );

      render(
        <AdminRequired pageId="serviceTokens">Token Content</AdminRequired>
      );

      expect(screen.getByText('Token Content')).toBeInTheDocument();
    });

    test('refuses a user who holds a different admin page’s scope', () => {
      // The section-wide union would let this user in; the page's own scope
      // list is what decides here.
      vi.mocked(useLoginInfo).mockReturnValue(
        mockLoginInfoWithScopes(['admin:notifications'])
      );

      render(
        <AdminRequired pageId="serviceTokens">Token Content</AdminRequired>
      );

      expect(
        screen.getByRole('heading', { name: /unauthorized/i })
      ).toBeInTheDocument();
      expect(screen.queryByText('Token Content')).not.toBeInTheDocument();
      expect(screen.getByText('admin:token')).toBeInTheDocument();
    });

    test('follows a deployment override of that page’s scopes', () => {
      mockConfig({ serviceTokens: ['admin:tokens-custom'] });
      vi.mocked(useLoginInfo).mockReturnValue(
        mockLoginInfoWithScopes(['admin:tokens-custom'])
      );

      render(
        <AdminRequired pageId="serviceTokens">Token Content</AdminRequired>
      );

      expect(screen.getByText('Token Content')).toBeInTheDocument();
    });
  });
});
