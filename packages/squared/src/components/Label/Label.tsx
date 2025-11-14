import * as LabelPrimitive from '@radix-ui/react-label';
import React, { forwardRef } from 'react';
import styles from './Label.module.css';

export type LabelProps = {
  as?: 'label' | 'legend';
  required?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  description?: string;
  className?: string;
} & (
  | React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
  | React.ComponentPropsWithoutRef<'legend'>
);

const Label = forwardRef<HTMLLabelElement | HTMLLegendElement, LabelProps>(
  (
    {
      as = 'label',
      required,
      disabled,
      size = 'md',
      description,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const classNames = [
      styles.label,
      styles[size],
      disabled && styles.disabled,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const requiredIndicator = required && (
      <span className={styles.required} aria-hidden="true">
        *
      </span>
    );

    const descriptionElement = description && (
      <span className={styles.description}>{description}</span>
    );

    if (as === 'legend') {
      return (
        <legend
          ref={ref as React.Ref<HTMLLegendElement>}
          className={classNames}
          {...(props as React.ComponentPropsWithoutRef<'legend'>)}
        >
          {children}
          {requiredIndicator}
          {descriptionElement}
        </legend>
      );
    }

    return (
      <LabelPrimitive.Root
        ref={ref as React.Ref<HTMLLabelElement>}
        className={classNames}
        {...(props as React.ComponentPropsWithoutRef<
          typeof LabelPrimitive.Root
        >)}
      >
        {children}
        {requiredIndicator}
        {descriptionElement}
      </LabelPrimitive.Root>
    );
  }
);

Label.displayName = 'Label';

export default Label;
