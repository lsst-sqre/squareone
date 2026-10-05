import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

// AdminLayoutClient composes AdminRequired (login via useUserInfo, scope gate
// via useUserInfo) and the sidebar, so both auth hooks are mocked.
vi.mock('../../hooks/useUserInfo', () => ({
  useUserInfo: vi.fn(),
}));

vi.mock('../../hooks/useUserScopes', () => ({
  useUserScopes: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  usePathname: () => '/admin/sentry',
}));

// AdminRequired resolves `adminPageScopes` through the config hook rather than
// the config prop this layout threads to the navigation.
vi.mock('../../hooks/useStaticConfig', () => ({
  useStaticConfig: vi.fn(),
}));

import type {
  UseUserInfoReturn,
  UseUserScopesReturn,
} from '@lsst-sqre/gafaelfawr-client';
import {
  type AppConfigContextValue,
  useStaticConfig,
} from '../../hooks/useStaticConfig';
import { useUserInfo } from '../../hooks/useUserInfo';
// Import after mocking.
import { useUserScopes } from '../../hooks/useUserScopes';
import AdminLayoutClient from './AdminLayoutClient';

const config = { siteName: 'Rubin Science Platform' } as AppConfigContextValue;

// Helper: a useUserScopes return reporting the given scopes.
function mockUserScopes(
  scopes: string[],
  isLoading = false
): UseUserScopesReturn {
  return {
    scopes,
    hasScope: (scope: string) => scopes.includes(scope),
    isLoading,
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
  vi.mocked(useUserScopes).mockReturnValue(mockUserScopes(scopes));
  vi.mocked(useStaticConfig).mockReturnValue(config);

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
