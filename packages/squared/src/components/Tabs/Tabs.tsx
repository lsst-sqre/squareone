import * as TabsPrimitive from '@radix-ui/react-tabs';
import type React from 'react';
import { forwardRef } from 'react';
import styles from './Tabs.module.css';

export type TabsProps = {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
} & React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>;

// Main Tabs Root component
const TabsRoot = forwardRef<HTMLDivElement, TabsProps>(
  ({ className, ...props }, ref) => {
    const rootClassNames = [styles.root, className].filter(Boolean).join(' ');

    return (
      <TabsPrimitive.Root ref={ref} className={rootClassNames} {...props} />
    );
  }
);

TabsRoot.displayName = 'Tabs';

// Tabs.List component
export type TabsListProps = React.ComponentPropsWithoutRef<
  typeof TabsPrimitive.List
>;

const TabsList = forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, ...props }, ref) => {
    const listClassNames = [styles.list, className].filter(Boolean).join(' ');

    return (
      <TabsPrimitive.List ref={ref} className={listClassNames} {...props} />
    );
  }
);

TabsList.displayName = 'Tabs.List';

// Tabs.Trigger component
export type TabsTriggerProps = React.ComponentPropsWithoutRef<
  typeof TabsPrimitive.Trigger
>;

const TabsTrigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, ...props }, ref) => {
    const triggerClassNames = [styles.trigger, className]
      .filter(Boolean)
      .join(' ');

    return (
      <TabsPrimitive.Trigger
        ref={ref}
        className={triggerClassNames}
        {...props}
      />
    );
  }
);

TabsTrigger.displayName = 'Tabs.Trigger';

// Tabs.Content component
export type TabsContentProps = React.ComponentPropsWithoutRef<
  typeof TabsPrimitive.Content
>;

const TabsContent = forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, ...props }, ref) => {
    const contentClassNames = [styles.content, className]
      .filter(Boolean)
      .join(' ');

    return (
      <TabsPrimitive.Content
        ref={ref}
        className={contentClassNames}
        {...props}
      />
    );
  }
);

TabsContent.displayName = 'Tabs.Content';

// Export as compound component
export const Tabs = Object.assign(TabsRoot, {
  List: TabsList,
  Trigger: TabsTrigger,
  Content: TabsContent,
});

export default Tabs;
