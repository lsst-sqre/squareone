import React, { forwardRef } from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import styles from './Label.module.css';

export type LabelProps = {
  required?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
} & React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>;

const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ required, disabled, size = 'md', className, children, ...props }, ref) => {
    const classNames = [
      styles.label,
      styles[size],
      disabled && styles.disabled,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <LabelPrimitive.Root ref={ref} className={classNames} {...props}>
        {children}
        {required && (
          <span className={styles.required} aria-hidden="true">
            *
          </span>
        )}
      </LabelPrimitive.Root>
    );
  }
);

Label.displayName = 'Label';

export default Label;
