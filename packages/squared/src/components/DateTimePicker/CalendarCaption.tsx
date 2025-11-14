import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { MonthCaptionProps } from 'react-day-picker';
// @ts-expect-error - ChevronLeft and ChevronRight exist but are missing from react-feather type definitions
import { ChevronLeft, ChevronRight } from 'react-feather';
import styles from './DateTimePicker.module.css';

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

type CalendarCaptionProps = MonthCaptionProps & {
  onMonthChange?: (date: Date) => void;
};

/**
 * Custom calendar caption with month select, year input, and navigation arrows
 */
export function CalendarCaption({
  calendarMonth,
  onMonthChange,
}: CalendarCaptionProps) {
  const yearInputRef = useRef<HTMLInputElement>(null);
  const displayMonth = calendarMonth.date;
  const [yearInputValue, setYearInputValue] = useState(
    displayMonth.getFullYear().toString()
  );

  // Sync year input value when displayMonth changes externally
  useEffect(() => {
    setYearInputValue(displayMonth.getFullYear().toString());
  }, [displayMonth]);

  const handlePreviousMonth = useCallback(() => {
    if (onMonthChange) {
      const newDate = new Date(displayMonth);
      newDate.setMonth(newDate.getMonth() - 1);
      onMonthChange(newDate);
    }
  }, [displayMonth, onMonthChange]);

  const handleNextMonth = useCallback(() => {
    if (onMonthChange) {
      const newDate = new Date(displayMonth);
      newDate.setMonth(newDate.getMonth() + 1);
      onMonthChange(newDate);
    }
  }, [displayMonth, onMonthChange]);

  const handleMonthChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      if (onMonthChange) {
        const newDate = new Date(displayMonth);
        newDate.setMonth(parseInt(event.target.value, 10));
        onMonthChange(newDate);
      }
    },
    [displayMonth, onMonthChange]
  );

  const handleYearInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setYearInputValue(value);

      // Only update the calendar if we have a valid 4-digit year
      const year = parseInt(value, 10);
      if (
        value.length === 4 &&
        !Number.isNaN(year) &&
        year >= 1900 &&
        year <= 2100
      ) {
        if (onMonthChange) {
          const newDate = new Date(displayMonth);
          newDate.setFullYear(year);
          onMonthChange(newDate);
        }
      }
    },
    [displayMonth, onMonthChange]
  );

  const handleYearBlur = useCallback(() => {
    // On blur, validate and reset to current year if invalid
    const year = parseInt(yearInputValue, 10);
    if (
      Number.isNaN(year) ||
      year < 1900 ||
      year > 2100 ||
      yearInputValue.length !== 4
    ) {
      setYearInputValue(displayMonth.getFullYear().toString());
    }
  }, [yearInputValue, displayMonth]);

  const handleYearKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      // Prevent non-numeric input
      if (
        event.key !== 'Backspace' &&
        event.key !== 'Delete' &&
        event.key !== 'Tab' &&
        event.key !== 'ArrowLeft' &&
        event.key !== 'ArrowRight' &&
        !/^\d$/.test(event.key)
      ) {
        event.preventDefault();
      }
    },
    []
  );

  return (
    <div className={styles.customCalendarCaption}>
      <button
        type="button"
        className={styles.calendarNavButton}
        onClick={handlePreviousMonth}
        aria-label="Go to previous month"
      >
        <ChevronLeft size={16} />
      </button>

      <div className={styles.calendarCaptionControls}>
        <select
          value={displayMonth.getMonth()}
          onChange={handleMonthChange}
          className={styles.monthSelect}
          aria-label="Select month"
        >
          {MONTHS.map((month, index) => (
            <option key={month} value={index}>
              {month}
            </option>
          ))}
        </select>

        <input
          ref={yearInputRef}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={yearInputValue}
          onChange={handleYearInputChange}
          onBlur={handleYearBlur}
          onKeyDown={handleYearKeyDown}
          className={styles.yearInput}
          aria-label="Enter year"
          maxLength={4}
        />
      </div>

      <button
        type="button"
        className={styles.calendarNavButton}
        onClick={handleNextMonth}
        aria-label="Go to next month"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
