import React from 'react';
import styled from 'styled-components';
import { ChevronDown } from 'react-feather';

import * as RadixNavigationMenu from '@radix-ui/react-navigation-menu';

export type MenuProps = {
  children: React.ReactNode;
  /**
   * The URL to use for the logout link. This is the Gafaelfawr logout endpoint.
   */
  logoutHref: string;
  /**
   * The username to display in the menu trigger.
   */
  username: string;
};

export const Menu = ({ children, logoutHref, username }: MenuProps) => {
  return (
    <MenuRoot>
      <MenuList>
        <RadixNavigationMenu.Item>
          <MenuTrigger
            onPointerMove={(event) => event.preventDefault()}
            onPointerEnter={(event) => event.preventDefault()}
            onPointerLeave={(event) => event.preventDefault()}
          >
            {username} <ChevronDown />
          </MenuTrigger>
          <MenuContent
            onPointerMove={(event) => event.preventDefault()}
            onPointerEnter={(event) => event.preventDefault()}
            onPointerLeave={(event) => event.preventDefault()}
          >
            {children}
            <MenuLink href={logoutHref}>Log out</MenuLink>
          </MenuContent>
        </RadixNavigationMenu.Item>
      </MenuList>
      <ViewportContainer>
        <ContentViewport
          onPointerEnter={(event) => event.preventDefault()}
          onPointerLeave={(event) => event.preventDefault()}
        />
      </ViewportContainer>
    </MenuRoot>
  );
};

const MenuRoot = styled(RadixNavigationMenu.Root)``;

const MenuList = styled(RadixNavigationMenu.List)`
  list-style: none;
  margin-bottom: 0;
`;

const MenuTrigger = styled(RadixNavigationMenu.Trigger)`
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

const MenuContent = styled(RadixNavigationMenu.Content)`
  /* This unit for the padding is also the basis for the spacing and
   * sizing of the menu items.
  */
  --gafaelfawr-user-menu-padding: 0.5rem;

  display: flex;
  flex-direction: column;
  gap: var(0.25rem);

  font-size: 1rem;
  background-color: var(--rsd-component-header-nav-menulist-background-color);
  min-width: 12rem;
  border-radius: 0.5rem;
  padding: var(--gafaelfawr-user-menu-padding);
  box-shadow: 0px 10px 38px -10px rgba(22, 23, 24, 0.35),
    0px 10px 20px -15px rgba(22, 23, 24, 0.2);
  animation-duration: 400ms;
  animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform, opacity;
`;

export const MenuLink = styled(RadixNavigationMenu.Link)`
  /* The styling on the menu triggers is overriding this colour. Need to re-address. */
  color: var(--rsd-component-header-nav-menulist-text-color) !important;
  border-radius: 0.5rem;
  padding: calc(var(--gafaelfawr-user-menu-padding) / 2)
    var(--gafaelfawr-user-menu-padding);
  margin: calc(var(--gafaelfawr-user-menu-padding) / -2);
  margin-bottom: calc(var(--gafaelfawr-user-menu-padding) / 2);

  &:last-of-type {
    margin-bottom: 0;
  }

  outline: 1px solid transparent;

  &:focus {
    outline: 1px solid
      var(--rsd-component-header-nav-menulist-selected-background-color);
  }

  &:hover {
    background-color: var(
      --rsd-component-header-nav-menulist-selected-background-color
    );
    color: white !important;
  }
`;

const ContentViewport = styled(RadixNavigationMenu.Viewport)`
  /* This pushes the menu leftward to stay on the page.
     It's a magic number. Perhaps we can use the pushover API to
     position the menu more accurately?
  */
  position: relative;
  top: 0.5rem;
  right: 40%;
  height: var(--radix-navigation-menu-viewport-height);
  width: var(--radix-navigation-menu-viewport-width);
`;

const ViewportContainer = styled.div`
  position: absolute;
  z-index: 1000;
`;

export default Menu;
