/* Menu for a user profile and settings. */

import { ChevronDown } from 'react-feather';
import NextLink from 'next/link';
import { PrimaryNavigation } from '@lsst-sqre/squared';
import { useGafaelfawrUser } from '@lsst-sqre/squared';
import { getLogoutUrl } from '@lsst-sqre/squared';

type UserMenuProps = {
  pageUrl: URL;
};

export default function UserMenu({ pageUrl }: UserMenuProps) {
  const { user } = useGafaelfawrUser();
  const logoutUrl = getLogoutUrl(pageUrl.toString());

  // User data should be available when this component is rendered
  // since Login component handles the hydration logic
  if (!user) {
    return <></>;
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
