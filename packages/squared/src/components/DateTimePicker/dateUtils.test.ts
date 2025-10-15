import { describe, it, expect } from 'vitest';
import {
  isValidISO8601,
  parseISO8601,
  formatToISO8601,
  createDateFromComponents,
  extractDateComponents,
  combineDateTime,
  formatTime,
  getDateValidationError,
  isDateInRange,
  getTodayInTimezone,
} from './dateUtils';

describe('dateUtils', () => {
  describe('isValidISO8601', () => {
    it('validates correct ISO8601 formats', () => {
      expect(isValidISO8601('2024-03-15T14:30:00Z')).toBe(true);
      expect(isValidISO8601('2024-03-15T14:30:00.000Z')).toBe(true);
      expect(isValidISO8601('2024-03-15T14:30:00+05:30')).toBe(true);
      expect(isValidISO8601('2024-03-15T14:30:00')).toBe(true);
      expect(isValidISO8601('2024-03-15T14:30')).toBe(true);
      expect(isValidISO8601('2024-03-15')).toBe(true);
    });

    it('rejects invalid formats', () => {
      expect(isValidISO8601('')).toBe(false);
      expect(isValidISO8601('invalid')).toBe(false);
      expect(isValidISO8601('2024/03/15')).toBe(false);
      expect(isValidISO8601('2024-13-15')).toBe(false);
      expect(isValidISO8601('2024-03-32')).toBe(false);
      expect(isValidISO8601('2024-03-15T25:00:00')).toBe(false);
    });

    it('handles edge cases', () => {
      expect(isValidISO8601('2024-02-29T00:00:00Z')).toBe(true); // Leap year
      expect(isValidISO8601('2023-02-29T00:00:00Z')).toBe(false); // Not a leap year
    });
  });

  describe('parseISO8601', () => {
    it('parses valid ISO8601 strings', () => {
      const date = parseISO8601('2024-03-15T14:30:00Z');
      expect(date).toBeInstanceOf(Date);
      expect(date?.getUTCFullYear()).toBe(2024);
      expect(date?.getUTCMonth()).toBe(2); // 0-based
      expect(date?.getUTCDate()).toBe(15);
    });

    it('returns null for invalid strings', () => {
      expect(parseISO8601('')).toBe(null);
      expect(parseISO8601('invalid')).toBe(null);
      expect(parseISO8601('2024-13-15')).toBe(null);
    });

    it('handles different formats', () => {
      expect(parseISO8601('2024-03-15')).toBeInstanceOf(Date);
      expect(parseISO8601('2024-03-15T14:30')).toBeInstanceOf(Date);
      expect(parseISO8601('2024-03-15T14:30:00')).toBeInstanceOf(Date);
    });
  });

  describe('formatToISO8601', () => {
    const testDate = new Date('2024-03-15T14:30:45.123Z');

    it('formats with default options (timestamp without seconds)', () => {
      const result = formatToISO8601(testDate);
      expect(result).toBe('2024-03-15T14:30Z');
    });

    it('includes seconds when specified', () => {
      const result = formatToISO8601(testDate, { includeSeconds: true });
      expect(result).toBe('2024-03-15T14:30:45Z');
    });

    it('excludes seconds when includeSeconds is false', () => {
      const result = formatToISO8601(testDate, { includeSeconds: false });
      expect(result).toBe('2024-03-15T14:30Z');
    });

    it('throws error for invalid date', () => {
      expect(() => formatToISO8601(new Date('invalid'))).toThrow(
        'Invalid date provided'
      );
    });
  });

  describe('createDateFromComponents', () => {
    it('creates date from components in UTC', () => {
      const date = createDateFromComponents(2024, 3, 15, 14, 30, 45, 'UTC');
      expect(date.getUTCFullYear()).toBe(2024);
      expect(date.getUTCMonth()).toBe(2); // 0-based
      expect(date.getUTCDate()).toBe(15);
      expect(date.getUTCHours()).toBe(14);
      expect(date.getUTCMinutes()).toBe(30);
      expect(date.getUTCSeconds()).toBe(45);
    });

    it('creates date with default time values', () => {
      const date = createDateFromComponents(2024, 3, 15);
      expect(date.getUTCHours()).toBe(0);
      expect(date.getUTCMinutes()).toBe(0);
      expect(date.getUTCSeconds()).toBe(0);
    });
  });

  describe('extractDateComponents', () => {
    it('extracts components from UTC date', () => {
      const date = new Date('2024-03-15T14:30:45Z');
      const components = extractDateComponents(date, 'UTC');

      expect(components).toEqual({
        year: 2024,
        month: 3,
        day: 15,
        hours: 14,
        minutes: 30,
        seconds: 45,
      });
    });

    it('throws error for invalid date', () => {
      expect(() => extractDateComponents(new Date('invalid'))).toThrow(
        'Invalid date provided'
      );
    });
  });

  describe('combineDateTime', () => {
    const testDate = new Date('2024-03-15T10:00:00Z');

    it('combines date with time string', () => {
      const result = combineDateTime(testDate, '14:30', 'UTC');
      expect(result).toBeInstanceOf(Date);
      expect(result?.getUTCHours()).toBe(14);
      expect(result?.getUTCMinutes()).toBe(30);
    });

    it('handles time with seconds', () => {
      const result = combineDateTime(testDate, '14:30:45', 'UTC');
      expect(result?.getUTCHours()).toBe(14);
      expect(result?.getUTCMinutes()).toBe(30);
      expect(result?.getUTCSeconds()).toBe(45);
    });

    it('returns null for invalid time string', () => {
      expect(combineDateTime(testDate, 'invalid', 'UTC')).toBe(null);
      expect(combineDateTime(testDate, '25:00', 'UTC')).toBe(null);
      expect(combineDateTime(testDate, '14:60', 'UTC')).toBe(null);
    });

    it('returns null for invalid date', () => {
      expect(combineDateTime(new Date('invalid'), '14:30', 'UTC')).toBe(null);
    });
  });

  describe('formatTime', () => {
    const testDate = new Date('2024-03-15T14:30:45Z');

    it('formats time without seconds', () => {
      const result = formatTime(testDate, false, 'UTC');
      expect(result).toBe('14:30');
    });

    it('formats time with seconds', () => {
      const result = formatTime(testDate, true, 'UTC');
      expect(result).toBe('14:30:45');
    });

    it('returns empty string for invalid date', () => {
      const result = formatTime(new Date('invalid'), false, 'UTC');
      expect(result).toBe('');
    });
  });

  describe('isDateInRange', () => {
    const testDate = new Date('2024-03-15T14:30:00Z');
    const minDate = new Date('2024-03-01T00:00:00Z');
    const maxDate = new Date('2024-03-31T23:59:59Z');

    it('returns true for date within range', () => {
      expect(isDateInRange(testDate, minDate, maxDate)).toBe(true);
    });

    it('returns false for date before min', () => {
      const earlyDate = new Date('2024-02-15T14:30:00Z');
      expect(isDateInRange(earlyDate, minDate, maxDate)).toBe(false);
    });

    it('returns false for date after max', () => {
      const lateDate = new Date('2024-04-15T14:30:00Z');
      expect(isDateInRange(lateDate, minDate, maxDate)).toBe(false);
    });

    it('returns true when no constraints', () => {
      expect(isDateInRange(testDate)).toBe(true);
    });

    it('returns false for invalid date', () => {
      expect(isDateInRange(new Date('invalid'), minDate, maxDate)).toBe(false);
    });
  });

  describe('getDateValidationError', () => {
    it('returns null for empty value', () => {
      expect(getDateValidationError('')).toBe(null);
    });

    it('returns error for invalid format', () => {
      const error = getDateValidationError('invalid');
      expect(error).toContain('Please enter a valid date');
    });

    it('returns error for date outside range', () => {
      const minDate = new Date('2024-03-01');
      const maxDate = new Date('2024-03-31');
      const error = getDateValidationError(
        '2024-02-15T14:30:00Z',
        minDate,
        maxDate
      );
      expect(error).toContain('Date must be between');
    });

    it('returns null for valid date in range', () => {
      const minDate = new Date('2024-03-01');
      const maxDate = new Date('2024-03-31');
      const error = getDateValidationError(
        '2024-03-15T14:30:00Z',
        minDate,
        maxDate
      );
      expect(error).toBe(null);
    });
  });

  describe('getTodayInTimezone', () => {
    it('returns a date object', () => {
      const today = getTodayInTimezone('UTC');
      expect(today).toBeInstanceOf(Date);
    });

    it('returns current date in UTC by default', () => {
      const today = getTodayInTimezone();
      expect(today).toBeInstanceOf(Date);
    });
  });
});
