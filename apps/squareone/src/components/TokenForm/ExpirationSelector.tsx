import { FormField, Select } from '@lsst-sqre/squared';
import React from 'react';
import {
  calculateExpirationDate,
  EXPIRATION_OPTIONS,
  type ExpirationValue,
  formatDateOnly,
} from '../../lib/tokens/expiration';
import styles from './ExpirationSelector.module.css';

export type ExpirationSelectorProps = {
  value?: ExpirationValue;
  defaultValue?: ExpirationValue;
  onChange: (value: ExpirationValue) => void;
  timezone?: string;
  disabled?: boolean;
  name: string;
  required?: boolean;
};

export default function ExpirationSelector({
  value,
  defaultValue = { type: 'preset', value: '90d' },
  onChange,
  timezone,
  disabled,
  name,
  required,
}: ExpirationSelectorProps) {
  const handleValueChange = (newValue: string) => {
    const option = EXPIRATION_OPTIONS.find((opt) =>
      opt.value.type === 'never'
        ? newValue === 'never'
        : opt.value.type === 'preset' && newValue === opt.value.value
    );

    if (option) {
      onChange(option.value);
    }
  };

  const getCurrentValue = () => {
    const currentValue = value || defaultValue;
    if (currentValue.type === 'never') {
      return 'never';
    }
    if (currentValue.type === 'preset') {
      return currentValue.value;
    }
    return '90d'; // fallback default
  };

  const getItemLabel = (option: (typeof EXPIRATION_OPTIONS)[0]) => {
    let label = option.label;

    if (option.value.type === 'preset') {
      try {
        const expirationDate = calculateExpirationDate(option.value.value);
        const formattedDate = formatDateOnly(expirationDate, timezone);
        label += ` (${formattedDate})`;
      } catch {
        // If calculation fails, just show the basic label
      }
    }

    return label;
  };

  return (
    <div className={styles.container}>
      <FormField required={required}>
        <FormField.Label htmlFor={name}>Token expiration</FormField.Label>
        <Select
          id={name}
          name={name}
          value={getCurrentValue()}
          onValueChange={handleValueChange}
          disabled={disabled}
          placeholder="Select expiration time"
        >
          {EXPIRATION_OPTIONS.map((option) => (
            <Select.Item
              key={option.value.type === 'never' ? 'never' : option.value.value}
              value={
                option.value.type === 'never' ? 'never' : option.value.value
              }
            >
              {getItemLabel(option)}
            </Select.Item>
          ))}
        </Select>
      </FormField>
    </div>
  );
}
