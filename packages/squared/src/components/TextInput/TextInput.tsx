import type React from 'react';
import { forwardRef } from 'react';
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
  trailingAction?: React.ReactNode;
};

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  (
    {
      size = 'md',
      appearance = 'default',
      leadingIcon,
      trailingIcon,
      trailingAction,
      fullWidth,
      className,
      ...props
    },
    ref
  ) => {
    // trailingAction and trailingIcon are mutually exclusive
    const hasTrailingElement = !!(trailingAction || trailingIcon);

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
      hasTrailingElement && styles.hasTrailingIcon,
      trailingAction && styles.hasTrailingAction,
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
          {trailingAction && (
            <span className={styles.trailingAction}>{trailingAction}</span>
          )}
          {!trailingAction && trailingIcon && (
            <span className={styles.trailingIcon}>{trailingIcon}</span>
          )}
        </div>
      </div>
    );
  }
);

TextInput.displayName = 'TextInput';

export default TextInput;
