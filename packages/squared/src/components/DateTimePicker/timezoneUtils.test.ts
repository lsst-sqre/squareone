import { describe, expect, it, vi } from 'vitest';
import {
  convertTimezone,
  formatTimezoneDisplay,
  getAllTimezones,
  getBrowserTimezone,
  getCommonTimezones,
  getCurrentTimeInTimezone,
  getTimezoneGroups,
  getTimezoneLabel,
  getTimezoneOffset,
  isValidTimezone,
  searchTimezones,
} from './timezoneUtils';

describe('timezoneUtils', () => {
  describe('getAllTimezones', () => {
    it('returns an array of timezone identifiers', () => {
      const timezones = getAllTimezones();
      expect(Array.isArray(timezones)).toBe(true);
      expect(timezones.length).toBeGreaterThan(0);
      expect(timezones).toContain('UTC');
      expect(timezones).toContain('America/New_York');
      expect(timezones).toContain('Europe/London');
    });
  });

  describe('getTimezoneGroups', () => {
    it('returns grouped timezones with labels and offsets', () => {
      const groups = getTimezoneGroups();
      expect(Array.isArray(groups)).toBe(true);
      expect(groups.length).toBeGreaterThan(0);

      const utcGroup = groups.find((g) => g.label === 'UTC');
      expect(utcGroup).toBeDefined();

      // Check that the UTC group has the expected structure
      const firstTimezone = utcGroup?.timezones[0];
      expect(firstTimezone).toMatchObject({
        value: 'UTC',
        label: expect.any(String),
        offset: expect.any(String),
      });
    });

    it('includes proper group structure', () => {
      const groups = getTimezoneGroups();
      const groupLabels = groups.map((g) => g.label);

      expect(groupLabels).toContain('UTC');
      expect(groupLabels).toContain('North America');
      expect(groupLabels).toContain('Europe');
      expect(groupLabels).toContain('Asia');
    });
  });

  describe('getTimezoneLabel', () => {
    it('returns proper label for UTC', () => {
      const label = getTimezoneLabel('UTC');
      expect(label).toBe('UTC');
    });

    it('converts timezone identifiers to readable format', () => {
      expect(getTimezoneLabel('America/New_York')).toBe('New York (Eastern)');
      expect(getTimezoneLabel('Europe/London')).toBe('London');
      expect(getTimezoneLabel('Asia/Tokyo')).toBe('Tokyo');
    });

    it('handles underscores in city names', () => {
      expect(getTimezoneLabel('America/Los_Angeles')).toBe(
        'Los Angeles (Pacific)'
      );
      expect(getTimezoneLabel('America/Sao_Paulo')).toBe('São Paulo');
    });
  });

  describe('getBrowserTimezone', () => {
    it('returns a valid timezone identifier', () => {
      const timezone = getBrowserTimezone();
      expect(typeof timezone).toBe('string');
      expect(timezone.length).toBeGreaterThan(0);
    });

    it('falls back to UTC when browser detection fails', () => {
      // Mock Intl.DateTimeFormat to throw an error
      const originalDateTimeFormat = global.Intl.DateTimeFormat;
      global.Intl.DateTimeFormat = vi.fn().mockImplementation(() => {
        throw new Error('Not supported');
      }) as any;

      const timezone = getBrowserTimezone();
      expect(timezone).toBe('UTC');

      // Restore original
      global.Intl.DateTimeFormat = originalDateTimeFormat;
    });
  });

  describe('isValidTimezone', () => {
    it('validates correct timezone identifiers', () => {
      expect(isValidTimezone('UTC')).toBe(true);
      expect(isValidTimezone('America/New_York')).toBe(true);
      expect(isValidTimezone('Europe/London')).toBe(true);
      expect(isValidTimezone('Asia/Tokyo')).toBe(true);
    });

    it('rejects invalid timezone identifiers', () => {
      expect(isValidTimezone('Invalid/Timezone')).toBe(false);
      expect(isValidTimezone('')).toBe(false);
      expect(isValidTimezone('NotATimezone')).toBe(false);
    });
  });

  describe('getTimezoneOffset', () => {
    it('returns correct offset for UTC', () => {
      const offset = getTimezoneOffset('UTC');
      expect(offset).toBe('+00:00');
    });

    it('returns offset in correct format', () => {
      const offset = getTimezoneOffset(
        'America/New_York',
        new Date('2024-03-15T12:00:00Z')
      );
      expect(offset).toMatch(/^[+-]\d{2}:\d{2}$/);
    });

    it('handles daylight saving time', () => {
      // Test with dates in different DST periods
      const winterOffset = getTimezoneOffset(
        'America/New_York',
        new Date('2024-01-15T12:00:00Z')
      );
      const summerOffset = getTimezoneOffset(
        'America/New_York',
        new Date('2024-07-15T12:00:00Z')
      );

      expect(winterOffset).not.toBe(summerOffset);
    });

    it('falls back to +00:00 for invalid timezone', () => {
      const offset = getTimezoneOffset('Invalid/Timezone');
      expect(offset).toBe('+00:00');
    });
  });

  describe('convertTimezone', () => {
    const testDate = new Date('2024-03-15T14:30:00Z');

    it('returns same date when timezones are equal', () => {
      const result = convertTimezone(testDate, 'UTC', 'UTC');
      expect(result).toBe(testDate);
    });

    it('converts between timezones', () => {
      const result = convertTimezone(testDate, 'UTC', 'America/New_York');
      expect(result).toBeInstanceOf(Date);
      expect(result).not.toBe(testDate);
    });

    it('handles conversion errors gracefully', () => {
      const result = convertTimezone(testDate, 'Invalid/Timezone', 'UTC');
      expect(result).toBe(testDate);
    });
  });

  describe('getCurrentTimeInTimezone', () => {
    it('returns current time as Date object', () => {
      const now = getCurrentTimeInTimezone('UTC');
      expect(now).toBeInstanceOf(Date);
    });

    it('returns UTC time for UTC timezone', () => {
      const utcTime = getCurrentTimeInTimezone('UTC');
      const currentTime = new Date();

      // Times should be close (within a few seconds)
      const timeDiff = Math.abs(utcTime.getTime() - currentTime.getTime());
      expect(timeDiff).toBeLessThan(5000); // 5 seconds tolerance
    });

    it('handles invalid timezone gracefully', () => {
      const result = getCurrentTimeInTimezone('Invalid/Timezone');
      expect(result).toBeInstanceOf(Date);
    });
  });

  describe('formatTimezoneDisplay', () => {
    it('formats UTC properly', () => {
      const display = formatTimezoneDisplay('UTC');
      expect(display).toBe('UTC');
    });

    it('includes offset and abbreviation when available', () => {
      const display = formatTimezoneDisplay('America/New_York');
      expect(display).toContain('New York');
      expect(display).toContain('UTC');
      expect(display).toMatch(/[+-]\d{2}:\d{2}/);
    });

    it('falls back gracefully for invalid timezones', () => {
      const display = formatTimezoneDisplay('Invalid/Timezone');
      expect(typeof display).toBe('string');
      expect(display.length).toBeGreaterThan(0);
    });
  });

  describe('searchTimezones', () => {
    it('finds timezones by name', () => {
      const results = searchTimezones('york');
      expect(results).toContain('America/New_York');
    });

    it('finds timezones by city name', () => {
      const results = searchTimezones('london');
      expect(results).toContain('Europe/London');
    });

    it('is case insensitive', () => {
      const results = searchTimezones('TOKYO');
      expect(results).toContain('Asia/Tokyo');
    });

    it('returns empty array for no matches', () => {
      const results = searchTimezones('NonexistentCity');
      expect(results).toEqual([]);
    });

    it('finds timezones by offset', () => {
      const results = searchTimezones('+00:00');
      expect(results).toContain('UTC');
    });
  });

  describe('getCommonTimezones', () => {
    it('returns array of common timezones with labels', () => {
      const common = getCommonTimezones();
      expect(Array.isArray(common)).toBe(true);
      expect(common.length).toBeGreaterThan(0);

      common.forEach((tz) => {
        expect(tz).toHaveProperty('value');
        expect(tz).toHaveProperty('label');
        expect(typeof tz.value).toBe('string');
        expect(typeof tz.label).toBe('string');
      });
    });

    it('includes UTC as first option', () => {
      const common = getCommonTimezones();
      expect(common[0].value).toBe('UTC');
    });

    it('includes major US timezones', () => {
      const common = getCommonTimezones();
      const values = common.map((tz) => tz.value);

      expect(values).toContain('America/New_York');
      expect(values).toContain('America/Chicago');
      expect(values).toContain('America/Los_Angeles');
    });
  });
});
