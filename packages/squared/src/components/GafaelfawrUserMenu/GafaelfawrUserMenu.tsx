import React from 'react';

export interface GafaelfawrUserMenuProps {
  children: React.ReactNode;
}

export const GafaelfawrUserMenu = ({ children }: GafaelfawrUserMenuProps) => {
  const hi = 'Hello world';
  return <p>{hi}</p>;
};

export default GafaelfawrUserMenu;
