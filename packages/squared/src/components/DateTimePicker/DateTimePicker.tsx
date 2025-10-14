import React, {
  forwardRef,
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
} from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { DayPicker } from 'react-day-picker';
// @ts-ignore - Calendar icon exists but is missing from react-feather type definitions
import { Calendar } from 'react-feather';
import { TextInput } from '../TextInput';
import TimeInput from './TimeInput';
import TimezoneSelector from './TimezoneSelector';
import { CalendarCaption } from './CalendarCaption';
import {
  isValidISO8601,
  parseISO8601,
  formatToISO8601,
  extractDateComponents,
  createDateFromComponents,
  formatTime,
  isDateInRange,
} from './dateUtils';
import { getBrowserTimezone, getCurrentTimeInTimezone } from './timezoneUtils';
import styles from './DateTimePicker.module.css';

export type DateTimePickerProps = {
  defaultValue?: string | null; // ISO8601 timestamp string
  onChange: (iso8601: string) => void; // Returns ISO8601 string only
  defaultTimezone?: string; // IANA timezone identifier, or 'local' for browser timezone. Default: 'local'
  onTimezoneChange?: (timezone: string) => void;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  showSeconds?: boolean; // Default: false
  showTimezone?: boolean; // Default: true
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
};

/**
 * DateTimePicker component for selecting timestamps with timezone support
 *
 * Accepts ISO8601 timestamp strings and returns ISO8601 strings via onChange.
 * The component displays an editable ISO8601 text input with calendar popover,
 * time controls, and timezone selector.
 *
 * **Key Concepts:**
 * - `defaultValue` prop: ISO8601 string representing the initial timestamp
 * - `defaultTimezone` prop: Controls initial timezone and how defaultValue is interpreted
 * - `onChange`: Returns an ISO8601 string with timezone offset
 *
 * **Usage:**
 * ```tsx
 * // Simple usage with local timezone
 * <DateTimePicker
 *   defaultValue="2024-03-15T14:30:00Z"
 *   defaultTimezone="local"
 *   onChange={(iso) => console.log(iso)}
 * />
 *
 * // Fixed UTC timezone
 * <DateTimePicker
 *   defaultValue="2024-03-15T14:30:00Z"
 *   defaultTimezone="UTC"
 *   showTimezone={false}
 *   onChange={(iso) => console.log(iso)}
 * />
 * ```
 *
 * @param defaultValue - ISO8601 timestamp string, or null/undefined for empty
 * @param onChange - Callback that receives ISO8601 timestamp string
 * @param defaultTimezone - IANA timezone identifier (e.g., 'America/New_York'), 'UTC', or 'local' for browser timezone. Default: 'local'
 * @param showTimezone - Whether to show the timezone selector in the popover. Default: true
 * @param showSeconds - Whether to include seconds in the timestamp. Default: false
 */
