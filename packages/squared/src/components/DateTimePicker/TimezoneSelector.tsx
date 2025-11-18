import type React from 'react';
import { useMemo } from 'react';
import { Select } from '../Select';
import { formatTimezoneDisplay, getTimezoneGroups } from './timezoneUtils';

export type TimezoneSelectorProps = {
  value: string;
  onChange: (timezone: string) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  'aria-label'?: string;
  'aria-describedby'?: string;
};

/**
 * TimezoneSelector component for selecting timezones
 * Uses the Select component with grouped timezone options
 */
const TimezoneSelector: React.FC<TimezoneSelectorProps> = ({
  value,
  onChange,
  disabled = false,
  size = 'md',
  fullWidth = false,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
}) => {
  // Memoize timezone groups to avoid recalculating on every render
  const timezoneGroups = useMemo(() => getTimezoneGroups(), []);

  // Format the current timezone for display
  const _currentTimezoneDisplay = useMemo(() => {
    return formatTimezoneDisplay(value);
  }, [value]);

  return (
    <Select
      value={value}
      onValueChange={onChange}
      disabled={disabled}
      size={size}
      fullWidth={fullWidth}
      placeholder="Select timezone"
      aria-label={ariaLabel || 'Select timezone'}
      aria-describedby={ariaDescribedBy}
    >
      {timezoneGroups.map((group) => (
        <Select.Group key={group.label} label={group.label}>
          {group.timezones.map((timezone) => (
            <Select.Item key={timezone.value} value={timezone.value}>
              {timezone.label}
            </Select.Item>
          ))}
        </Select.Group>
      ))}
    </Select>
  );
};

TimezoneSelector.displayName = 'TimezoneSelector';

export default TimezoneSelector;
