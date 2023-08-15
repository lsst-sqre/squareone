import React from 'react';

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
}

export const GafaelfawrUserMenu = ({
  children,
  loggedIn,
  loginHref,
}: GafaelfawrUserMenuProps) => {
  if (loggedIn) {
    return <p>Log out</p>;
  } else {
    return <a href={loginHref}>Log in / Sign up</a>;
  }
};

export default GafaelfawrUserMenu;
