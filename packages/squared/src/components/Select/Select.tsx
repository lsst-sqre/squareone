import * as SelectPrimitive from '@radix-ui/react-select';
import React, { forwardRef } from 'react';
// @ts-ignore - ChevronUp is missing from react-feather type definitions
import { Check, ChevronDown, ChevronUp } from 'react-feather';
import styles from './Select.module.css';

export type SelectProps = {
  placeholder?: string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: React.ReactNode;
  id?: string;
  className?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean | 'false' | 'true';

  // Radix Select Root props (explicitly typed to avoid exposing internal types)
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?(open: boolean): void;
  defaultValue?: string;
  value?: string;
  onValueChange?(value: string): void;
  disabled?: boolean;
  name?: string;
  required?: boolean;
  dir?: 'ltr' | 'rtl';
};

/**
 * Known ARIA Violation: "ARIA required children"
 *
 * The ScrollUpButton and ScrollDownButton components cause an ARIA compliance
 * violation in the Scrollable List story. These buttons are rendered by Radix UI
 * with role="presentation" as direct children of the listbox (Content), but ARIA
 * rules require listbox children to be either options or groups containing options.
 *
 * This is a limitation of Radix UI's internal implementation and cannot be fixed
 * in our wrapper component. The violation only appears when the dropdown is open
 * and doesn't affect actual functionality - screen readers can still navigate
 * options correctly.
 *
 * Options considered:
 * 1. Remove scroll buttons - Would hurt UX for mouse users with long lists
 * 2. Wait for upstream Radix UI fix - Most appropriate long-term solution
 * 3. Accept as known limitation - Current approach
 *
 * Track: https://github.com/radix-ui/primitives/issues
 */

// Main Select component (Root + Trigger)
const SelectRoot = forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      placeholder = 'Select an option',
      label,
      size = 'md',
      fullWidth,
      children,
      className,
      ...props
    },
    ref
  ) => {
    // Generate unique ID for ARIA association
    const contentId = React.useId();

    // Create accessible label for the trigger button
    const getAriaLabel = () => {
      // If aria-label is explicitly provided, use it
      if (props['aria-label']) {
        return props['aria-label'];
      }
      // Otherwise, generate from value/placeholder
      const currentValue = props.value || props.defaultValue;
      const displayText = currentValue || placeholder;
      return label ? `${label}: ${displayText}` : displayText;
    };

    return (
      <div
        className={[styles.container, fullWidth && styles.fullWidth, className]
          .filter(Boolean)
          .join(' ')}
      >
        <SelectPrimitive.Root {...props}>
          <SelectPrimitive.Trigger
            ref={ref}
            className={[styles.trigger, styles[size]].filter(Boolean).join(' ')}
            // Radix UI automatically adds these ARIA attributes:
            // - aria-expanded: indicates open/closed state
            // - aria-haspopup="listbox": indicates dropdown behavior
            // - aria-controls: associates with dropdown content
            // We ensure proper ID association for testing
            aria-label={getAriaLabel()}
            aria-describedby={props['aria-describedby']}
            aria-invalid={props['aria-invalid']}
          >
            <SelectPrimitive.Value placeholder={placeholder} />
            <SelectPrimitive.Icon className={styles.icon}>
              <ChevronDown />
            </SelectPrimitive.Icon>
          </SelectPrimitive.Trigger>

          <SelectPrimitive.Portal>
            <SelectPrimitive.Content
              className={styles.content}
              id={contentId}
              // Ensures proper focus management and screen reader announcements
              aria-label={getAriaLabel()}
              position="popper"
              sideOffset={5}
            >
              <SelectPrimitive.ScrollUpButton className={styles.scrollButton}>
                <ChevronUp />
              </SelectPrimitive.ScrollUpButton>

              <SelectPrimitive.Viewport className={styles.viewport}>
                {children}
              </SelectPrimitive.Viewport>

              <SelectPrimitive.ScrollDownButton className={styles.scrollButton}>
                <ChevronDown />
              </SelectPrimitive.ScrollDownButton>
            </SelectPrimitive.Content>
          </SelectPrimitive.Portal>
        </SelectPrimitive.Root>
      </div>
    );
  }
);

SelectRoot.displayName = 'Select';

// Select.Item component
export type SelectItemProps = {
  value: string;
  disabled?: boolean;
  children: React.ReactNode;
} & React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>;

const SelectItem = forwardRef<HTMLDivElement, SelectItemProps>(
  ({ value, disabled, children, className, ...props }, ref) => {
    return (
      <SelectPrimitive.Item
        ref={ref}
        value={value}
        disabled={disabled}
        className={[styles.item, className].filter(Boolean).join(' ')}
        {...props}
      >
        <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
        <SelectPrimitive.ItemIndicator className={styles.itemIndicator}>
          <Check />
        </SelectPrimitive.ItemIndicator>
      </SelectPrimitive.Item>
    );
  }
);

SelectItem.displayName = 'Select.Item';

// Select.Group component for organizing items
export type SelectGroupProps = {
  label: string;
  children: React.ReactNode;
};

const SelectGroup: React.FC<SelectGroupProps> = ({ label, children }) => {
  return (
    <SelectPrimitive.Group>
      <SelectPrimitive.Label className={styles.groupLabel}>
        {label}
      </SelectPrimitive.Label>
      {children}
    </SelectPrimitive.Group>
  );
};

SelectGroup.displayName = 'Select.Group';

// Select.Separator component
const SelectSeparator: React.FC = () => {
  return <SelectPrimitive.Separator className={styles.separator} />;
};

SelectSeparator.displayName = 'Select.Separator';

// Export as compound component
export const Select = Object.assign(SelectRoot, {
  Item: SelectItem,
  Group: SelectGroup,
  Separator: SelectSeparator,
});

export default Select;
