/* Menu for a user profile and settings, built on @react/menu-button. */

import PropTypes from 'prop-types';
import { Menu, MenuList, MenuButton, MenuLink } from '@reach/menu-button';
import '@reach/menu-button/styles.css';

import { getLogoutUrl } from '../utils/url';

export const UserMenu = ({ loginData, pageUrl }) => {
  const logoutUrl = getLogoutUrl(pageUrl);

  return (
    <Menu>
      <MenuButton>{loginData.data.name}</MenuButton>
      <MenuList>
        <MenuLink href="/auth/tokens">Security tokens</MenuLink>
        <MenuLink href={logoutUrl}>Log out</MenuLink>
      </MenuList>
    </Menu>
  );
};

UserMenu.propTypes = {
  loginData: PropTypes.object,
  pageUrl: PropTypes.instanceOf(URL),
};
