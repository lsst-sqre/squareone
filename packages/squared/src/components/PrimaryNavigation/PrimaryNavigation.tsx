import React from 'react';
import styled from 'styled-components';

import * as RadixNavigationMenu from '@radix-ui/react-navigation-menu';

export interface PrimaryNavigationProps {
  children: React.ReactNode;
}

/**
 * Primary navigation component that provides a layout for navigation items and a viewport.
 *
 * @component
 * @param {PrimaryNavigationProps} props - The component props
 * @param {ReactNode} props.children - The navigation items to be rendered within the ItemList
 * @returns {JSX.Element} A navigation component with items and a viewport container
 */
export const PrimaryNavigation = ({ children }: PrimaryNavigationProps) => {
  return (
    <Root>
      <ItemList>{children}</ItemList>
      <ViewportContainer>
        <ContentViewport
          onPointerEnter={(event) => event.preventDefault()}
          onPointerLeave={(event) => event.preventDefault()}
        />
      </ViewportContainer>
    </Root>
  );
};

/**
 * The root component for the primary navigation.
 *
 * This is a styled version of the `RadixNavigationMenu.Root` component and
 * isn't directly used by consumers of the component.
 */
const Root = styled(RadixNavigationMenu.Root)`
  position: relative;
`;

/**
 * The list of items in the primary navigation.
 *
 * This is a styled version of the `RadixNavigationMenu.List` component and
 * isn't directly used by consumers of the component.
 */
const ItemList = styled(RadixNavigationMenu.List)`
  list-style: none;
  margin-bottom: 0;
  padding: 0;
  display: flex;
  justify-self: end;
  width: 100%;
  font-size: 1.2rem;
`;

/**
 * An item in the primary navigation that can either link to a page or display
 * a dropdown menu.
 */
const Item = styled(RadixNavigationMenu.Item)`
  margin: 0 1em;
`;

/**
 * A trigger in the primary navigation that links to a page rather than
 * displaying a dropdown menu.
 *
 * Use the `href` prop to specify the URL of the page.
 */
const TriggerLink = styled(RadixNavigationMenu.Link)`
  color: var(--rsd-component-header-nav-text-color);
  border: none;
  border-radius: 0.5rem;
  padding: 2px 4px;
  display: inline-block; // For consistency with MenuTrigger button
  /* padding: 0; */

  &:hover {
    color: var(--rsd-component-header-nav-text-hover-color);
  }

  &:focus {
    outline: 1px solid var(--rsd-color-primary-500);
  }
`;

/**
 * The trigger for a `PrimaryNavigation.Item` that is displays a `Content`
 * dropdown when activated.
 */
const Trigger = styled(RadixNavigationMenu.Trigger)`
  color: var(--rsd-component-header-nav-text-color);
  padding: 2px 4px;
  /* padding: 0; */

  // Reset button styles
  background-color: transparent;
  border: none;
  border-radius: 0.5rem;

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
 * The content of a `PrimaryNavigation.Item` that is displayed as a dropdown
 * when the item is activated.
 */
const Content = styled(RadixNavigationMenu.Content)`
  /* This unit for the padding is also the basis for the spacing and
   * sizing of the menu items.
  */
  --gafaelfawr-user-menu-padding: 0.5rem;

  display: flex;
  flex-direction: column;
  gap: 0.25rem;

  list-style: none;

  font-size: 1rem;
  background-color: var(--rsd-component-header-nav-menulist-background-color);
  min-width: 12rem;
  border-radius: 0.5rem;
  padding: var(--gafaelfawr-user-menu-padding);
  padding-right: 0; // to avoid double padding on the right side with MenuLink
  box-shadow: 0px 10px 38px -10px rgba(22, 23, 24, 0.35),
    0px 10px 20px -15px rgba(22, 23, 24, 0.2);
  animation-duration: 400ms;
  animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform, opacity;
`;

/**
 * A content item within a `PrimaryNavigation.Content`.
 */
const ContentItem = styled(RadixNavigationMenu.Item)`
  display: flex;
`;

/**
 * A link to a page within the content of a `PrimaryNavigation.ContentItem`.
 *
 * Use the `href` prop to specify the URL of the page.
 */
export const Link = styled(RadixNavigationMenu.Link)`
  /* The styling on the menu triggers is overriding this colour. Need to re-address. */
  border-radius: 0.5rem;
  padding: calc(var(--gafaelfawr-user-menu-padding) / 2)
    var(--gafaelfawr-user-menu-padding);
  margin: calc(var(--gafaelfawr-user-menu-padding) / -2);
  margin-bottom: calc(var(--gafaelfawr-user-menu-padding) / 2);
  width: 100%;

  color: var(--rsd-component-header-nav-menulist-text-color);

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

const ViewportContainer = styled.div`
  position: absolute;
  display: flex;
  justify-content: center;
  width: 100%;
  top: 100%;
  left: 0;
  perspective: 2000px;
`;

const ContentViewport = styled(RadixNavigationMenu.Viewport)`
  position: relative;
  transform-origin: top center;
  margin-top: 10px;
  width: 100%;
  background-color: white;
  border-radius: 6px;
  overflow: hidden;
  height: var(--radix-navigation-menu-viewport-height);
  width: var(--radix-navigation-menu-viewport-width);
`;

// Associate child components with the parent for easier imports.
PrimaryNavigation.Item = Item;
PrimaryNavigation.Trigger = Trigger;
PrimaryNavigation.TriggerLink = TriggerLink;
PrimaryNavigation.Content = Content;
PrimaryNavigation.ContentItem = ContentItem;
PrimaryNavigation.Link = Link;

export default PrimaryNavigation;
