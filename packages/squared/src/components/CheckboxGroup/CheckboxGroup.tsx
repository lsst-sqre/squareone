import React, { forwardRef } from 'react';
import styles from './CheckboxGroup.module.css';
import { Checkbox } from '../Checkbox';
import Label from '../Label';

export type CheckboxGroupProps = {
  legend: string;
  description?: string;
  orientation?: 'horizontal' | 'vertical';
  required?: boolean;
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
} & React.ComponentPropsWithoutRef<'fieldset'>;

const CheckboxGroupRoot = forwardRef<HTMLFieldSetElement, CheckboxGroupProps>(
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
    const fieldsetClassNames = [styles.fieldset, styles[orientation], className]
      .filter(Boolean)
      .join(' ');

    return (
      <fieldset ref={ref} className={fieldsetClassNames} {...props}>
        <Label
          as="legend"
          size={size}
          required={required}
          description={description}
        >
          {legend}
        </Label>
        <div className={styles.options} role="group">
          {children}
        </div>
      </fieldset>
    );
  }
);

CheckboxGroupRoot.displayName = 'CheckboxGroup';

// Export as compound component
export const CheckboxGroup = Object.assign(CheckboxGroupRoot, {
  Item: Checkbox, // Reuse existing Checkbox component
});

export default CheckboxGroup;
