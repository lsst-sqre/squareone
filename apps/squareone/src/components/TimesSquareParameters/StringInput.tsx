import clsx from 'clsx';
import type { ChangeEvent } from 'react';
import styles from './StringInput.module.css';

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
    <input
      type="text"
      className={clsx(styles.input, isError && styles.inputError)}
      id={`${paramName}`}
      name={`${paramName}`}
      value={value}
      onChange={onChange}
      aria-describedby={`tsparam-${paramName}-error tsparam-${paramName}-description`}
    />
  );
}
