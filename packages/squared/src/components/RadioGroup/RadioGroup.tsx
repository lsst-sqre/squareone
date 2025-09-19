import React, { forwardRef } from 'react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import Label from '../Label';
import styles from './RadioGroup.module.css';

export type RadioGroupProps = {
  legend: string;
  description?: string;
  orientation?: 'horizontal' | 'vertical';
  required?: boolean;
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
} & React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>;

// Main RadioGroup component
const RadioGroupRoot = forwardRef<HTMLDivElement, RadioGroupProps>(
  (
    {
      legend,
      description,
      orientation = 'vertical',
      required,
      size = 'md',
      children,
      className,
      ...props
    },
    ref
  ) => {
    const groupClassNames = [styles.group, styles[orientation], className]
      .filter(Boolean)
      .join(' ');

    return (
      <fieldset className={styles.fieldset}>
        <Label
          as="legend"
          size={size}
          required={required}
          description={description}
        >
          {legend}
        </Label>
        <RadioGroupPrimitive.Root
          ref={ref}
          className={groupClassNames}
          orientation={orientation}
          aria-required={required}
          {...props}
        >
          {children}
        </RadioGroupPrimitive.Root>
      </fieldset>
    );
  }
);

RadioGroupRoot.displayName = 'RadioGroup';

// RadioGroup.Item component
export type RadioGroupItemProps = {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
} & React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>;

const RadioGroupItem = forwardRef<HTMLButtonElement, RadioGroupItemProps>(
  (
    { value, label, description, disabled, size = 'md', className, ...props },
    ref
  ) => {
    const itemId = React.useId();

    return (
      <div className={styles.item}>
        <RadioGroupPrimitive.Item
          ref={ref}
          value={value}
          id={itemId}
          disabled={disabled}
          className={[styles.radio, styles[size], className]
            .filter(Boolean)
            .join(' ')}
          {...props}
        >
          <RadioGroupPrimitive.Indicator className={styles.indicator} />
        </RadioGroupPrimitive.Item>
        <label htmlFor={itemId} className={styles.label}>
          {label}
          {description && (
            <span className={styles.itemDescription}>{description}</span>
          )}
        </label>
      </div>
    );
  }
);

RadioGroupItem.displayName = 'RadioGroup.Item';

// Export as compound component
export const RadioGroup = Object.assign(RadioGroupRoot, {
  Item: RadioGroupItem,
});

export default RadioGroup;
