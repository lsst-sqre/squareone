import styled from 'styled-components';

export default function ParameterInput({
  children,
  paramName,
  paramSchema,
  touched,
  errors,
}) {
  return (
    <>
      <label htmlFor={paramName}>
        <ParameterName>{paramName}</ParameterName>
        {children}
        {errors && touched && <ErrorMessage>{errors}</ErrorMessage>}
        <Description>{paramSchema.description}</Description>
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

const ErrorMessage = styled.p`
  color: red;
  margin-top: 0.2em;
  margin-bottom: 0.2em;
`;

const Description = styled.p`
  font-size: 0.8rem;
  margin-top: 0.2rem;
`;
