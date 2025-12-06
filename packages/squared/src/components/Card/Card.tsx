import styles from './Card.module.css';

export type CardProps = {
  /** Card content */
  children?: React.ReactNode;
  /** Optional className for styling overrides */
  className?: string;
};

/**
 * Card component for documentation and content display.
 *
 * When wrapped in a link (`<a>`), the card shows a border highlight on hover/focus.
 *
 * @example
 * ```tsx
 * <a href="/docs">
 *   <Card>
 *     <h3>Documentation</h3>
 *     <p>Learn more about the platform.</p>
 *   </Card>
 * </a>
 * ```
 */
export function Card({ children, className }: CardProps) {
  const rootClassName = className ? `${styles.card} ${className}` : styles.card;

  return <article className={rootClassName}>{children}</article>;
}

export default Card;
