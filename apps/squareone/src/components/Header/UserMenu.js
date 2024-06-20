/* Menu for a user profile and settings, built on @react/menu-button. */

import PropTypes from 'prop-types';
import getConfig from 'next/config';
import { GafaelfawrUserMenu } from '@lsst-sqre/squared';

export default function UserMenu({ pageUrl }) {
  const { publicRuntimeConfig } = getConfig();
  const { coManageRegistryUrl } = publicRuntimeConfig;

  return (
    <GafaelfawrUserMenu currentUrl={pageUrl}>
      {coManageRegistryUrl && (
        <GafaelfawrUserMenu.Link href={coManageRegistryUrl}>
          Account Settings
        </GafaelfawrUserMenu.Link>
      )}
      <GafaelfawrUserMenu.Link href="/auth/tokens">
        Security tokens
      </GafaelfawrUserMenu.Link>
    </GafaelfawrUserMenu>
  );
}

UserMenu.propTypes = {
  pageUrl: PropTypes.instanceOf(URL),
};
