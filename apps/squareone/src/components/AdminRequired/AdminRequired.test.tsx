import { render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import AdminRequired from './AdminRequired';

// Mock the gafaelfawr hooks. AdminRequired composes AuthRequired (which checks
// login via useUserInfo) and additionally gates on the exec:admin scope via
// useLoginInfo.
vi.mock('@lsst-sqre/gafaelfawr-client', () => ({
  useUserInfo: vi.fn(),
  useLoginInfo: vi.fn(),
}));

vi.mock('../../hooks/useRepertoireUrl', () => ({
  useRepertoireUrl: vi.fn(() => undefined),
}));

import type {
  UseLoginInfoReturn,
  UseUserInfoReturn,
} from '@lsst-sqre/gafaelfawr-client';
// Import after mocking
import { useLoginInfo, useUserInfo } from '@lsst-sqre/gafaelfawr-client';

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
      hasScope: (scope: string) => scopes.includes(scope),
    } as UseLoginInfoReturn['query'],
    csrfToken: null,
    isLoading,
    isPending: false,
    error: null,
    refetch: vi.fn(),
  };
}

describe('AdminRequired', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders children when the user has the exec:admin scope', () => {
    vi.mocked(useUserInfo).mockReturnValue(mockAuthenticated());
    vi.mocked(useLoginInfo).mockReturnValue(
      mockLoginInfoWithScopes(['exec:admin'])
    );

    render(<AdminRequired>Admin Content</AdminRequired>);

    expect(screen.getByText('Admin Content')).toBeInTheDocument();
    expect(screen.queryByText(/unauthorized/i)).not.toBeInTheDocument();
  });

  test('renders an unauthorized state for a logged-in user lacking the scope', () => {
    vi.mocked(useUserInfo).mockReturnValue(mockAuthenticated());
    vi.mocked(useLoginInfo).mockReturnValue(
      mockLoginInfoWithScopes(['read:tap', 'exec:notebook'])
    );

    render(<AdminRequired>Admin Content</AdminRequired>);

    expect(
      screen.getByRole('heading', { name: /unauthorized/i })
    ).toBeInTheDocument();
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });

  test('renders an unauthorized state when the login-info fetch fails (query is null)', () => {
    vi.mocked(useUserInfo).mockReturnValue(mockAuthenticated());
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
    vi.mocked(useUserInfo).mockReturnValue(mockAuthenticated());
    vi.mocked(useLoginInfo).mockReturnValue(mockLoginInfoWithScopes([], true));

    render(<AdminRequired>Admin Content</AdminRequired>);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
    expect(screen.queryByText(/unauthorized/i)).not.toBeInTheDocument();
  });
});
