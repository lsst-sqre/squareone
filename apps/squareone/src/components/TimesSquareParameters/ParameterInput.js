import styled from 'styled-components';
import Alert from '@reach/alert';

export default function ParameterInput({
  children,
  paramName,
  paramSchema,
  touched,
  errors,
}) {
  return (
    <>
      <label htmlFor={`${paramName}`}>
        <ParameterName>{paramName}</ParameterName>
        {children}
        {errors && touched && (
          <ErrorMessage id={`tsparam-${paramName}-error`} type="polite">
            {errors}
          </ErrorMessage>
        )}
        <Description id={`tsparam-${paramName}-description`}>
          {paramSchema.description}
        </Description>
      </label>
    </>
  );
}

const ParameterName = styled.p`
  margin-bottom: 0.2em;
  font-weight: regular;
  font-family: SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono',
    'Courier New', monospace;
`;

const ErrorMessage = styled(Alert)`
  color: red;
  margin-top: 0.2em;
  margin-bottom: 0.2em;
`;

const Description = styled.p`
  font-size: 0.8rem;
  margin-top: 0.2rem;
`;
