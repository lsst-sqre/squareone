import React from 'react';
/* Menu for a user profile and settings. */

import { useUnreadNotificationCount } from '@lsst-sqre/semaphore-client';
import {
  Badge,
  getLogoutUrl,
  PrimaryNavigation,
  useGafaelfawrUser,
} from '@lsst-sqre/squared';
import { ChevronDown } from 'lucide-react';
import NextLink from 'next/link';
import { useLoginInfo } from '../../hooks/useLoginInfo';
import { useSemaphoreUrl } from '../../hooks/useSemaphoreUrl';
import { useStaticConfig } from '../../hooks/useStaticConfig';
import { hasAnyAdminAccess } from '../../lib/config/adminPageScopes';

type UserMenuProps = {
  pageUrl: URL;
};

export default function UserMenu({ pageUrl }: UserMenuProps) {
  const { user } = useGafaelfawrUser();

  // The scopes gate the Admin link. Sentry reporting of login-info failures is
  // not this menu's job: the app's useLoginInfo hook (src/hooks) is the
  // chokepoint, attaching the reporter to every observer of the shared query.
  const { query } = useLoginInfo();
  const logoutUrl = getLogoutUrl(pageUrl.toString());

  const config = useStaticConfig();
  const { enableUserNotifications, userNotificationsPollIntervalSeconds } =
    config;
  const semaphoreUrl = useSemaphoreUrl();

  // The unread count drives the trigger badge and the menu-item label. The
  // query is gated on the feature flag by passing an empty URL when the flag
  // is off — the hook treats an empty URL as "no service" and stays disabled,
  // so no request is made until the flag is on and Semaphore is discovered.
  const { count } = useUnreadNotificationCount(
    enableUserNotifications ? (semaphoreUrl ?? '') : '',
    { pollIntervalSeconds: userNotificationsPollIntervalSeconds }
  );
  const unreadCount = count ?? 0;

  // The link appears for anyone who can reach at least one admin page under
  // the deployment's `adminPageScopes` mapping — the same union rule
  // `AdminRequired` applies to the section, so the link never leads to the
  // gate's unauthorized state.
  const isAdmin = hasAnyAdminAccess(config, query?.scopes ?? []);

  // User data should be available when this component is rendered
  // since Login component handles the hydration logic
  if (!user) {
    return null;
  }

  const showUnreadBadge = enableUserNotifications && unreadCount > 0;

  return (
    <>
      <PrimaryNavigation.Trigger>
        {showUnreadBadge && (
          <Badge
            color="blue"
            radius="full"
            size="sm"
            aria-label={`${unreadCount} unread notification${
              unreadCount === 1 ? '' : 's'
            }`}
          >
            {unreadCount}
          </Badge>
        )}{' '}
        {user.username}
        {/* Decorative disclosure indicator; the trigger already names itself. */}
        <ChevronDown aria-hidden="true" />
      </PrimaryNavigation.Trigger>
      <PrimaryNavigation.Content>
        <PrimaryNavigation.ContentItem>
          <PrimaryNavigation.Link asChild>
            <NextLink href="/settings">Settings</NextLink>
          </PrimaryNavigation.Link>
        </PrimaryNavigation.ContentItem>
        {enableUserNotifications && (
          <PrimaryNavigation.ContentItem>
            <PrimaryNavigation.Link asChild>
              <NextLink href="/notifications">
                {unreadCount > 0
                  ? `${unreadCount} unread message${
                      unreadCount === 1 ? '' : 's'
                    }`
                  : 'Notifications'}
              </NextLink>
            </PrimaryNavigation.Link>
          </PrimaryNavigation.ContentItem>
        )}
        {isAdmin && (
          <PrimaryNavigation.ContentItem>
            <PrimaryNavigation.Link asChild>
              <NextLink href="/admin">Admin</NextLink>
            </PrimaryNavigation.Link>
          </PrimaryNavigation.ContentItem>
        )}
        <PrimaryNavigation.ContentItem>
          <PrimaryNavigation.Link href={logoutUrl}>
            Log out
          </PrimaryNavigation.Link>
        </PrimaryNavigation.ContentItem>
      </PrimaryNavigation.Content>
    </>
  );
}
