import React from 'react';

import styled from 'styled-components';

import Menu from './Menu';
import Separator from './Separator';
import MenuItem from './MenuItem';
import { getLoginUrl, getLogoutUrl } from './authUrls';
import useGafaelfawrUser from '../../hooks/useGafaelfawrUser';

export interface GafaelfawrUserMenuProps {
  children: React.ReactNode;
  /**
   * The URL of the current page. Used to construct the login and logout URLs
   * with appropriate redirects.
   */
  currentUrl: string;
}

export const GafaelfawrUserMenu = ({
  children,
  currentUrl,
}: GafaelfawrUserMenuProps) => {
  const { user, isLoggedIn } = useGafaelfawrUser();
  // TODO: it'd be nice to integrate the useCurrentUrl hook into
  // this component so the user doesn't have to pass this prop.
  const logoutUrl = getLogoutUrl(currentUrl);
  const loginUrl = getLoginUrl(currentUrl);
  if (isLoggedIn && user) {
    return (
      <Menu logoutHref={logoutUrl} username={user.username}>
        {children}
      </Menu>
    );
  } else {
    return <SiteNavLink href={loginUrl}>Log in / Sign up</SiteNavLink>;
  }
};

const SiteNavLink = styled.a`
  color: var(--rsd-component-header-nav-text-color);

  &:hover {
    color: var(--rsd-component-header-nav-text-hover-color);
  }
`;

// Associate child components with the parent for easier imports.
GafaelfawrUserMenu.Item = MenuItem;
GafaelfawrUserMenu.Separator = Separator;

export default GafaelfawrUserMenu;
