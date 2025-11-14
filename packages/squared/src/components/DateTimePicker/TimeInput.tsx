import type React from 'react';
import { forwardRef, useCallback, useRef } from 'react';
// @ts-ignore - ChevronUp and ChevronDown icons exist but missing from react-feather type definitions
import { ChevronDown, ChevronUp } from 'react-feather';
import styles from './TimeInput.module.css';

export type TimeInputProps = {
  value: string; // HH:mm or HH:mm:ss format
  onChange: (value: string) => void;
  showSeconds?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  'aria-label'?: string;
  'aria-describedby'?: string;
};

type TimeField = 'hours' | 'minutes' | 'seconds';

/**
 * TimeInput component for selecting time values
 * Supports both keyboard input and increment/decrement buttons
 */
const TimeInput = forwardRef<HTMLDivElement, TimeInputProps>(
  (
    {
      value,
      onChange,
      showSeconds = false,
      disabled = false,
      size = 'md',
      'aria-label': ariaLabel,
      'aria-describedby': ariaDescribedBy,
    },
    ref
  ) => {
    const hoursRef = useRef<HTMLInputElement>(null);
    const minutesRef = useRef<HTMLInputElement>(null);
    const secondsRef = useRef<HTMLInputElement>(null);

    // Parse time string into components
    const parseTime = useCallback((timeString: string) => {
      const match = timeString.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
      if (!match) {
        return { hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        hours: parseInt(match[1], 10) || 0,
        minutes: parseInt(match[2], 10) || 0,
        seconds: parseInt(match[3], 10) || 0,
      };
    }, []);

    // Format time components into string
    const formatTime = useCallback(
      (hours: number, minutes: number, seconds: number) => {
        const h = Math.max(0, Math.min(23, hours)).toString().padStart(2, '0');
        const m = Math.max(0, Math.min(59, minutes))
          .toString()
          .padStart(2, '0');

        if (showSeconds) {
          const s = Math.max(0, Math.min(59, seconds))
            .toString()
            .padStart(2, '0');
          return `${h}:${m}:${s}`;
        }

        return `${h}:${m}`;
      },
      [showSeconds]
    );

    const currentTime = parseTime(value);

    // Update a specific time field
    const updateTimeField = useCallback(
      (field: TimeField, newValue: number) => {
        const { hours, minutes, seconds } = currentTime;

        let updatedHours = hours;
        let updatedMinutes = minutes;
        let updatedSeconds = seconds;

        switch (field) {
          case 'hours':
            updatedHours = Math.max(0, Math.min(23, newValue));
            break;
          case 'minutes':
            updatedMinutes = Math.max(0, Math.min(59, newValue));
            break;
          case 'seconds':
            updatedSeconds = Math.max(0, Math.min(59, newValue));
            break;
        }

        onChange(formatTime(updatedHours, updatedMinutes, updatedSeconds));
      },
      [currentTime, formatTime, onChange]
    );

    // Increment/decrement handlers
    const incrementField = useCallback(
      (field: TimeField) => {
        const { hours, minutes, seconds } = currentTime;

        switch (field) {
          case 'hours':
            updateTimeField('hours', hours === 23 ? 0 : hours + 1);
            break;
          case 'minutes':
            updateTimeField('minutes', minutes === 59 ? 0 : minutes + 1);
            break;
          case 'seconds':
            updateTimeField('seconds', seconds === 59 ? 0 : seconds + 1);
            break;
        }
      },
      [currentTime, updateTimeField]
    );

    const decrementField = useCallback(
      (field: TimeField) => {
        const { hours, minutes, seconds } = currentTime;

        switch (field) {
          case 'hours':
            updateTimeField('hours', hours === 0 ? 23 : hours - 1);
            break;
          case 'minutes':
            updateTimeField('minutes', minutes === 0 ? 59 : minutes - 1);
            break;
          case 'seconds':
            updateTimeField('seconds', seconds === 0 ? 59 : seconds - 1);
            break;
        }
      },
      [currentTime, updateTimeField]
    );

    // Handle direct input changes
    const handleInputChange = useCallback(
      (field: TimeField, inputValue: string) => {
        const numValue = parseInt(inputValue, 10);
        if (!Number.isNaN(numValue)) {
          updateTimeField(field, numValue);
        }
      },
      [updateTimeField]
    );

    // Handle keyboard navigation
    const handleKeyDown = useCallback(
      (event: React.KeyboardEvent, field: TimeField) => {
        switch (event.key) {
          case 'ArrowUp':
            event.preventDefault();
            incrementField(field);
            break;
          case 'ArrowDown':
            event.preventDefault();
            decrementField(field);
            break;
          case 'Tab':
            // Allow normal tab behavior
            break;
          case 'Enter':
            event.preventDefault();
            // Move to next field or blur if last field
            if (field === 'hours' && minutesRef.current) {
              minutesRef.current.focus();
            } else if (
              field === 'minutes' &&
              showSeconds &&
              secondsRef.current
            ) {
              secondsRef.current.focus();
            } else {
              (event.target as HTMLInputElement).blur();
            }
            break;
          default:
            // Only allow numeric input
            if (
              !/[0-9]/.test(event.key) &&
              !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight'].includes(
                event.key
              )
            ) {
              event.preventDefault();
            }
            break;
        }
      },
      [incrementField, decrementField, showSeconds]
    );

    const containerClassNames = [
      styles.timeInput,
      styles[size],
      disabled && styles.disabled,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div
        ref={ref}
        className={containerClassNames}
        role="group"
        aria-label={ariaLabel || 'Time input'}
        aria-describedby={ariaDescribedBy}
      >
        {/* Hours */}
        <div className={styles.timeField}>
          <div className={styles.spinboxContainer}>
            <input
              ref={hoursRef}
              type="text"
              inputMode="numeric"
              role="spinbutton"
              className={styles.spinboxInput}
              value={currentTime.hours.toString().padStart(2, '0')}
              onChange={(e) => handleInputChange('hours', e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, 'hours')}
              disabled={disabled}
              aria-label="Hours"
              aria-valuemin={0}
              aria-valuemax={23}
              aria-valuenow={currentTime.hours}
              maxLength={2}
            />
            <div className={styles.spinboxButtons}>
              <button
                type="button"
                className={styles.spinboxButton}
                onClick={() => incrementField('hours')}
                disabled={disabled}
                aria-label="Increment hours"
                tabIndex={-1}
              >
                <ChevronUp size={14} />
              </button>
              <button
                type="button"
                className={styles.spinboxButton}
                onClick={() => decrementField('hours')}
                disabled={disabled}
                aria-label="Decrement hours"
                tabIndex={-1}
              >
                <ChevronDown size={14} />
              </button>
            </div>
          </div>
        </div>

        <span className={styles.timeSeparator} aria-hidden="true">
          :
        </span>

        {/* Minutes */}
        <div className={styles.timeField}>
          <div className={styles.spinboxContainer}>
            <input
              ref={minutesRef}
              type="text"
              inputMode="numeric"
              role="spinbutton"
              className={styles.spinboxInput}
              value={currentTime.minutes.toString().padStart(2, '0')}
              onChange={(e) => handleInputChange('minutes', e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, 'minutes')}
              disabled={disabled}
              aria-label="Minutes"
              aria-valuemin={0}
              aria-valuemax={59}
              aria-valuenow={currentTime.minutes}
              maxLength={2}
            />
            <div className={styles.spinboxButtons}>
              <button
                type="button"
                className={styles.spinboxButton}
                onClick={() => incrementField('minutes')}
                disabled={disabled}
                aria-label="Increment minutes"
                tabIndex={-1}
              >
                <ChevronUp size={14} />
              </button>
              <button
                type="button"
                className={styles.spinboxButton}
                onClick={() => decrementField('minutes')}
                disabled={disabled}
                aria-label="Decrement minutes"
                tabIndex={-1}
              >
                <ChevronDown size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Seconds (optional) */}
        {showSeconds && (
          <>
            <span className={styles.timeSeparator} aria-hidden="true">
              :
            </span>
            <div className={styles.timeField}>
              <div className={styles.spinboxContainer}>
                <input
                  ref={secondsRef}
                  type="text"
                  inputMode="numeric"
                  role="spinbutton"
                  className={styles.spinboxInput}
                  value={currentTime.seconds.toString().padStart(2, '0')}
                  onChange={(e) => handleInputChange('seconds', e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, 'seconds')}
                  disabled={disabled}
                  aria-label="Seconds"
                  aria-valuemin={0}
                  aria-valuemax={59}
                  aria-valuenow={currentTime.seconds}
                  maxLength={2}
                />
                <div className={styles.spinboxButtons}>
                  <button
                    type="button"
                    className={styles.spinboxButton}
                    onClick={() => incrementField('seconds')}
                    disabled={disabled}
                    aria-label="Increment seconds"
                    tabIndex={-1}
                  >
                    <ChevronUp size={14} />
                  </button>
                  <button
                    type="button"
                    className={styles.spinboxButton}
                    onClick={() => decrementField('seconds')}
                    disabled={disabled}
                    aria-label="Decrement seconds"
                    tabIndex={-1}
                  >
                    <ChevronDown size={14} />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }
);

TimeInput.displayName = 'TimeInput';

export default TimeInput;
