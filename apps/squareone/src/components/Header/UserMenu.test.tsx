import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

// useGafaelfawrUser comes from @lsst-sqre/squared. Mock it while keeping the
// real PrimaryNavigation / getLogoutUrl exports so the menu still renders.
vi.mock('@lsst-sqre/squared', async () => {
  const actual =
    await vi.importActual<typeof import('@lsst-sqre/squared')>(
      '@lsst-sqre/squared'
    );
  return {
    ...actual,
    useGafaelfawrUser: vi.fn(),
  };
});

// useLoginInfo provides the exec:admin scope gate for the Admin link.
vi.mock('@lsst-sqre/gafaelfawr-client', () => ({
  useLoginInfo: vi.fn(),
}));

vi.mock('../../hooks/useRepertoireUrl', () => ({
  useRepertoireUrl: vi.fn(() => undefined),
}));

import type { UseLoginInfoReturn } from '@lsst-sqre/gafaelfawr-client';
// Import after mocking
import { useLoginInfo } from '@lsst-sqre/gafaelfawr-client';
import { PrimaryNavigation, useGafaelfawrUser } from '@lsst-sqre/squared';

import UserMenu from './UserMenu';

// Helper: a logged-in useGafaelfawrUser return.
function mockUser(username = 'testuser') {
  vi.mocked(useGafaelfawrUser).mockReturnValue({
    user: { username },
    isLoading: false,
    isValidating: false,
    isLoggedIn: true,
    error: undefined,
  } as ReturnType<typeof useGafaelfawrUser>);
}

// Helper: a useLoginInfo return whose query reports the given scopes.
function mockLoginInfoWithScopes(scopes: string[]): UseLoginInfoReturn {
  return {
    loginInfo: null,
    query: {
      hasScope: (scope: string) => scopes.includes(scope),
    } as UseLoginInfoReturn['query'],
    csrfToken: null,
    isLoading: false,
    isPending: false,
    error: null,
    refetch: vi.fn(),
  };
}

// Render the menu inside the navigation root it expects to live in.
function renderMenu() {
  return render(
    <PrimaryNavigation>
      <PrimaryNavigation.Item>
        <UserMenu pageUrl={new URL('https://example.com/')} />
      </PrimaryNavigation.Item>
    </PrimaryNavigation>
  );
}

describe('UserMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('shows an Admin link to /admin when the user has exec:admin', async () => {
    const user = userEvent.setup();
    mockUser();
    vi.mocked(useLoginInfo).mockReturnValue(
      mockLoginInfoWithScopes(['exec:admin'])
    );

    renderMenu();
    await user.click(screen.getByRole('button', { name: /testuser/i }));

    expect(screen.getByRole('link', { name: 'Admin' })).toHaveAttribute(
      'href',
      '/admin'
    );
  });

  test('does not show an Admin link when the user lacks exec:admin', async () => {
    const user = userEvent.setup();
    mockUser();
    vi.mocked(useLoginInfo).mockReturnValue(
      mockLoginInfoWithScopes(['read:tap', 'exec:notebook'])
    );

    renderMenu();
    await user.click(screen.getByRole('button', { name: /testuser/i }));

    // The menu is open (Settings is visible) but the Admin link is absent.
    expect(screen.getByRole('link', { name: 'Settings' })).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'Admin' })
    ).not.toBeInTheDocument();
  });
});
