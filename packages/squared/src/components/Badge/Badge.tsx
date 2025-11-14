import type React from 'react';
import styles from './Badge.module.css';

export type BadgeColor =
  | 'primary'
  | 'blue'
  | 'green'
  | 'orange'
  | 'purple'
  | 'red'
  | 'yellow'
  | 'gray';

export type BadgeVariant = 'solid' | 'soft' | 'outline';

export type BadgeRadius = 'none' | '1' | 'full';

export type BadgeSize = 'sm' | 'md' | 'lg';

export type BadgeProps = {
  /**
   * The visual variant of the badge
   * @default 'soft'
   */
  variant?: BadgeVariant;

  /**
   * The semantic color of the badge
   * @default 'primary'
   */
  color?: BadgeColor;

  /**
   * The corner radius style
   * @default '1'
   */
  radius?: BadgeRadius;

  /**
   * The size of the badge
   * @default 'md'
   */
  size?: BadgeSize;

  /**
   * The content to display in the badge
   */
  children: React.ReactNode;

  /**
   * Additional CSS class names
   */
  className?: string;
} & React.HTMLAttributes<HTMLSpanElement>;

export function Badge({
  variant = 'soft',
  color = 'primary',
  radius = '1',
  size = 'md',
  children,
  className,
  ...props
}: BadgeProps) {
  const variantClass = styles[variant];
  const colorClass = styles[color];
  const radiusClass =
    styles[`radius${radius.charAt(0).toUpperCase()}${radius.slice(1)}`];
  const sizeClass = styles[size];

  const classNames = [
    styles.badge,
    variantClass,
    colorClass,
    radiusClass,
    sizeClass,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classNames} {...props}>
      {children}
    </span>
  );
}
