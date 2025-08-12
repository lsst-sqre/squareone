import React from 'react';
import { forwardRef, useEffect, useRef } from 'react';
import styled from 'styled-components';

import * as RadixNavigationMenu from '@radix-ui/react-navigation-menu';

import { mergeReferences } from './utils';

export type PrimaryNavigationType = React.ForwardRefExoticComponent<
  React.ComponentPropsWithoutRef<typeof RadixNavigationMenu.Root> &
    React.RefAttributes<React.ElementRef<typeof RadixNavigationMenu.Root>>
> & {
  Item: typeof Item;
  Trigger: typeof Trigger;
  TriggerLink: typeof TriggerLink;
  Content: typeof Content;
  ContentItem: typeof ContentItem;
  Link: typeof Link;
};

/**
 * Primary navigation component that provides a layout for navigation items and a viewport.
 */
export const PrimaryNavigation = forwardRef(
  ({ className, children, ...props }, reference) => {
    // Radix Navigation Menu doesn't position the menu content under the trigger by default.
    // This solution is based on the following issue comment:
    // https://github.com/radix-ui/primitives/issues/1462#issuecomment-2275683692
    // Essentially it uses a MutationObserver to update the position of the menu content.
    const containerReference = useRef<HTMLElement>(null);

    useEffect(() => {
      // Constainer is the <nav> element (essentially Root)
      const container = containerReference.current;

      if (!container) return;

      const updatePosition = (item: HTMLElement) => {
        // item is the trigger element
        const menuItemRect = item.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        const topOffset = menuItemRect.top - containerRect.top;
        container.style.setProperty(
          '--radix-navigation-menu-item-active-top',
          `${topOffset}px`
        );

        if (containerRect.right - menuItemRect.right < 150) {
          // Near the right edge, so position the menu content under the trigger
          // right-aligned with the trigger
          container.style.setProperty(
            '--radix-navigation-menu-item-active-left',
            'unset'
          );
          container.style.setProperty(
            '--radix-navigation-menu-item-active-right',
            '0px'
          );
        } else {
          // Not near the right edge, so position the menu content under the trigger
          // left-aligned with the trigger
          container.style.setProperty(
            '--radix-navigation-menu-item-active-left',
            `${menuItemRect.left - containerRect.left}px`
          );
          container.style.setProperty(
            '--radix-navigation-menu-item-active-right',
            'unset'
          );
        }
      };

      const mutationCallback = (mutationsList: MutationRecord[]) => {
        for (const mutation of mutationsList) {
          if (
            mutation.type === 'attributes' &&
            mutation.attributeName === 'data-state' &&
            mutation.target instanceof HTMLElement &&
            mutation.target.hasAttribute('aria-expanded') &&
            mutation.target.dataset.state === 'open'
          ) {
            updatePosition(mutation.target);
          }
        }
      };

      const observer = new MutationObserver(mutationCallback);

      observer.observe(container, {
        childList: true,
        attributes: true,
        subtree: true,
      });

      return () => {
        observer.disconnect();
      };
    }, []);

    return (
      <Root
        ref={mergeReferences([reference, containerReference])}
        {...props}
        className={className}
      >
        <ItemList>{children}</ItemList>
        <NavigationMenuViewport />
      </Root>
    );
  }
) as PrimaryNavigationType;

PrimaryNavigation.displayName = 'PrimaryNavigation';

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
const Trigger = ({ children }: { children: React.ReactNode }) => {
  return (
    <StyledTrigger
      onPointerMove={(event) => event.preventDefault()}
      onPointerEnter={(event) => event.preventDefault()}
      onPointerLeave={(event) => event.preventDefault()}
    >
      {children}
    </StyledTrigger>
  );
};

/**
 * A styled version of the `RadixNavigationMenu.Trigger` component that is
 * used by the `PrimaryNavigation.Trigger` component.
 */
