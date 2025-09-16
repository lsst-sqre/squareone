import React, { forwardRef } from 'react';
import styles from './TextInput.module.css';

export type TextInputProps = Omit<
  React.ComponentPropsWithoutRef<'input'>,
  'size'
> & {
  size?: 'sm' | 'md' | 'lg';
  appearance?: 'default' | 'error' | 'success';
  fullWidth?: boolean;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
};

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  (
    {
      size = 'md',
      appearance = 'default',
      leadingIcon,
      trailingIcon,
      fullWidth,
      className,
      ...props
    },
    ref
  ) => {
    const containerClassNames = [
      styles.container,
      fullWidth && styles.fullWidth,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const inputClassNames = [
      styles.input,
      styles[size],
      styles[appearance],
      leadingIcon && styles.hasLeadingIcon,
      trailingIcon && styles.hasTrailingIcon,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={containerClassNames}>
        <div className={styles.inputWrapper}>
          {leadingIcon && (
            <span className={styles.leadingIcon}>{leadingIcon}</span>
          )}
          <input
            ref={ref}
            className={inputClassNames}
            aria-invalid={appearance === 'error'}
            {...props}
          />
          {trailingIcon && (
            <span className={styles.trailingIcon}>{trailingIcon}</span>
          )}
        </div>
      </div>
    );
  }
);

TextInput.displayName = 'TextInput';

export default TextInput;
