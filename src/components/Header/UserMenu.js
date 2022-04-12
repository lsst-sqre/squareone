/* Menu for a user profile and settings, built on @react/menu-button. */

import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Menu, MenuList, MenuButton, MenuLink } from '@reach/menu-button';
import '@reach/menu-button/styles.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { getLogoutUrl } from '../../lib/utils/url';
import useUserInfo from '../../hooks/useUserInfo';

const StyledMenuButton = styled(MenuButton)`
  background-color: transparent;
  color: var(--rsd-component-header-nav-text-color);
  border: none;

  &:hover {
    color: var(--rsd-component-header-nav-text-hover-color);
  }
`;

const StyledFontAwesomeIcon = styled(FontAwesomeIcon)`
  margin-left: 0.25em;
  font-size: 0.8em;
  opacity: 0.9;
`;

const StyledMenuList = styled(MenuList)`
  font-size: 1rem;
  background-color: var(--rsd-component-header-nav-menulist-background-color);
  width: 12rem;
  border-radius: 0.5rem;
  // Top margin is related to the triangle; see :before
  margin-top: 10px;
  color: var(--rsd-component-header-nav-menulist-text-color);
  a {
    color: var(--rsd-component-header-nav-menulist-text-color);
  }

  &:before {
    // Make a CSS triangle on the top of the menu
    content: '';
    border: 8px solid transparent;
    border-bottom: 8px solid
      var(--rsd-component-header-nav-menulist-background-color);
    position: absolute;
    display: inline-block;
    // Top is related to the border size and margin-top of menu list
    top: -5px;
    right: 9px;
    left: auto;
  }

  [data-reach-menu-item][data-selected] {
    background: var(--rsd-component-header-nav-menulist-selected-background-color);
  }
}
`;

export default function UserMenu({ pageUrl }) {
  const { userInfo } = useUserInfo();
  const logoutUrl = getLogoutUrl(pageUrl);

  return (
    <Menu>
      <StyledMenuButton>
        {userInfo.username} <StyledFontAwesomeIcon icon="angle-down" />
      </StyledMenuButton>
      <StyledMenuList>
        <MenuLink href="/auth/tokens">Security tokens</MenuLink>
        <MenuLink href={logoutUrl}>Log out</MenuLink>
      </StyledMenuList>
    </Menu>
  );
}

UserMenu.propTypes = {
  pageUrl: PropTypes.instanceOf(URL),
};
