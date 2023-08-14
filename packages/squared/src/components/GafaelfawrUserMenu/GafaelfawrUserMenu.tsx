import React from 'react';

export interface GafaelfawrUserMenuProps {
  children: React.ReactNode;
  loggedIn: boolean; // temp shim for useGafaelfawrUser
}

export const GafaelfawrUserMenu = ({
  children,
  loggedIn,
}: GafaelfawrUserMenuProps) => {
  if (loggedIn) {
    return <p>Log out</p>;
  } else {
    return <p>Log in / Sign up</p>;
  }
};

export default GafaelfawrUserMenu;
