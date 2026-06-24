import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { ChevronDown } from 'lucide-react';
import React, { forwardRef } from 'react';
import styles from './DropdownMenu.module.css';

// Main DropdownMenu component (Root)
export type DropdownMenuProps = {
  children: React.ReactNode;

  // Radix DropdownMenu Root props (explicitly typed to avoid exposing
  // internal Radix types)
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?(open: boolean): void;
  modal?: boolean;
  dir?: 'ltr' | 'rtl';
};

const DropdownMenuRoot = ({ children, ...props }: DropdownMenuProps) => {
  return (
    <DropdownMenuPrimitive.Root {...props}>
      {children}
    </DropdownMenuPrimitive.Root>
  );
};

DropdownMenuRoot.displayName = 'DropdownMenu';

// DropdownMenu.Trigger component
export type DropdownMenuTriggerProps = {
  children: React.ReactNode;
  /** Render the child element as the trigger instead of the default button. */
  asChild?: boolean;
  /** Show the chevron affordance on the default button trigger. */
  showChevron?: boolean;
} & React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Trigger>;

const DropdownMenuTrigger = forwardRef<
  HTMLButtonElement,
  DropdownMenuTriggerProps
>(({ children, asChild, showChevron = true, className, ...props }, ref) => {
  // When asChild is set the caller supplies the trigger element, so we pass
  // through without imposing the default button styling or chevron.
  if (asChild) {
    return (
      <DropdownMenuPrimitive.Trigger
        ref={ref}
        asChild
        className={className}
        {...props}
      >
        {children}
      </DropdownMenuPrimitive.Trigger>
    );
  }

  return (
    <DropdownMenuPrimitive.Trigger
      ref={ref}
      className={[styles.trigger, className].filter(Boolean).join(' ')}
      {...props}
    >
      {children}
      {showChevron && (
        <span className={styles.triggerIcon} aria-hidden="true">
          <ChevronDown />
        </span>
      )}
    </DropdownMenuPrimitive.Trigger>
  );
});

DropdownMenuTrigger.displayName = 'DropdownMenu.Trigger';

// DropdownMenu.Content component (portaled)
export type DropdownMenuContentProps = {
  children: React.ReactNode;
} & React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>;

const DropdownMenuContent = forwardRef<
  HTMLDivElement,
  DropdownMenuContentProps
>(({ children, className, sideOffset = 6, align = 'start', ...props }, ref) => {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        ref={ref}
        className={[styles.content, className].filter(Boolean).join(' ')}
        sideOffset={sideOffset}
        align={align}
        {...props}
      >
        {children}
      </DropdownMenuPrimitive.Content>
    </DropdownMenuPrimitive.Portal>
  );
});

DropdownMenuContent.displayName = 'DropdownMenu.Content';

// DropdownMenu.Item component
export type DropdownMenuItemProps = {
  children: React.ReactNode;
} & React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item>;

const DropdownMenuItem = forwardRef<HTMLDivElement, DropdownMenuItemProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <DropdownMenuPrimitive.Item
        ref={ref}
        className={[styles.item, className].filter(Boolean).join(' ')}
        {...props}
      >
        {children}
      </DropdownMenuPrimitive.Item>
    );
  }
);

DropdownMenuItem.displayName = 'DropdownMenu.Item';

// DropdownMenu.Label component
export type DropdownMenuLabelProps = {
  children: React.ReactNode;
} & React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label>;

const DropdownMenuLabel = forwardRef<HTMLDivElement, DropdownMenuLabelProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <DropdownMenuPrimitive.Label
        ref={ref}
        className={[styles.label, className].filter(Boolean).join(' ')}
        {...props}
      >
        {children}
      </DropdownMenuPrimitive.Label>
    );
  }
);

DropdownMenuLabel.displayName = 'DropdownMenu.Label';

// DropdownMenu.Separator component
export type DropdownMenuSeparatorProps = React.ComponentPropsWithoutRef<
  typeof DropdownMenuPrimitive.Separator
>;

const DropdownMenuSeparator = forwardRef<
  HTMLDivElement,
  DropdownMenuSeparatorProps
>(({ className, ...props }, ref) => {
  return (
    <DropdownMenuPrimitive.Separator
      ref={ref}
      className={[styles.separator, className].filter(Boolean).join(' ')}
      {...props}
    />
  );
});

DropdownMenuSeparator.displayName = 'DropdownMenu.Separator';

// Export as compound component
export const DropdownMenu = Object.assign(DropdownMenuRoot, {
  Trigger: DropdownMenuTrigger,
  Content: DropdownMenuContent,
  Item: DropdownMenuItem,
  Label: DropdownMenuLabel,
  Separator: DropdownMenuSeparator,
});

export default DropdownMenu;
