/* Menu for a user profile and settings. */

import PropTypes from 'prop-types';
import getConfig from 'next/config';
import { ChevronDown } from 'react-feather';
import { PrimaryNavigation } from '@lsst-sqre/squared';
import { useGafaelfawrUser } from '@lsst-sqre/squared';
import { getLogoutUrl } from '@lsst-sqre/squared';

export default function UserMenu({ pageUrl }) {
  const { publicRuntimeConfig } = getConfig();
  const { coManageRegistryUrl } = publicRuntimeConfig;
  const { user } = useGafaelfawrUser();
  const logoutUrl = getLogoutUrl(pageUrl);

  if (!user) {
    return <></>;
  }

  return (
    <>
      <PrimaryNavigation.Trigger>
        {user.username} <ChevronDown />
      </PrimaryNavigation.Trigger>
      <PrimaryNavigation.Content>
        {coManageRegistryUrl && (
          <PrimaryNavigation.ContentItem>
            <PrimaryNavigation.Link href={coManageRegistryUrl}>
              Account settings
            </PrimaryNavigation.Link>
          </PrimaryNavigation.ContentItem>
        )}
        <PrimaryNavigation.ContentItem>
          <PrimaryNavigation.Link href="/auth/tokens">
            Security tokens
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

UserMenu.propTypes = {
  pageUrl: PropTypes.instanceOf(URL),
};