const DateTimePicker = forwardRef<HTMLDivElement, DateTimePickerProps>(
  (
    {
      defaultValue = null,
      onChange,
      defaultTimezone = 'local',
      onTimezoneChange,
      minDate,
      maxDate,
      disabled = false,
      showSeconds = false,
      showTimezone = true,
      placeholder,
      size = 'md',
      fullWidth = false,
      'aria-label': ariaLabel,
      'aria-describedby': ariaDescribedBy,
      'aria-invalid': ariaInvalid,
    },
    ref
  ) => {
    // Resolve timezone: 'local' becomes browser timezone, otherwise use the provided value
    const currentTimezone = useMemo(() => {
      if (defaultTimezone === 'local') return getBrowserTimezone();
      return defaultTimezone;
    }, [defaultTimezone]);

    // State management
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);

    // Display value is initialized from defaultValue (ISO8601 string)
    const [displayValue, setDisplayValue] = useState<string>(() => {
      if (!defaultValue) return '';
      // Parse ISO8601 string and format in defaultTimezone
      const date = parseISO8601(defaultValue);
      if (!date) return '';
      return formatToISO8601(date, {
        includeTime: true,
        includeSeconds: showSeconds,
        timezone: currentTimezone,
      });
    });

    const [selectedTimezone, setSelectedTimezone] = useState<string>(() => {
      return currentTimezone;
    });

    const [calendarMonth, setCalendarMonth] = useState<Date>(() => {
      if (defaultValue) {
        const date = parseISO8601(defaultValue);
        if (date) return date;
      }
      return getCurrentTimeInTimezone(currentTimezone);
    });

    // Refs
    const inputRef = useRef<HTMLInputElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);

    // Parse current date/time from display input
    const currentDate = useMemo(
      () => parseISO8601(displayValue),
      [displayValue]
    );
    const isInputValid = useMemo(() => {
      if (!displayValue) return true; // Empty is valid
      return (
        isValidISO8601(displayValue) &&
        (!currentDate || isDateInRange(currentDate, minDate, maxDate))
      );
    }, [displayValue, currentDate, minDate, maxDate]);

    // Get validation error message
    const validationError = useMemo(() => {
      if (!displayValue) return null;

      if (!isValidISO8601(displayValue)) {
        let formatExample = 'YYYY-MM-DD';
        formatExample += showSeconds ? 'THH:mm:ss' : 'THH:mm';
        if (showTimezone) {
          formatExample += 'Z';
        }
        return `Please enter a valid date in ISO8601 format (${formatExample})`;
      }

      const date = parseISO8601(displayValue);
      if (!date) {
        return 'Invalid date';
      }

      if (!isDateInRange(date, minDate, maxDate)) {
        if (minDate && maxDate) {
          return `Date must be between ${
            minDate.toISOString().split('T')[0]
          } and ${maxDate.toISOString().split('T')[0]}`;
        } else if (minDate) {
          return `Date must be after ${minDate.toISOString().split('T')[0]}`;
        } else if (maxDate) {
          return `Date must be before ${maxDate.toISOString().split('T')[0]}`;
        }
      }

      return null;
    }, [displayValue, minDate, maxDate, showSeconds, showTimezone]);

    // Extract time components from current date
    const timeComponents = useMemo(() => {
      if (!currentDate) {
        const now = getCurrentTimeInTimezone(selectedTimezone);
        return extractDateComponents(now, selectedTimezone);
      }
      return extractDateComponents(currentDate, selectedTimezone);
    }, [currentDate, selectedTimezone]);

    // Handle input value changes
    const handleInputChange = useCallback(
      (newValue: string) => {
        setDisplayValue(newValue);

        // If the input is valid, update the parent
        if (isValidISO8601(newValue)) {
          const parsed = parseISO8601(newValue);
          if (parsed && isDateInRange(parsed, minDate, maxDate)) {
            onChange(newValue);
            // Update calendar month to match the selected date
            setCalendarMonth(parsed);
          }
        } else if (!newValue) {
          // Handle empty input
          onChange('');
        }
      },
      [onChange, minDate, maxDate]
    );

    // Handle calendar date selection
    const handleDateSelect = useCallback(
      (selectedDate: Date | undefined) => {
        if (!selectedDate) return;

        let newDateTime: Date;

        if (currentDate) {
          // Preserve existing time components when changing date
          const timeComponents = extractDateComponents(
            currentDate,
            selectedTimezone
          );
          newDateTime = createDateFromComponents(
            selectedDate.getFullYear(),
            selectedDate.getMonth() + 1,
            selectedDate.getDate(),
            timeComponents.hours,
            timeComponents.minutes,
            showSeconds ? timeComponents.seconds : 0,
            selectedTimezone
          );
        } else {
          // Default to 00:00:00 if no current time
          newDateTime = createDateFromComponents(
            selectedDate.getFullYear(),
            selectedDate.getMonth() + 1,
            selectedDate.getDate(),
            0,
            0,
            0,
            selectedTimezone
          );
        }

        const isoString = formatToISO8601(newDateTime, {
          includeTime: true,
          includeSeconds: showSeconds,
          timezone: selectedTimezone,
        });

        setDisplayValue(isoString);
        onChange(isoString);
        // Keep popover open to allow time/timezone adjustments
      },
      [currentDate, showSeconds, selectedTimezone, onChange]
    );

    // Handle time changes
    const handleTimeChange = useCallback(
      (timeString: string) => {
        const timeMatch = timeString.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
        if (!timeMatch) return;

        const hours = parseInt(timeMatch[1], 10);
        const minutes = parseInt(timeMatch[2], 10);
        const seconds = timeMatch[3] ? parseInt(timeMatch[3], 10) : 0;

        if (hours > 23 || minutes > 59 || seconds > 59) return;

        let dateComponents;
        if (!currentDate) {
          const today = getCurrentTimeInTimezone(selectedTimezone);
          dateComponents = extractDateComponents(today, selectedTimezone);
        } else {
          dateComponents = extractDateComponents(currentDate, selectedTimezone);
        }

        const newDateTime = createDateFromComponents(
          dateComponents.year,
          dateComponents.month,
          dateComponents.day,
          hours,
          minutes,
          showSeconds ? seconds : 0,
          selectedTimezone
        );

        const isoString = formatToISO8601(newDateTime, {
          includeTime: true,
          includeSeconds: showSeconds,
          timezone: selectedTimezone,
        });

        setDisplayValue(isoString);
        onChange(isoString);
      },
      [currentDate, selectedTimezone, showSeconds, onChange]
    );

    // Handle timezone changes
    const handleTimezoneChange = useCallback(
      (newTimezone: string) => {
        // Update internal state first
        setSelectedTimezone(newTimezone);

        if (onTimezoneChange) {
          onTimezoneChange(newTimezone);
        }

        // Preserve the date/time digits but change the timezone offset
        if (currentDate) {
          // Extract date/time components from current timezone
          const components = extractDateComponents(
            currentDate,
            selectedTimezone
          );

          // Create a new date with the same components in the new timezone
          const newDateTime = createDateFromComponents(
            components.year,
            components.month,
            components.day,
            components.hours,
            components.minutes,
            showSeconds ? components.seconds : 0,
            newTimezone
          );

          const isoString = formatToISO8601(newDateTime, {
            includeTime: true,
            includeSeconds: showSeconds,
            timezone: newTimezone,
          });
          setDisplayValue(isoString);
          onChange(isoString);
        }
      },
      [currentDate, selectedTimezone, showSeconds, onChange, onTimezoneChange]
    );

    // Handle calendar button click
    const handleCalendarToggle = useCallback(() => {
      if (disabled) return;
      setIsCalendarOpen((prev) => !prev);
    }, [disabled]);

    // Handle keyboard events
    const handleKeyDown = useCallback(
      (event: React.KeyboardEvent) => {
        if (event.key === 'Escape' && isCalendarOpen) {
          setIsCalendarOpen(false);
          inputRef.current?.focus();
        }
      },
      [isCalendarOpen]
    );

    // Generate placeholder text
    const placeholderText = useMemo(() => {
      if (placeholder) return placeholder;

      let format = 'YYYY-MM-DD';
      format += showSeconds ? 'THH:mm:ss' : 'THH:mm';
      if (showTimezone) {
        format += 'Z';
      }
      return format;
    }, [placeholder, showSeconds, showTimezone]);

    // Format current time for TimeInput
    const currentTimeString = useMemo(() => {
      if (!currentDate) {
        const now = getCurrentTimeInTimezone(selectedTimezone);
        return formatTime(now, showSeconds, selectedTimezone);
      }
      return formatTime(currentDate, showSeconds, selectedTimezone);
    }, [currentDate, selectedTimezone, showSeconds]);

    const containerClassNames = [
      styles.dateTimePicker,
      fullWidth && styles.fullWidth,
    ]
      .filter(Boolean)
      .join(' ');

    // Calculate dynamic input width based on content
    const inputWidth = useMemo(() => {
      const content = displayValue || placeholderText;
      // Add extra space for padding and button - varies by size due to different base padding
      const extraChars = size === 'lg' ? 10 : size === 'sm' ? 7 : 8;
      const charCount = content.length + extraChars;
      return `${charCount}ch`;
    }, [displayValue, placeholderText, size]);

    return (
      <div ref={ref} className={containerClassNames} onKeyDown={handleKeyDown}>
        {/* Main input section */}
        <div className={styles.inputSection}>
          <PopoverPrimitive.Root
            open={isCalendarOpen}
            onOpenChange={setIsCalendarOpen}
          >
            <TextInput
              ref={inputRef}
              value={displayValue}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder={placeholderText}
              disabled={disabled}
              size={size}
              appearance={validationError ? 'error' : 'default'}
              aria-label={ariaLabel}
              aria-describedby={ariaDescribedBy}
              aria-invalid={ariaInvalid || !!validationError}
              style={{ width: inputWidth }}
              trailingAction={
                <PopoverPrimitive.Trigger asChild>
                  <button
                    ref={triggerRef}
                    type="button"
                    className={styles.calendarButton}
                    disabled={disabled}
                    aria-label="Open calendar"
                  >
                    <Calendar size={16} />
                  </button>
                </PopoverPrimitive.Trigger>
              }
            />

            <PopoverPrimitive.Portal>
              <PopoverPrimitive.Content
                className={styles.calendarPopover}
                align="start"
                sideOffset={4}
              >
                <div className={styles.calendarContainer}>
                  <DayPicker
                    mode="single"
                    selected={currentDate || undefined}
                    onSelect={handleDateSelect}
                    month={calendarMonth}
                    onMonthChange={setCalendarMonth}
                    disabled={[
                      ...(minDate ? [{ before: minDate }] : []),
                      ...(maxDate ? [{ after: maxDate }] : []),
                    ]}
                    hideNavigation
                    className={styles.calendar}
                    components={{
                      MonthCaption: (props) => (
                        <CalendarCaption
                          {...props}
                          onMonthChange={setCalendarMonth}
                        />
                      ),
                    }}
                    classNames={{
                      months: styles.calendarMonths,
                      month: styles.calendarMonth,
                      caption: styles.calendarCaption,
                      caption_label: styles.calendarCaptionLabel,
                      nav: styles.calendarNav,
                      nav_button: styles.calendarNavButton,
                      nav_button_previous: styles.calendarNavButtonPrevious,
                      nav_button_next: styles.calendarNavButtonNext,
                      table: styles.calendarTable,
                      head_row: styles.calendarHeadRow,
                      head_cell: styles.calendarHeadCell,
                      row: styles.calendarRow,
                      cell: styles.calendarCell,
                      day: styles.calendarDay,
                      day_selected: styles.calendarDaySelected,
                      day_today: styles.calendarDayToday,
                      day_outside: styles.calendarDayOutside,
                      day_disabled: styles.calendarDayDisabled,
                      day_hidden: styles.calendarDayHidden,
                    }}
                  />

                  <div className={styles.timeSection}>
                    <div className={styles.timeSectionLabel}>Time</div>
                    <TimeInput
                      value={currentTimeString}
                      onChange={handleTimeChange}
                      showSeconds={showSeconds}
                      disabled={disabled}
                      size={size}
                      aria-label="Select time"
                    />
                  </div>

                  {showTimezone && (
                    <div className={styles.timezoneSection}>
                      <div className={styles.timezoneSectionLabel}>
                        Timezone
                      </div>
                      <TimezoneSelector
                        value={selectedTimezone}
                        onChange={handleTimezoneChange}
                        disabled={disabled}
                        size={size}
                        fullWidth
                        aria-label="Select timezone"
                      />
                    </div>
                  )}
                </div>
              </PopoverPrimitive.Content>
            </PopoverPrimitive.Portal>
          </PopoverPrimitive.Root>
        </div>

        {/* Error message */}
        {validationError && (
          <div className={styles.errorMessage} role="alert">
            {validationError}
          </div>
        )}
      </div>
    );
  }
);

DateTimePicker.displayName = 'DateTimePicker';

export default DateTimePicker;
