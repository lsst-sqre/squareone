import React from 'react';
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

  return (
    <span
      id={id}
      className={[styles.errorMessage, className].filter(Boolean).join(' ')}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      {...props}
    >
      {message}
    </span>
  );
};

ErrorMessage.displayName = 'ErrorMessage';

export default ErrorMessage;
