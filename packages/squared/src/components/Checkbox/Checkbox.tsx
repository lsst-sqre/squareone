import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import React, { forwardRef } from 'react';
import styles from './Checkbox.module.css';

export type CheckboxProps = {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  description?: string;
  required?: boolean;
} & React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>;

const Checkbox = forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ size = 'md', label, description, required, className, ...props }, ref) => {
    const generatedId = React.useId();
    const checkboxId = props.id || generatedId;

    const checkboxClassNames = [styles.checkbox, styles[size], className]
      .filter(Boolean)
      .join(' ');

    const checkbox = (
      <CheckboxPrimitive.Root
        ref={ref}
        id={checkboxId}
        className={checkboxClassNames}
        required={required}
        {...props}
      >
        <CheckboxPrimitive.Indicator className={styles.indicator} />
      </CheckboxPrimitive.Root>
    );

    if (!label) return checkbox;

    return (
      <div className={styles.container}>
        <div className={styles.checkboxRow}>
          {checkbox}
          <label htmlFor={checkboxId} className={styles.label}>
            <span className={styles.labelText}>
              {label}
              {required && (
                <span className={styles.required} aria-hidden="true">
                  *
                </span>
              )}
            </span>
            {description && (
              <span className={styles.description}>{description}</span>
            )}
          </label>
        </div>
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;
