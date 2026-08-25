import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

// AdminLayoutClient composes AdminRequired (login via useUserInfo, scope gate
// via useLoginInfo) and the sidebar, so both gafaelfawr hooks are mocked.
vi.mock('@lsst-sqre/gafaelfawr-client', () => ({
  useUserInfo: vi.fn(),
  useLoginInfo: vi.fn(),
}));

vi.mock('../../hooks/useRepertoireUrl', () => ({
  useRepertoireUrl: vi.fn(() => undefined),
}));

vi.mock('next/navigation', () => ({
  usePathname: () => '/admin/sentry',
}));

import type {
  UseLoginInfoReturn,
  UseUserInfoReturn,
} from '@lsst-sqre/gafaelfawr-client';
// Import after mocking.
import { useLoginInfo, useUserInfo } from '@lsst-sqre/gafaelfawr-client';
import type { AppConfigContextValue } from '../../hooks/useStaticConfig';
import AdminLayoutClient from './AdminLayoutClient';

const config = { siteName: 'Rubin Science Platform' } as AppConfigContextValue;

function mockLoginInfoWithScopes(scopes: string[]): UseLoginInfoReturn {
  return {
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
  };
}

function renderWithScopes(scopes: string[]) {
  vi.mocked(useUserInfo).mockReturnValue({
    userInfo: { username: 'testuser' } as UseUserInfoReturn['userInfo'],
    query: null,
    isLoggedIn: true,
    isLoading: false,
    isPending: false,
    error: null,
    refetch: vi.fn(),
  });
  vi.mocked(useLoginInfo).mockReturnValue(mockLoginInfoWithScopes(scopes));

  render(<AdminLayoutClient config={config}>Admin Content</AdminLayoutClient>);
}

describe('AdminLayoutClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('lists only the admin pages the user holds scopes for', () => {
    renderWithScopes(['exec:admin', 'admin:token']);

    expect(
      screen.getByRole('link', { name: 'Service tokens' })
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Sentry' })).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'User notifications' })
    ).not.toBeInTheDocument();
  });

  test('lists every admin page for a user holding all the admin scopes', () => {
    renderWithScopes(['exec:admin', 'admin:token', 'admin:notifications']);

    expect(
      screen.getByRole('link', { name: 'User notifications' })
    ).toBeInTheDocument();
  });
});
