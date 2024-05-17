import React from 'react';
import styled from 'styled-components';

import * as RadixDropdownMenu from '@radix-ui/react-dropdown-menu';
import { ChevronDown } from 'react-feather';

import MenuItem from './MenuItem';
import Separator from './Separator';

export interface MenuProps {
  children: React.ReactNode;
  /**
   * The URL to use for the logout link. This is the Gafaelfawr logout endpoint.
   */
  logoutHref: string;
  /**
   * The username to display in the menu trigger.
   */
  username: string;
}

export const Menu = ({ children, logoutHref, username }: MenuProps) => {
  return (
    <RadixDropdownMenu.Root>
      <RadixDropdownMenu.Trigger asChild>
        <MenuTriggerButton>
          {username} <ChevronDown />
        </MenuTriggerButton>
      </RadixDropdownMenu.Trigger>

      <RadixDropdownMenu.Portal>
        <StyledContent align="end" sideOffset={5}>
          {children}
          <Separator />
          <MenuItem>
            <a href={logoutHref}>Log out</a>
          </MenuItem>

          <RadixDropdownMenu.Arrow className="DropdownMenuArrow" />
        </StyledContent>
      </RadixDropdownMenu.Portal>
    </RadixDropdownMenu.Root>
  );
};

/**
 * The button that triggers the menu, used in a `DropdownMenu.Trigger`.
 */
const MenuTriggerButton = styled.button`
  background-color: transparent;
  color: var(--rsd-component-header-nav-text-color);
  border: 1px solid transparent;
  border-radius: 0.25rem;

  &:focus {
    outline: 1px solid var(--rsd-color-primary-500);
  }

  &:hover {
    color: var(--rsd-component-header-nav-text-hover-color);
  }

  svg {
    display: inline-block;
    width: 1rem;
    height: 1rem;
    vertical-align: middle;
  }

  &[data-state='open'] {
    svg {
      transform: rotate(180deg);
    }
  }
`;

/**
 * The menu content container, used in a `DropdownMenu.Portal`.
 */
const StyledContent = styled(RadixDropdownMenu.Content)`
  /* This unit for the padding is also the basis for the spacing and
   * sizing of the menu items.
  */
  --gafaelfawr-user-menu-padding: 0.5rem;

  font-size: 1rem;
  background-color: var(--rsd-component-header-nav-menulist-background-color);
  min-width: 12rem;
  border-radius: 0.5rem;
  padding: var(--gafaelfawr-user-menu-padding);
  color: var(--rsd-component-header-nav-menulist-text-color);
  box-shadow: 0px 10px 38px -10px rgba(22, 23, 24, 0.35),
    0px 10px 20px -15px rgba(22, 23, 24, 0.2);
  animation-duration: 400ms;
  animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform, opacity;

  a {
    color: var(--rsd-component-header-nav-menulist-text-color);
  }

  .DropdownMenuArrow {
    fill: var(--rsd-component-header-nav-menulist-background-color);
  }
`;

export default Menu;
