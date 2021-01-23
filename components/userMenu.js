/* Menu for a user profile and settings, built on @react/menu-button. */

import PropTypes from 'prop-types';
import { Menu, MenuList, MenuButton, MenuItem } from '@reach/menu-button';
import '@reach/menu-button/styles.css';

import { getLogoutUrl } from '../utils/client/url';

export const UserMenu = ({ loginData, pageUrl }) => (
  <Menu>
    <MenuButton>{loginData.data.name}</MenuButton>
    <MenuList>
      <MenuItem>
        <a href="/auth/tokens">Security tokens</a>
      </MenuItem>
      <MenuItem>
        <a href={getLogoutUrl(pageUrl)}>Log out</a>
      </MenuItem>
    </MenuList>
  </Menu>
);

UserMenu.propTypes = {
  loginData: PropTypes.object,
  pageUrl: PropTypes.string,
};
