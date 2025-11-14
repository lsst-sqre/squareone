import type { ReactNode } from 'react';
import styled from 'styled-components';

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
  touched,
  errors,
}: ParameterInputProps) {
  const errorMessage = computeErrorMessage(errors, paramSchema);
  return (
    <label htmlFor={`${paramName}`}>
      <ParameterName>{paramName}</ParameterName>
      {children}
      {errorMessage && (
        <ErrorMessage id={`tsparam-${paramName}-error`} aria-live="polite">
          {errorMessage}
        </ErrorMessage>
      )}
      <Description id={`tsparam-${paramName}-description`}>
        {paramSchema.description}
      </Description>
    </label>
  );
}

function computeErrorMessage(errors?: string, paramSchema?: ParameterSchema) {
  if (errors) {
    if (paramSchema?.type === 'string' && paramSchema?.format === 'date') {
      return 'Expecting YYYY-MM-DD';
    } else if (
      paramSchema?.type === 'string' &&
      paramSchema?.format === 'date-time'
    ) {
      return 'Expecting YYYY-MM-DDTHH:MM:SS-HH:MM';
    }
    return errors;
  }
  return null;
}

const ParameterName = styled.p`
  margin-bottom: 0.2em;
  font-weight: regular;
  font-family: SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono',
    'Courier New', monospace;
`;

const ErrorMessage = styled.p`
  color: red;
  margin-top: 0.2em;
  margin-bottom: 0.2em;
`;

const Description = styled.p`
  font-size: 0.8rem;
  margin-top: 0.2rem;
`;
