import * as RadixNavigationMenu from '@radix-ui/react-navigation-menu';
import React, { forwardRef, useEffect, useRef } from 'react';
import styles from './PrimaryNavigation.module.css';
import { mergeReferences } from './utils';

export type PrimaryNavigationType = React.ForwardRefExoticComponent<
  React.ComponentPropsWithoutRef<typeof RadixNavigationMenu.Root> &
    React.RefAttributes<React.ComponentRef<typeof RadixNavigationMenu.Root>>
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

      if (!container) return () => {};

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
      <RadixNavigationMenu.Root
        ref={mergeReferences([reference, containerReference])}
        {...props}
        className={`${styles.root} ${className || ''}`.trim()}
      >
        <RadixNavigationMenu.List className={styles.itemList}>
          {children}
        </RadixNavigationMenu.List>
        <NavigationMenuViewport />
      </RadixNavigationMenu.Root>
    );
  }
) as PrimaryNavigationType;

PrimaryNavigation.displayName = 'PrimaryNavigation';

/**
 * An item in the primary navigation that can either link to a page or display
 * a dropdown menu.
 */
const Item = forwardRef<
  React.ComponentRef<typeof RadixNavigationMenu.Item>,
  React.ComponentPropsWithoutRef<typeof RadixNavigationMenu.Item>
>(({ className, ...props }, ref) => (
  <RadixNavigationMenu.Item
    ref={ref}
    className={`${styles.item} ${className || ''}`.trim()}
    {...props}
  />
));
Item.displayName = 'Item';

/**
 * A trigger in the primary navigation that links to a page rather than
 * displaying a dropdown menu.
 *
 * Use the `href` prop to specify the URL of the page.
 */
const TriggerLink = forwardRef<
  React.ComponentRef<typeof RadixNavigationMenu.Link>,
  React.ComponentPropsWithoutRef<typeof RadixNavigationMenu.Link>
>(({ className, ...props }, ref) => (
  <RadixNavigationMenu.Link
    ref={ref}
    className={`${styles.triggerLink} ${className || ''}`.trim()}
    {...props}
  />
));
TriggerLink.displayName = 'TriggerLink';

/**
 * The trigger for a `PrimaryNavigation.Item` that is displays a `Content`
 * dropdown when activated.
 */
const Trigger = forwardRef<
  React.ComponentRef<typeof RadixNavigationMenu.Trigger>,
  React.ComponentPropsWithoutRef<typeof RadixNavigationMenu.Trigger>
>(({ className, children, ...props }, ref) => {
  return (
    <RadixNavigationMenu.Trigger
      ref={ref}
      className={`${styles.styledTrigger} ${className || ''}`.trim()}
      onPointerMove={(event) => event.preventDefault()}
      onPointerEnter={(event) => event.preventDefault()}
      onPointerLeave={(event) => event.preventDefault()}
      {...props}
    >
      {children}
    </RadixNavigationMenu.Trigger>
  );
});
Trigger.displayName = 'Trigger';

/**
 * The content of a `PrimaryNavigation.Item` that is displayed as a dropdown
 * when the item is activated.
 */
const Content = forwardRef<
  React.ComponentRef<typeof RadixNavigationMenu.Content>,
  React.ComponentPropsWithoutRef<typeof RadixNavigationMenu.Content> & {
    children: React.ReactNode;
  }
>(({ className, children, ...props }, ref) => {
  return (
    <RadixNavigationMenu.Content
      ref={ref}
      className={`${styles.styledContent} ${className || ''}`.trim()}
      onPointerMove={(event) => event.preventDefault()}
      onPointerEnter={(event) => event.preventDefault()}
      onPointerLeave={(event) => event.preventDefault()}
      {...props}
    >
      <ul className={styles.contentList}>{children}</ul>
    </RadixNavigationMenu.Content>
  );
});
Content.displayName = 'Content';

/**
 * A content item within a `PrimaryNavigation.Content`.
 */
const ContentItem = forwardRef<
  HTMLLIElement,
  React.ComponentPropsWithoutRef<'li'>
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    className={`${styles.contentItem} ${className || ''}`.trim()}
    {...props}
  />
));
ContentItem.displayName = 'ContentItem';

/**
 * A link to a page within the content of a `PrimaryNavigation.ContentItem`.
 *
 * Use the `href` prop to specify the URL of the page.
 */
export const Link = forwardRef<
  React.ComponentRef<typeof RadixNavigationMenu.Link>,
  React.ComponentPropsWithoutRef<typeof RadixNavigationMenu.Link>
>(({ className, ...props }, ref) => (
  <RadixNavigationMenu.Link
    ref={ref}
    className={`${styles.link} ${className || ''}`.trim()}
    {...props}
  />
));
Link.displayName = 'Link';

export const NavigationMenuViewport = forwardRef<
  React.ComponentRef<typeof RadixNavigationMenu.Viewport>,
  React.ComponentPropsWithoutRef<typeof RadixNavigationMenu.Viewport>
>(({ className, ...props }, reference) => (
  <div className={styles.navigationMenuViewportContainer}>
    <RadixNavigationMenu.Viewport
      className={`${styles.navigationMenuStyledViewport} ${
        className || ''
      }`.trim()}
      ref={reference}
      onPointerEnter={(event) => event.preventDefault()}
      onPointerLeave={(event) => event.preventDefault()}
      {...props}
    />
  </div>
));
NavigationMenuViewport.displayName = RadixNavigationMenu.Viewport.displayName;

// Associate child components with the parent for easier imports.
PrimaryNavigation.Item = Item;
PrimaryNavigation.Trigger = Trigger;
PrimaryNavigation.TriggerLink = TriggerLink;
PrimaryNavigation.Content = Content;
PrimaryNavigation.ContentItem = ContentItem;
PrimaryNavigation.Link = Link;

export default PrimaryNavigation;
