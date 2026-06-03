import React from 'react';
/* Menu for a user profile and settings. */

import { useLoginInfo } from '@lsst-sqre/gafaelfawr-client';
import {
  getLogoutUrl,
  PrimaryNavigation,
  useGafaelfawrUser,
} from '@lsst-sqre/squared';
import { ChevronDown } from 'lucide-react';
import NextLink from 'next/link';

import { useRepertoireUrl } from '../../hooks/useRepertoireUrl';

/** Gafaelfawr scope that unlocks the admin section. */
const ADMIN_SCOPE = 'exec:admin';

type UserMenuProps = {
  pageUrl: URL;
};

export default function UserMenu({ pageUrl }: UserMenuProps) {
  const { user } = useGafaelfawrUser();
  const repertoireUrl = useRepertoireUrl();
  const { query } = useLoginInfo(repertoireUrl);
  const logoutUrl = getLogoutUrl(pageUrl.toString());

  // Only admins (holders of the exec:admin scope) see the Admin link, mirroring
  // the client-side gate on the admin pages themselves.
  const isAdmin = query?.hasScope(ADMIN_SCOPE) ?? false;

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
