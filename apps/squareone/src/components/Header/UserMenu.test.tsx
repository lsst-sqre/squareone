import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

// useUserInfo provides the username on the menu trigger.
vi.mock('../../hooks/useUserInfo', () => ({
  useUserInfo: vi.fn(),
}));

// useLoginInfo provides the scopes that gate the Admin link.
vi.mock('../../hooks/useLoginInfo', () => ({
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

// Import after mocking
import {
  mockUserInfo,
  type UseLoginInfoReturn,
} from '@lsst-sqre/gafaelfawr-client';
import { useUnreadNotificationCount } from '@lsst-sqre/semaphore-client';
import { PrimaryNavigation } from '@lsst-sqre/squared';
import { useLoginInfo } from '../../hooks/useLoginInfo';
import { useSemaphoreUrl } from '../../hooks/useSemaphoreUrl';
import { useStaticConfig } from '../../hooks/useStaticConfig';
import { useUserInfo } from '../../hooks/useUserInfo';
import type { StaticConfig } from '../../lib/config/resolveConfigDefaults';
import UserMenu from './UserMenu';

// Helper: a logged-in useUserInfo return.
function mockUser(username = 'testuser') {
  vi.mocked(useUserInfo).mockReturnValue({
    userInfo: { ...mockUserInfo, username },
    query: null,
    isLoggedIn: true,
    isLoading: false,
    isPending: false,
    error: null,
    refetch: vi.fn(),
  });
}

// Helper: a useLoginInfo return whose query reports the given scopes.
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

// Helper: set the resolved static config, defaulting the notifications keys.
function mockConfig(overrides: Partial<StaticConfig> = {}) {
  vi.mocked(useStaticConfig).mockReturnValue({
    enableUserNotifications: false,
    userNotificationsPollIntervalSeconds: 300,
    ...overrides,
  } as StaticConfig);
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

  test('shows an Admin link to /admin for any configured admin page scope', async () => {
    const user = userEvent.setup();
    mockUser();
    // admin:oidc grants only the OIDC clients page — there is no single
    // "admin" scope, so any page's scope is enough to offer the link.
    vi.mocked(useLoginInfo).mockReturnValue(
      mockLoginInfoWithScopes(['admin:oidc'])
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

  test('does not show an Admin link when the user holds no admin scope', async () => {
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
