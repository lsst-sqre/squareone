import type { ChangeEvent } from 'react';
import styled from 'styled-components';

type StringInputProps = {
  paramName: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  isError?: boolean;
};

export default function StringInput({
  paramName,
  value,
  onChange,
  isError,
}: StringInputProps) {
  return (
    <StyledInput
      type="text"
      id={`${paramName}`}
      name={`${paramName}`}
      value={value}
      onChange={onChange}
      $isError={isError}
      aria-describedby={`tsparam-${paramName}-error tsparam-${paramName}-description`}
    />
  );
}

const StyledInput = styled.input<{ $isError?: boolean }>`
  border-width: 2px;
  border-style: solid;
  border-color: ${(props) =>
    props.$isError ? 'var(--rsd-color-red-500)' : 'var(--rsd-color-gray-500)'};
  padding: 5px 10px;
  border-radius: 5px;
  appearance: none;
`;
