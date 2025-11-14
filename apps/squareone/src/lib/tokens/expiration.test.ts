import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  calculateExpirationDate,
  EXPIRATION_OPTIONS,
  formatDateInTimezone,
  formatDateOnly,
  formatExpiration,
  parseExpirationFromQuery,
} from './expiration';

describe('calculateExpirationDate', () => {
  beforeEach(() => {
    // Mock Date.now() to return a fixed timestamp for consistent testing
    vi.setSystemTime(new Date('2024-01-01T00:00:00Z'));
  });

  it('should calculate 1 day expiration correctly', () => {
    const result = calculateExpirationDate('1d');
    expect(result).toEqual(new Date('2024-01-02T00:00:00Z'));
  });

  it('should calculate 7 days expiration correctly', () => {
    const result = calculateExpirationDate('7d');
    expect(result).toEqual(new Date('2024-01-08T00:00:00Z'));
  });

  it('should calculate 30 days expiration correctly', () => {
    const result = calculateExpirationDate('30d');
    expect(result).toEqual(new Date('2024-01-31T00:00:00Z'));
  });

  it('should calculate 90 days expiration correctly', () => {
    const result = calculateExpirationDate('90d');
    expect(result).toEqual(new Date('2024-03-31T00:00:00Z'));
  });

  it('should throw error for invalid duration', () => {
    expect(() => calculateExpirationDate('invalid')).toThrow(
      'Unknown duration: invalid'
    );
  });
});

describe('formatExpiration', () => {
  beforeEach(() => {
    vi.setSystemTime(new Date('2024-01-01T00:00:00Z'));
  });

  it('should return null for never expiration', () => {
    const result = formatExpiration({ type: 'never' });
    expect(result).toBeNull();
  });

  it('should format preset expiration to ISO string', () => {
    const result = formatExpiration({ type: 'preset', value: '1d' });
    expect(result).toBe('2024-01-02T00:00:00.000Z');
  });

  it('should throw error for unknown type', () => {
    expect(() => formatExpiration({ type: 'unknown' } as any)).toThrow(
      'Unknown expiration type: unknown'
    );
  });
});

describe('formatDateInTimezone', () => {
  it('should format date in specified timezone', () => {
    const date = new Date('2024-01-01T12:00:00Z');
    const result = formatDateInTimezone(date, 'America/New_York');
    expect(result).toContain('Jan 1, 2024');
    expect(result).toContain('7:00 AM'); // EST offset
  });

  it('should fall back to local time for invalid timezone', () => {
    const date = new Date('2024-01-01T12:00:00Z');
    const result = formatDateInTimezone(date, 'Invalid/Timezone');
    expect(result).toBe(date.toLocaleString());
  });

  it('should use system timezone when no timezone provided', () => {
    const date = new Date('2024-01-01T12:00:00Z');
    const result = formatDateInTimezone(date);
    expect(result).toContain('Jan 1, 2024');
  });
});

describe('formatDateOnly', () => {
  it('should format date without time in specified timezone', () => {
    const date = new Date('2024-01-01T12:00:00Z');
    const result = formatDateOnly(date, 'America/New_York');
    expect(result).toContain('Jan');
    expect(result).toContain('2024');
    // Should not contain time
    expect(result).not.toMatch(/\d{1,2}:\d{2}/);
  });

  it('should fall back to local date for invalid timezone', () => {
    const date = new Date('2024-01-01T12:00:00Z');
    const result = formatDateOnly(date, 'Invalid/Timezone');
    expect(result).toBe(date.toLocaleDateString());
  });

  it('should use system timezone when no timezone provided', () => {
    const date = new Date('2024-01-01T12:00:00Z');
    const result = formatDateOnly(date);
    expect(result).toContain('Jan');
    expect(result).toContain('2024');
    // Should not contain time
    expect(result).not.toMatch(/\d{1,2}:\d{2}/);
  });
});

describe('parseExpirationFromQuery', () => {
  it('should parse never expiration', () => {
    const result = parseExpirationFromQuery('never');
    expect(result).toEqual({ type: 'never' });
  });

  it('should parse 1d preset', () => {
    const result = parseExpirationFromQuery('1d');
    expect(result).toEqual({ type: 'preset', value: '1d' });
  });

  it('should parse 7d preset', () => {
    const result = parseExpirationFromQuery('7d');
    expect(result).toEqual({ type: 'preset', value: '7d' });
  });

  it('should parse 30d preset', () => {
    const result = parseExpirationFromQuery('30d');
    expect(result).toEqual({ type: 'preset', value: '30d' });
  });

  it('should parse 90d preset', () => {
    const result = parseExpirationFromQuery('90d');
    expect(result).toEqual({ type: 'preset', value: '90d' });
  });

  it('should return null for invalid expiration', () => {
    const result = parseExpirationFromQuery('invalid');
    expect(result).toBeNull();
  });

  it('should return null for ISO8601 datetime (not supported in Phase 1)', () => {
    const result = parseExpirationFromQuery('2024-12-31T23:59:59Z');
    expect(result).toBeNull();
  });
});

describe('EXPIRATION_OPTIONS', () => {
  it('should have 5 options', () => {
    expect(EXPIRATION_OPTIONS).toHaveLength(5);
  });

  it('should have all expected preset values', () => {
    const presetValues = EXPIRATION_OPTIONS.filter(
      (opt) => opt.value.type === 'preset'
    ).map((opt) => (opt.value.type === 'preset' ? opt.value.value : ''));

    expect(presetValues).toEqual(['1d', '7d', '30d', '90d']);
  });

  it('should have never option', () => {
    const neverOption = EXPIRATION_OPTIONS.find(
      (opt) => opt.value.type === 'never'
    );
    expect(neverOption).toBeDefined();
    expect(neverOption?.label).toBe('Never');
  });

  it('should have descriptions for all options', () => {
    EXPIRATION_OPTIONS.forEach((option) => {
      expect(option.description).toBeDefined();
      expect(option.description).not.toBe('');
    });
  });
});
