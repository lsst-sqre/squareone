import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { formatExpiration, formatLastUsed } from './dateFormatters';

describe('dateFormatters', () => {
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

  describe('formatExpiration', () => {
    it('returns "Never expires" for null', () => {
      expect(formatExpiration(null)).toBe('Never expires');
    });

    it('returns "Expired" for past timestamps', () => {
      const pastTime = MOCK_NOW - SECONDS_PER_HOUR;
      expect(formatExpiration(pastTime)).toBe('Expired');
    });

    it('returns "Expires in less than 1 hour" for < 1 hour', () => {
      const soonTime = MOCK_NOW + 1800; // 30 minutes
      expect(formatExpiration(soonTime)).toBe('Expires in less than 1 hour');
    });

    it('returns "Expires in X hours" for 1-23 hours (singular)', () => {
      const oneHour = MOCK_NOW + SECONDS_PER_HOUR;
      expect(formatExpiration(oneHour)).toBe('Expires in 1 hour');
    });

    it('returns "Expires in X hours" for 1-23 hours (plural)', () => {
      const fiveHours = MOCK_NOW + 5 * SECONDS_PER_HOUR;
      expect(formatExpiration(fiveHours)).toBe('Expires in 5 hours');
    });

    it('returns "Expires in X days" for 1-6 days (singular)', () => {
      const oneDay = MOCK_NOW + SECONDS_PER_DAY;
      expect(formatExpiration(oneDay)).toBe('Expires in 1 day');
    });

    it('returns "Expires in X days" for 1-6 days (plural)', () => {
      const threeDays = MOCK_NOW + 3 * SECONDS_PER_DAY;
      expect(formatExpiration(threeDays)).toBe('Expires in 3 days');
    });

    it('returns "Expires on YYYY-MM-DD" for 7+ days', () => {
      const tenDays = MOCK_NOW + 10 * SECONDS_PER_DAY;
      expect(formatExpiration(tenDays)).toBe('Expires on 2024-01-11');
    });

    it('returns "Expires on YYYY-MM-DD" for far future dates', () => {
      const oneYear = MOCK_NOW + 365 * SECONDS_PER_DAY;
      expect(formatExpiration(oneYear)).toBe('Expires on 2024-12-31');
    });

    it('handles edge case at exactly 24 hours', () => {
      const exactlyOneDay = MOCK_NOW + SECONDS_PER_DAY;
      expect(formatExpiration(exactlyOneDay)).toBe('Expires in 1 day');
    });

    it('handles edge case at exactly 7 days', () => {
      const exactlySevenDays = MOCK_NOW + 7 * SECONDS_PER_DAY;
      expect(formatExpiration(exactlySevenDays)).toBe('Expires on 2024-01-08');
    });
  });

  describe('formatLastUsed', () => {
    it('returns "Never used" for null', () => {
      expect(formatLastUsed(null)).toBe('Never used');
    });

    it('returns "Last used less than 1 hour ago" for < 1 hour', () => {
      const recentTime = MOCK_NOW - 1800; // 30 minutes ago
      expect(formatLastUsed(recentTime)).toBe('Last used less than 1 hour ago');
    });

    it('returns "Last used X hours ago" for 1-23 hours (singular)', () => {
      const oneHourAgo = MOCK_NOW - SECONDS_PER_HOUR;
      expect(formatLastUsed(oneHourAgo)).toBe('Last used 1 hour ago');
    });

    it('returns "Last used X hours ago" for 1-23 hours (plural)', () => {
      const fiveHoursAgo = MOCK_NOW - 5 * SECONDS_PER_HOUR;
      expect(formatLastUsed(fiveHoursAgo)).toBe('Last used 5 hours ago');
    });

    it('returns "Last used X days ago" for 1-6 days (singular)', () => {
      const oneDayAgo = MOCK_NOW - SECONDS_PER_DAY;
      expect(formatLastUsed(oneDayAgo)).toBe('Last used 1 day ago');
    });

    it('returns "Last used X days ago" for 1-6 days (plural)', () => {
      const threeDaysAgo = MOCK_NOW - 3 * SECONDS_PER_DAY;
      expect(formatLastUsed(threeDaysAgo)).toBe('Last used 3 days ago');
    });

    it('returns "Last used YYYY-MM-DD" for 7+ days', () => {
      const tenDaysAgo = MOCK_NOW - 10 * SECONDS_PER_DAY;
      expect(formatLastUsed(tenDaysAgo)).toBe('Last used 2023-12-22');
    });

    it('returns "Last used YYYY-MM-DD" for far past dates', () => {
      const oneYearAgo = MOCK_NOW - 365 * SECONDS_PER_DAY;
      expect(formatLastUsed(oneYearAgo)).toBe('Last used 2023-01-01');
    });

    it('handles edge case at exactly 24 hours', () => {
      const exactlyOneDay = MOCK_NOW - SECONDS_PER_DAY;
      expect(formatLastUsed(exactlyOneDay)).toBe('Last used 1 day ago');
    });

    it('handles edge case at exactly 7 days', () => {
      const exactlySevenDays = MOCK_NOW - 7 * SECONDS_PER_DAY;
      expect(formatLastUsed(exactlySevenDays)).toBe('Last used 2023-12-25');
    });
  });

  describe('date formatting edge cases', () => {
    it('handles month boundaries correctly', () => {
      // Set time to end of January
      vi.setSystemTime(new Date('2024-01-31T00:00:00Z'));
      const nowSeconds = Math.floor(Date.now() / 1000);

      // 5 days forward crosses into February
      const fiveDaysLater = nowSeconds + 5 * SECONDS_PER_DAY;
      expect(formatExpiration(fiveDaysLater)).toBe('Expires in 5 days');

      // 10 days forward shows absolute date in February
      const tenDaysLater = nowSeconds + 10 * SECONDS_PER_DAY;
      expect(formatExpiration(tenDaysLater)).toBe('Expires on 2024-02-10');
    });

    it('handles year boundaries correctly', () => {
      // Set time to end of December
      vi.setSystemTime(new Date('2024-12-31T00:00:00Z'));
      const nowSeconds = Math.floor(Date.now() / 1000);

      // 5 days forward crosses into new year
      const fiveDaysLater = nowSeconds + 5 * SECONDS_PER_DAY;
      expect(formatExpiration(fiveDaysLater)).toBe('Expires in 5 days');

      // 10 days forward shows absolute date in new year
      const tenDaysLater = nowSeconds + 10 * SECONDS_PER_DAY;
      expect(formatExpiration(tenDaysLater)).toBe('Expires on 2025-01-10');
    });

    it('pads single-digit months and days in absolute dates', () => {
      vi.setSystemTime(new Date('2024-01-01T00:00:00Z'));
      const nowSeconds = Math.floor(Date.now() / 1000);

      // February 5th should be 2024-02-05
      const feb5 = new Date('2024-02-05T00:00:00Z').getTime() / 1000;
      expect(formatExpiration(feb5)).toBe('Expires on 2024-02-05');

      // March 1st should be 2024-03-01
      const mar1 = new Date('2024-03-01T00:00:00Z').getTime() / 1000;
      expect(formatExpiration(mar1)).toBe('Expires on 2024-03-01');
    });
  });
});
