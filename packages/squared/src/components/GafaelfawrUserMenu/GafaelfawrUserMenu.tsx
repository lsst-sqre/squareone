import React from 'react';

import styled from 'styled-components';

import Menu from './Menu';

export interface GafaelfawrUserMenuProps {
  children: React.ReactNode;
  /**
   * Whether the user is logged in. This is a temporary shim until we have a
   * proper useGafaelfawrUser hook.
   */
  loggedIn: boolean; // temp shim for useGafaelfawrUser
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
  loggedIn,
  loginHref = '/login',
  logoutHref = '/logout',
}: GafaelfawrUserMenuProps) => {
  if (loggedIn) {
    return <Menu logoutHref={logoutHref} />;
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

export default GafaelfawrUserMenu;
