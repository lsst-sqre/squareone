import type { ReactNode } from 'react';
import styles from './ParameterInput.module.css';

type ParameterSchema = {
  type: string;
  format?: string;
  description: string;
};

type ParameterInputProps = {
  children: ReactNode;
  paramName: string;
  paramSchema: ParameterSchema;
  touched?: boolean;
  errors?: string;
};

export default function ParameterInput({
  children,
  paramName,
  paramSchema,
  touched: _touched,
  errors,
}: ParameterInputProps) {
  const errorMessage = computeErrorMessage(errors, paramSchema);
  return (
    <label htmlFor={`${paramName}`}>
      <p className={styles.parameterName}>{paramName}</p>
      {children}
      {errorMessage && (
        <p
          className={styles.errorMessage}
          id={`tsparam-${paramName}-error`}
          aria-live="polite"
        >
          {errorMessage}
        </p>
      )}
      <p className={styles.description} id={`tsparam-${paramName}-description`}>
        {paramSchema.description}
      </p>
    </label>
  );
}

function computeErrorMessage(errors?: string, paramSchema?: ParameterSchema) {
  if (errors) {
    if (paramSchema?.type === 'string' && paramSchema?.format === 'date') {
      return 'Expecting YYYY-MM-DD';
    }
    if (paramSchema?.type === 'string' && paramSchema?.format === 'date-time') {
      return 'Expecting YYYY-MM-DDTHH:MM:SS-HH:MM';
    }
    return errors;
  }
  return null;
}