const StyledTrigger = styled(RadixNavigationMenu.Trigger)`
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
    cursor: pointer;
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
const Content = ({ children }: { children: React.ReactNode }) => {
  return (
    <StyledContent
      onPointerMove={(event) => event.preventDefault()}
      onPointerEnter={(event) => event.preventDefault()}
      onPointerLeave={(event) => event.preventDefault()}
    >
      <ContentList>{children}</ContentList>
    </StyledContent>
  );
};

/**
 * A styled version of the `RadixNavigationMenu.Content` component that is
 * used by the `PrimaryNavigation.Content` component.
 */
const StyledContent = styled(RadixNavigationMenu.Content)`
  font-size: 1rem;
  background-color: var(--rsd-component-header-nav-menulist-background-color);
  min-width: 12rem;
  border-radius: 0.5rem;
  box-shadow: 0px 10px 38px -10px rgba(22, 23, 24, 0.35),
    0px 10px 20px -15px rgba(22, 23, 24, 0.2);
  animation-duration: 400ms;
  animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform, opacity;
`;

/**
 * A list container for dropdown content items.
 */
const ContentList = styled.ul`
  /* This unit for the padding is also the basis for the spacing and
   * sizing of the menu items.
  */
  --gafaelfawr-user-menu-padding: 0.5rem;

  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  list-style: none;
  margin: 0;
  padding: var(--gafaelfawr-user-menu-padding);
  padding-right: 0; // to avoid double padding on the right side with MenuLink
`;

/**
 * A content item within a `PrimaryNavigation.Content`.
 */
const ContentItem = styled.li`
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

export const NavigationMenuViewport = forwardRef<
  React.ElementRef<typeof RadixNavigationMenu.Viewport>,
  React.ComponentPropsWithoutRef<typeof RadixNavigationMenu.Viewport>
>(({ className, ...props }, reference) => (
  <NavigationMenuViewportContainer>
    <NavigationMenuStyledViewport
      className={className}
      ref={reference}
      onPointerEnter={(event) => event.preventDefault()}
      onPointerLeave={(event) => event.preventDefault()}
      {...props}
    />
  </NavigationMenuViewportContainer>
));
NavigationMenuViewport.displayName = RadixNavigationMenu.Viewport.displayName;

const NavigationMenuViewportContainer = styled.div`
  position: absolute;
  z-index: 1000; // Ensure the menu is above other content
  left: var(--radix-navigation-menu-item-active-left);
  right: var(--radix-navigation-menu-item-active-right);
  top: 100%;
  display: flex;
  /* transform: translateX(var(--radix-navigation-menu-item-active-left)); */
  justify-content: center;
  transition: transform 100ms;
`;

const NavigationMenuStyledViewport = styled(RadixNavigationMenu.Viewport)`
  position: relative;
  margin-top: 0.375rem;
  transform-origin: top center;
  height: var(--radix-navigation-menu-viewport-height);
  width: 100%;
  overflow: hidden;
  border-radius: 0.375rem;
  border: 1px solid var(--border);
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  background-color: white;
  color: black;

  @media (min-width: 768px) {
    width: var(--radix-navigation-menu-viewport-width);
  }

  &[data-state='open'] {
    animation: menuIn 200ms ease;
  }

  &[data-state='closed'] {
    animation: menuOut 200ms ease;
  }

  @keyframes menuIn {
    from {
      opacity: 0;
      transform: scale(0.9);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes menuOut {
    from {
      opacity: 1;
      transform: scale(1);
    }
    to {
      opacity: 0;
      transform: scale(0.95);
    }
  }
`;

// Associate child components with the parent for easier imports.
PrimaryNavigation.Item = Item;
PrimaryNavigation.Trigger = Trigger;
PrimaryNavigation.TriggerLink = TriggerLink;
PrimaryNavigation.Content = Content;
PrimaryNavigation.ContentItem = ContentItem;
PrimaryNavigation.Link = Link;

export default PrimaryNavigation;
