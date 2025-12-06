import type React from 'react';
import styles from './CardGroup.module.css';

export type CardGroupProps = {
  /** Card components to display in the grid */
  children?: React.ReactNode;
  /** Minimum card width for responsive grid. Default: "20rem" */
  minCardWidth?: string;
  /** Gap between cards. Default: "1rem" */
  gap?: string;
  /** Optional className for styling overrides */
  className?: string;
};

/**
 * CardGroup component - a responsive grid container for Card components.
 *
 * Uses CSS Grid with auto-fill for responsive layouts.
 *
 * @example
 * ```tsx
 * <CardGroup>
 *   <a href="/docs"><Card>Doc 1</Card></a>
 *   <a href="/api"><Card>API</Card></a>
 * </CardGroup>
 * ```
 */
export function CardGroup({
  children,
  minCardWidth = '20rem',
  gap = '1rem',
  className,
}: CardGroupProps) {
  const rootClassName = className
    ? `${styles.cardGroup} ${className}`
    : styles.cardGroup;

  const style = {
    '--card-group-min-width': minCardWidth,
    '--card-group-gap': gap,
  } as React.CSSProperties;

  return (
    <div className={rootClassName} style={style}>
      {children}
    </div>
  );
}

export default CardGroup;
