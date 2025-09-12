import React, { forwardRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import styles from './Button.module.css';

export type ButtonAppearance = 'solid' | 'outline' | 'text';
export type ButtonTone = 'primary' | 'secondary' | 'tertiary' | 'danger';
export type ButtonRole = 'primary' | 'secondary' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

type PolymorphicButtonProps<T extends React.ElementType = 'button'> = {
  as?: T;
  appearance?: ButtonAppearance;
  tone?: ButtonTone;
  role?: ButtonRole;
  block?: boolean;
  leadingIcon?: IconDefinition | React.ComponentType<any>;
  trailingIcon?: IconDefinition | React.ComponentType<any>;
  size?: ButtonSize;
  loading?: boolean;
  children: React.ReactNode;
} & React.ComponentPropsWithoutRef<T>;

export type ButtonProps<T extends React.ElementType = 'button'> =
  PolymorphicButtonProps<T>;

const Button = forwardRef<any, ButtonProps<any>>(
  (
    {
      as: Component = 'button',
      appearance,
      tone,
      role,
      block = false,
      leadingIcon,
      trailingIcon,
      size = 'md',
      loading = false,
      disabled = false,
      children,
      className,
      ...props
    },
    ref
  ) => {
    // Resolve appearance and tone from role if provided
    let finalAppearance = appearance;
    let finalTone = tone;

    if (role && !appearance && !tone) {
      switch (role) {
        case 'primary':
          finalAppearance = 'solid';
          finalTone = 'primary';
          break;
        case 'secondary':
          finalAppearance = 'outline';
          finalTone = 'secondary';
          break;
        case 'danger':
          finalAppearance = 'solid';
          finalTone = 'danger';
          break;
      }
    }

    // Default values if not specified
    finalAppearance = finalAppearance || 'solid';
    finalTone = finalTone || 'primary';

    const classNames = [
      styles.button,
      styles[finalAppearance],
      styles[finalTone],
      styles[size],
      block && styles.block,
      loading && styles.loading,
      disabled && styles.disabled,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    // Render icon helper
    const renderIcon = (
      icon: IconDefinition | React.ComponentType<any> | undefined,
      position: 'leading' | 'trailing'
    ) => {
      if (!icon) return null;

      const iconClass =
        position === 'leading' ? styles.leadingIcon : styles.trailingIcon;

      // Check if it's a FontAwesome icon
      if ('icon' in icon) {
        return (
          <span className={iconClass}>
            <FontAwesomeIcon icon={icon} />
          </span>
        );
      }

      // Otherwise, it's a Feather icon component
      const FeatherIconComponent = icon as React.ComponentType<any>;
      return (
        <span className={iconClass}>
          <FeatherIconComponent
            size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16}
          />
        </span>
      );
    };

    const buttonContent = (
      <>
        {loading && (
          <span className={styles.spinner} aria-label="Loading">
            <svg
              className={styles.spinnerSvg}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                className={styles.spinnerCircle}
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
              />
            </svg>
          </span>
        )}
        {!loading && renderIcon(leadingIcon, 'leading')}
        <span className={styles.label}>{children}</span>
        {!loading && renderIcon(trailingIcon, 'trailing')}
      </>
    );

    return (
      <Component
        ref={ref}
        className={classNames}
        disabled={disabled || loading}
        aria-busy={loading}
        {...props}
      >
        {buttonContent}
      </Component>
    );
  }
);

Button.displayName = 'Button';

export default Button;
