import type { TokenCreationError } from '../../hooks/useTokenCreation';
import styles from './TokenCreationErrorDisplay.module.css';

type TokenCreationErrorDisplayProps = {
  error: TokenCreationError;
};

/**
 * Parses an error message string into individual error items.
 * Handles both single errors and multiple errors separated by '; '.
 */
function parseErrorMessage(message: string): string[] {
  // Split on '; ' to handle multiple validation errors
  const errors = message.split('; ').filter((err) => err.trim().length > 0);
  return errors;
}

/**
 * Displays token creation errors in a user-friendly format.
 * Shows multiple validation errors as a list, single errors as a message.
 */
export default function TokenCreationErrorDisplay({
  error,
}: TokenCreationErrorDisplayProps) {
  const errors = parseErrorMessage(error.message);
  const hasMultipleErrors = errors.length > 1;

  return (
    <div role="alert" className={styles.errorAlert}>
      <div className={styles.errorContent}>
        <strong>Error creating token:</strong>

        {hasMultipleErrors ? (
          <ul className={styles.errorList}>
            {errors.map((errorMessage, index) => (
              <li key={index} className={styles.errorListItem}>
                {errorMessage}
              </li>
            ))}
          </ul>
        ) : (
          <span> {errors[0]}</span>
        )}

        {error.status && (
          <div className={styles.statusCode}>Status: {error.status}</div>
        )}
      </div>
    </div>
  );
}

export type { TokenCreationErrorDisplayProps };
