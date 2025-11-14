import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  formatEventTime,
  formatEventTimeUTC,
  formatEventTimeWithUTC,
  formatTokenExpiration,
  formatTokenLastUsed,
} from './formatters';

describe('TokenDate formatters', () => {
  const SECONDS_PER_MINUTE = 60;
  const SECONDS_PER_HOUR = 3600;
  const SECONDS_PER_DAY = 86400;

  // Mock current time for consistent testing
  const MOCK_NOW = 1704067200; // 2024-01-01 00:00:00 UTC

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(MOCK_NOW * 1000));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('formatEventTime', () => {
    it('returns "just now" for events less than 1 minute ago', () => {
      const thirtySecondsAgo = MOCK_NOW - 30;
      expect(formatEventTime(thirtySecondsAgo)).toBe('just now');
    });

    it('returns "just now" for events exactly at current time', () => {
      expect(formatEventTime(MOCK_NOW)).toBe('just now');
    });

    it('returns "just now" for future events (edge case)', () => {
      const futureTime = MOCK_NOW + 100;
      expect(formatEventTime(futureTime)).toBe('just now');
    });

    it('returns "Xm ago" for events in minutes', () => {
      const twoMinutesAgo = MOCK_NOW - 2 * SECONDS_PER_MINUTE;
      expect(formatEventTime(twoMinutesAgo)).toBe('2m ago');

      const thirtyMinutesAgo = MOCK_NOW - 30 * SECONDS_PER_MINUTE;
      expect(formatEventTime(thirtyMinutesAgo)).toBe('30m ago');

      const fiftyNineMinutesAgo = MOCK_NOW - 59 * SECONDS_PER_MINUTE;
      expect(formatEventTime(fiftyNineMinutesAgo)).toBe('59m ago');
    });

    it('returns "Xh ago" for events in hours', () => {
      const oneHourAgo = MOCK_NOW - SECONDS_PER_HOUR;
      expect(formatEventTime(oneHourAgo)).toBe('1h ago');

      const fiveHoursAgo = MOCK_NOW - 5 * SECONDS_PER_HOUR;
      expect(formatEventTime(fiveHoursAgo)).toBe('5h ago');

      const twentyThreeHoursAgo = MOCK_NOW - 23 * SECONDS_PER_HOUR;
      expect(formatEventTime(twentyThreeHoursAgo)).toBe('23h ago');
    });

    it('returns "Xd ago" for events in days', () => {
      const oneDayAgo = MOCK_NOW - SECONDS_PER_DAY;
      expect(formatEventTime(oneDayAgo)).toBe('1d ago');

      const threeDaysAgo = MOCK_NOW - 3 * SECONDS_PER_DAY;
      expect(formatEventTime(threeDaysAgo)).toBe('3d ago');

      const thirtyDaysAgo = MOCK_NOW - 30 * SECONDS_PER_DAY;
      expect(formatEventTime(thirtyDaysAgo)).toBe('30d ago');

      const oneYearAgo = MOCK_NOW - 365 * SECONDS_PER_DAY;
      expect(formatEventTime(oneYearAgo)).toBe('365d ago');
    });

    it('returns "Unknown time" for null', () => {
      expect(formatEventTime(null)).toBe('Unknown time');
    });

    it('returns "Unknown time" for undefined', () => {
      expect(formatEventTime(undefined)).toBe('Unknown time');
    });
  });

  describe('formatEventTimeUTC', () => {
    it('formats timestamp as UTC string with date and time', () => {
      // 2024-01-01 00:00:00 UTC
      expect(formatEventTimeUTC(MOCK_NOW)).toBe('2024-01-01 00:00:00 UTC');
    });

    it('formats timestamp with non-zero hours, minutes, and seconds', () => {
      // 2024-01-01 14:30:45 UTC
      const timestamp = MOCK_NOW + 14 * SECONDS_PER_HOUR + 30 * 60 + 45;
      expect(formatEventTimeUTC(timestamp)).toBe('2024-01-01 14:30:45 UTC');
    });

    it('pads single-digit values with zeros', () => {
      // 2024-02-05 03:05:07 UTC
      const timestamp = new Date('2024-02-05T03:05:07Z').getTime() / 1000;
      expect(formatEventTimeUTC(timestamp)).toBe('2024-02-05 03:05:07 UTC');
    });

    it('handles midnight correctly', () => {
      // 2024-12-25 00:00:00 UTC
      const timestamp = new Date('2024-12-25T00:00:00Z').getTime() / 1000;
      expect(formatEventTimeUTC(timestamp)).toBe('2024-12-25 00:00:00 UTC');
    });

    it('handles end of day correctly', () => {
      // 2024-12-31 23:59:59 UTC
      const timestamp = new Date('2024-12-31T23:59:59Z').getTime() / 1000;
      expect(formatEventTimeUTC(timestamp)).toBe('2024-12-31 23:59:59 UTC');
    });

    it('returns "Unknown time" for null', () => {
      expect(formatEventTimeUTC(null)).toBe('Unknown time');
    });

    it('returns "Unknown time" for undefined', () => {
      expect(formatEventTimeUTC(undefined)).toBe('Unknown time');
    });
  });

  describe('formatEventTimeWithUTC', () => {
    it('returns object with relative display and ISO datetime', () => {
      const twoHoursAgo = MOCK_NOW - 2 * SECONDS_PER_HOUR;
      const result = formatEventTimeWithUTC(twoHoursAgo);

      expect(result.display).toBe('2h ago');
      expect(result.datetime).toBe(new Date(twoHoursAgo * 1000).toISOString());
    });

    it('returns object with "just now" for recent events', () => {
      const thirtySecondsAgo = MOCK_NOW - 30;
      const result = formatEventTimeWithUTC(thirtySecondsAgo);

      expect(result.display).toBe('just now');
      expect(result.datetime).toBe(
        new Date(thirtySecondsAgo * 1000).toISOString()
      );
    });

    it('returns object with days for old events', () => {
      const tenDaysAgo = MOCK_NOW - 10 * SECONDS_PER_DAY;
      const result = formatEventTimeWithUTC(tenDaysAgo);

      expect(result.display).toBe('10d ago');
      expect(result.datetime).toBe(new Date(tenDaysAgo * 1000).toISOString());
    });

    it('returns object with null datetime for null timestamp', () => {
      const result = formatEventTimeWithUTC(null);

      expect(result.display).toBe('Unknown time');
      expect(result.datetime).toBeNull();
    });

    it('returns object with null datetime for undefined timestamp', () => {
      const result = formatEventTimeWithUTC(undefined);

      expect(result.display).toBe('Unknown time');
      expect(result.datetime).toBeNull();
    });
  });

  describe('formatTokenExpiration (existing functionality)', () => {
    it('returns "Never expires" for null', () => {
      expect(formatTokenExpiration(null)).toMatchObject({
        display: 'Never expires',
        datetime: null,
      });
    });

    it('returns formatted expiration for future date', () => {
      const fiveDaysLater = MOCK_NOW + 5 * SECONDS_PER_DAY;
      const result = formatTokenExpiration(fiveDaysLater);

      expect(result.display).toBe('Expires in 5 days');
      expect(result.datetime).toBe(
        new Date(fiveDaysLater * 1000).toISOString()
      );
    });
  });

  describe('formatTokenLastUsed (existing functionality)', () => {
    it('returns "Never used" for null', () => {
      expect(formatTokenLastUsed(null)).toMatchObject({
        display: 'Never used',
        datetime: null,
      });
    });

    it('returns formatted last used for past date', () => {
      const threeDaysAgo = MOCK_NOW - 3 * SECONDS_PER_DAY;
      const result = formatTokenLastUsed(threeDaysAgo);

      expect(result.display).toBe('Last used 3 days ago');
      expect(result.datetime).toBe(new Date(threeDaysAgo * 1000).toISOString());
    });
  });

  describe('edge cases and boundaries', () => {
    it('handles boundary at 1 minute for formatEventTime', () => {
      const exactlyOneMinute = MOCK_NOW - SECONDS_PER_MINUTE;
      expect(formatEventTime(exactlyOneMinute)).toBe('1m ago');

      const justUnderOneMinute = MOCK_NOW - (SECONDS_PER_MINUTE - 1);
      expect(formatEventTime(justUnderOneMinute)).toBe('just now');
    });

    it('handles boundary at 1 hour for formatEventTime', () => {
      const exactlyOneHour = MOCK_NOW - SECONDS_PER_HOUR;
      expect(formatEventTime(exactlyOneHour)).toBe('1h ago');

      const justUnderOneHour = MOCK_NOW - (SECONDS_PER_HOUR - 1);
      expect(formatEventTime(justUnderOneHour)).toBe('59m ago');
    });

    it('handles boundary at 1 day for formatEventTime', () => {
      const exactlyOneDay = MOCK_NOW - SECONDS_PER_DAY;
      expect(formatEventTime(exactlyOneDay)).toBe('1d ago');

      const justUnderOneDay = MOCK_NOW - (SECONDS_PER_DAY - 1);
      expect(formatEventTime(justUnderOneDay)).toBe('23h ago');
    });

    it('handles month boundaries in UTC formatting', () => {
      // Last day of January
      const timestamp = new Date('2024-01-31T23:59:59Z').getTime() / 1000;
      expect(formatEventTimeUTC(timestamp)).toBe('2024-01-31 23:59:59 UTC');

      // First day of February
      const nextDay = new Date('2024-02-01T00:00:00Z').getTime() / 1000;
      expect(formatEventTimeUTC(nextDay)).toBe('2024-02-01 00:00:00 UTC');
    });

    it('handles year boundaries in UTC formatting', () => {
      // Last moment of 2024
      const endOfYear = new Date('2024-12-31T23:59:59Z').getTime() / 1000;
      expect(formatEventTimeUTC(endOfYear)).toBe('2024-12-31 23:59:59 UTC');

      // First moment of 2025
      const newYear = new Date('2025-01-01T00:00:00Z').getTime() / 1000;
      expect(formatEventTimeUTC(newYear)).toBe('2025-01-01 00:00:00 UTC');
    });

    it('handles leap year in UTC formatting', () => {
      // February 29, 2024 (leap year)
      const leapDay = new Date('2024-02-29T12:00:00Z').getTime() / 1000;
      expect(formatEventTimeUTC(leapDay)).toBe('2024-02-29 12:00:00 UTC');
    });
  });
});
