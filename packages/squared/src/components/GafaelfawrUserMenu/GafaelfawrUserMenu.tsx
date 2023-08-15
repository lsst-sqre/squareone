import React from 'react';

import styled from 'styled-components';

import Menu from './Menu';
import Separator from './Separator';
import MenuItem from './MenuItem';
import useGafaelfawrUser from '../../hooks/useGafaelfawrUser';

export interface GafaelfawrUserMenuProps {
  children: React.ReactNode;
  /**
   * The URL to which the user should be redirected to log in.
   */
  loginHref: string;
  /**
   * The URL to use for the logout link. This is the Gafaelfawr logout endpoint.
   */
  logoutHref: string;
}

export const GafaelfawrUserMenu = ({
  children,
  loginHref = '/login',
  logoutHref = '/logout',
}: GafaelfawrUserMenuProps) => {
  const { user, isLoggedIn } = useGafaelfawrUser();
  if (isLoggedIn && user) {
    return (
      <Menu logoutHref={logoutHref} username={user.username}>
        {children}
      </Menu>
    );
  } else {
    return <SiteNavLink href={loginHref}>Log in / Sign up</SiteNavLink>;
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
