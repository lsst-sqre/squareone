import React from 'react';
/* Menu for a user profile and settings. */

import {
  getLogoutUrl,
  PrimaryNavigation,
  useGafaelfawrUser,
} from '@lsst-sqre/squared';
import NextLink from 'next/link';
import { ChevronDown } from 'react-feather';

type UserMenuProps = {
  pageUrl: URL;
};

export default function UserMenu({ pageUrl }: UserMenuProps) {
  const { user } = useGafaelfawrUser();
  const logoutUrl = getLogoutUrl(pageUrl.toString());

  // User data should be available when this component is rendered
  // since Login component handles the hydration logic
  if (!user) {
    return null;
  }

  return (
    <>
      <PrimaryNavigation.Trigger>
        {user.username} <ChevronDown />
      </PrimaryNavigation.Trigger>
      <PrimaryNavigation.Content>
        <PrimaryNavigation.ContentItem>
          <PrimaryNavigation.Link asChild>
            <NextLink href="/settings">Settings</NextLink>
          </PrimaryNavigation.Link>
        </PrimaryNavigation.ContentItem>
        <PrimaryNavigation.ContentItem>
          <PrimaryNavigation.Link href={logoutUrl}>
            Log out
          </PrimaryNavigation.Link>
        </PrimaryNavigation.ContentItem>
      </PrimaryNavigation.Content>
    </>
  );
}
