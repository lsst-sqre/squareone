import type React from 'react';
import styles from './ErrorMessage.module.css';

export type ErrorMessageProps = {
  id?: string;
  message?: string;
  strategy?: 'reserve-space' | 'dynamic';
} & React.ComponentPropsWithoutRef<'span'>;

const ErrorMessage = ({
  id,
  message,
  strategy = 'reserve-space',
  className,
  role,
  'aria-live': ariaLive,
  ...props
}: ErrorMessageProps) => {
  if (!message && strategy === 'dynamic') {
    return null;
  }

  if (!message) {
    return (
      <span
        id={id}
        className={[styles.errorMessage, styles.placeholder, className]
          .filter(Boolean)
          .join(' ')}
        aria-hidden="true"
      />
    );
  }

  // Derive the live-region politeness from the role so that a caller passing
  // role="alert" gets assertive (interrupting) announcements, while the default
  // role="status" stays polite (queued). An explicitly passed aria-live always
  // wins, honoring the caller's override.
  const effectiveRole = role ?? 'status';
  const effectiveAriaLive =
    ariaLive ?? (effectiveRole === 'alert' ? 'assertive' : 'polite');

  return (
    <span
      id={id}
      className={[styles.errorMessage, className].filter(Boolean).join(' ')}
      role={effectiveRole}
      aria-live={effectiveAriaLive}
      aria-atomic="true"
      {...props}
    >
      {message}
    </span>
  );
};

ErrorMessage.displayName = 'ErrorMessage';

export default ErrorMessage;
