import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

// useGafaelfawrUser comes from @lsst-sqre/squared. Mock it while keeping the
// real PrimaryNavigation / Badge / getLogoutUrl exports so the menu still
// renders.
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

// useUnreadNotificationCount feeds the trigger badge and menu-item label.
vi.mock('@lsst-sqre/semaphore-client', () => ({
  useUnreadNotificationCount: vi.fn(),
}));

vi.mock('../../hooks/useRepertoireUrl', () => ({
  useRepertoireUrl: vi.fn(() => undefined),
}));

vi.mock('../../hooks/useSemaphoreUrl', () => ({
  useSemaphoreUrl: vi.fn(),
}));

vi.mock('../../hooks/useStaticConfig', () => ({
  useStaticConfig: vi.fn(),
}));

import type { UseLoginInfoReturn } from '@lsst-sqre/gafaelfawr-client';
// Import after mocking
import { useLoginInfo } from '@lsst-sqre/gafaelfawr-client';
import { useUnreadNotificationCount } from '@lsst-sqre/semaphore-client';
import { PrimaryNavigation, useGafaelfawrUser } from '@lsst-sqre/squared';
import { useSemaphoreUrl } from '../../hooks/useSemaphoreUrl';
import { useStaticConfig } from '../../hooks/useStaticConfig';
import type { AppConfig } from '../../lib/config/loader';
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

// Helper: set the resolved static config, defaulting the notifications keys.
function mockConfig(overrides: Partial<AppConfig> = {}) {
  vi.mocked(useStaticConfig).mockReturnValue({
    enableUserNotifications: false,
    userNotificationsPollIntervalSeconds: 300,
    ...overrides,
  } as AppConfig);
}

// Helper: set the unread-count hook return.
function mockUnreadCount(count: number | undefined) {
  vi.mocked(useUnreadNotificationCount).mockReturnValue({
    count,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  });
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
    // Sensible defaults: feature flag off, Semaphore discovered, no unread
    // count, and no scopes. Individual tests override as needed.
    mockConfig();
    vi.mocked(useSemaphoreUrl).mockReturnValue('https://example.com/semaphore');
    mockUnreadCount(undefined);
    vi.mocked(useLoginInfo).mockReturnValue(mockLoginInfoWithScopes([]));
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

  test('marks the decorative trigger chevron as aria-hidden', () => {
    mockUser();

    const { container } = renderMenu();

    // The chevron is purely decorative — the trigger already reads out the
    // username — so it must be hidden from assistive technology.
    const chevron = container.querySelector('svg.lucide-chevron-down');
    expect(chevron).not.toBeNull();
    expect(chevron).toHaveAttribute('aria-hidden', 'true');
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

  describe('user notifications', () => {
    test('shows a count badge and "{n} unread messages" item when the flag is on and unread > 0', async () => {
      const user = userEvent.setup();
      mockUser();
      mockConfig({ enableUserNotifications: true });
      mockUnreadCount(3);

      renderMenu();

      // The unread badge appears on the username trigger before opening.
      expect(
        screen.getByLabelText('3 unread notifications')
      ).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /testuser/i }));

      const item = screen.getByRole('link', { name: '3 unread messages' });
      expect(item).toHaveAttribute('href', '/notifications');
    });

    test('uses singular wording when there is exactly one unread message', async () => {
      const user = userEvent.setup();
      mockUser();
      mockConfig({ enableUserNotifications: true });
      mockUnreadCount(1);

      renderMenu();

      // The badge aria-label is singular for a single notification.
      expect(
        screen.getByLabelText('1 unread notification')
      ).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /testuser/i }));

      const item = screen.getByRole('link', { name: '1 unread message' });
      expect(item).toHaveAttribute('href', '/notifications');
    });

    test('shows a "Notifications" item and no badge when the flag is on and unread is 0', async () => {
      const user = userEvent.setup();
      mockUser();
      mockConfig({ enableUserNotifications: true });
      mockUnreadCount(0);

      renderMenu();

      // No count badge on the trigger when there is nothing unread.
      expect(
        screen.queryByLabelText(/unread notifications/i)
      ).not.toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /testuser/i }));

      const item = screen.getByRole('link', { name: 'Notifications' });
      expect(item).toHaveAttribute('href', '/notifications');
      // The non-zero label is not used when the count is 0.
      expect(screen.queryByText(/unread messages/i)).not.toBeInTheDocument();
    });

    test('shows no notifications item and no badge when the flag is off', async () => {
      const user = userEvent.setup();
      mockUser();
      mockConfig({ enableUserNotifications: false });
      mockUnreadCount(3);

      renderMenu();

      // No badge even though the (disabled) hook reports a count.
      expect(
        screen.queryByLabelText(/unread notifications/i)
      ).not.toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /testuser/i }));

      // The menu is open (Settings is visible) but there is no notifications
      // entry.
      expect(
        screen.getByRole('link', { name: 'Settings' })
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('link', { name: /notifications/i })
      ).not.toBeInTheDocument();
    });

    test('feeds the unread count from useUnreadNotificationCount with the configured poll interval', () => {
      mockUser();
      mockConfig({
        enableUserNotifications: true,
        userNotificationsPollIntervalSeconds: 120,
      });
      mockUnreadCount(1);

      renderMenu();

      // The hook is called with the discovered Semaphore URL and the
      // configured poll cadence (the hook itself converts seconds to ms).
      expect(useUnreadNotificationCount).toHaveBeenCalledWith(
        'https://example.com/semaphore',
        { pollIntervalSeconds: 120 }
      );
    });
  });
});
