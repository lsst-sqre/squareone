import styled from 'styled-components';

export default function StringInput({ paramName, value, onChange, isError }) {
  return (
    <StyledInput
      type="text"
      id={`${paramName}`}
      name={`${paramName}`}
      value={value}
      onChange={onChange}
      isError={isError}
      aria-describedby={`tsparam-${paramName}-error tsparam-${paramName}-description`}
    />
  );
}

const StyledInput = styled.input`
  border-width: 2px;
  border-style: solid;
  border-color: ${(props) =>
    props.isError ? 'var(--rsd-color-red-500)' : 'var(--rsd-color-gray-500)'};
  padding: 5px 10px;
  border-radius: 5px;
  appearance: none;
`;
