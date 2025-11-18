import { format, isAfter, isBefore, isValid, parseISO } from 'date-fns';
import { formatInTimeZone, fromZonedTime, toZonedTime } from 'date-fns-tz';

/**
 * ISO8601 date format patterns for validation and parsing
 */
export const ISO8601_PATTERNS = {
  // Full datetime with timezone: 2024-03-15T14:30:00.000Z or 2024-03-15T14:30:00+05:30
  FULL: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?(Z|[+-]\d{2}:\d{2})$/,
  // Date with time: 2024-03-15T14:30:00
  DATETIME: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/,
  // Date only: 2024-03-15
  DATE_ONLY: /^\d{4}-\d{2}-\d{2}$/,
  // Partial datetime: 2024-03-15T14:30 or 2024-03-15T14:30-08:00
  PARTIAL: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(Z|[+-]\d{2}:\d{2})?$/,
} as const;

/**
 * Validates if a string matches ISO8601 format
 */
export function isValidISO8601(value: string): boolean {
  if (!value) return false;

  // Check if it matches any of our supported patterns
  const matchesPattern = Object.values(ISO8601_PATTERNS).some((pattern) =>
    pattern.test(value)
  );

  if (!matchesPattern) return false;

  // Try to parse the date
  try {
    const date = parseISO(value);
    return isValid(date);
  } catch {
    return false;
  }
}

/**
 * Parses an ISO8601 string to a Date object
 * Handles various ISO8601 formats gracefully
 */
export function parseISO8601(value: string): Date | null {
  if (!value || !isValidISO8601(value)) {
    return null;
  }

  try {
    const date = parseISO(value);
    return isValid(date) ? date : null;
  } catch {
    return null;
  }
}

/**
 * Formats a Date object to ISO8601 timestamp string
 * @param date - The date to format
 * @param includeTime - Reserved for API compatibility, always includes time
 * @param includeSeconds - Whether to include seconds (default: false)
 * @param timezone - Target timezone (default: UTC)
 */
export function formatToISO8601(
  date: Date,
  options: {
    includeTime?: boolean;
    includeSeconds?: boolean;
    timezone?: string;
  } = {}
): string {
  const {
    includeTime: _includeTime = true,
    includeSeconds = false,
    timezone = 'UTC',
  } = options;

  if (!isValid(date)) {
    throw new Error('Invalid date provided');
  }

  // For UTC, format directly using ISO format
  if (timezone === 'UTC') {
    // Extract UTC components
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');

    const dateStr = `${year}-${month}-${day}`;
    const timeStr = includeSeconds
      ? `${hours}:${minutes}:${seconds}`
      : `${hours}:${minutes}`;
    return `${dateStr}T${timeStr}Z`;
  }

  // For other timezones, use formatInTimeZone which handles timezone offsets correctly
  const timeFormat = includeSeconds ? 'HH:mm:ss' : 'HH:mm';
  const formatString = `yyyy-MM-dd'T'${timeFormat}xxx`;

  return formatInTimeZone(date, timezone, formatString);
}

/**
 * Creates a Date object from date and time components
 */
export function createDateFromComponents(
  year: number,
  month: number, // 1-12
  day: number,
  hours: number = 0,
  minutes: number = 0,
  seconds: number = 0,
  timezone: string = 'UTC'
): Date {
  const dateString = `${year}-${month.toString().padStart(2, '0')}-${day
    .toString()
    .padStart(2, '0')}T${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  if (timezone === 'UTC') {
    return new Date(`${dateString}Z`);
  } else {
    return fromZonedTime(dateString, timezone);
  }
}

/**
 * Extracts date and time components from a Date object in a specific timezone
 */
export function extractDateComponents(
  date: Date,
  timezone: string = 'UTC'
): {
  year: number;
  month: number;
  day: number;
  hours: number;
  minutes: number;
  seconds: number;
} {
  if (!isValid(date)) {
    throw new Error('Invalid date provided');
  }

  // For UTC, use UTC methods directly
  if (timezone === 'UTC') {
    return {
      year: date.getUTCFullYear(),
      month: date.getUTCMonth() + 1, // Convert from 0-11 to 1-12
      day: date.getUTCDate(),
      hours: date.getUTCHours(),
      minutes: date.getUTCMinutes(),
      seconds: date.getUTCSeconds(),
    };
  }

  // For other timezones, convert first
  const zonedDate = toZonedTime(date, timezone);

  return {
    year: zonedDate.getFullYear(),
    month: zonedDate.getMonth() + 1, // Convert from 0-11 to 1-12
    day: zonedDate.getDate(),
    hours: zonedDate.getHours(),
    minutes: zonedDate.getMinutes(),
    seconds: zonedDate.getSeconds(),
  };
}

/**
 * Validates if a date is within the specified range
 */
export function isDateInRange(
  date: Date,
  minDate?: Date,
  maxDate?: Date
): boolean {
  if (!isValid(date)) return false;

  if (minDate && isValid(minDate) && isBefore(date, minDate)) {
    return false;
  }

  if (maxDate && isValid(maxDate) && isAfter(date, maxDate)) {
    return false;
  }

  return true;
}

/**
 * Gets today's date in a specific timezone
 */
export function getTodayInTimezone(timezone: string = 'UTC'): Date {
  const now = new Date();
  if (timezone === 'UTC') {
    return now;
  }
  return toZonedTime(now, timezone);
}

/**
 * Combines a date and time while preserving the timezone
 */
export function combineDateTime(
  date: Date,
  timeString: string, // HH:mm or HH:mm:ss
  timezone: string = 'UTC'
): Date | null {
  if (!isValid(date)) return null;

  const timeMatch = timeString.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!timeMatch) return null;

  const hours = parseInt(timeMatch[1], 10);
  const minutes = parseInt(timeMatch[2], 10);
  const seconds = timeMatch[3] ? parseInt(timeMatch[3], 10) : 0;

  if (hours > 23 || minutes > 59 || seconds > 59) return null;

  const components = extractDateComponents(date, timezone);

  return createDateFromComponents(
    components.year,
    components.month,
    components.day,
    hours,
    minutes,
    seconds,
    timezone
  );
}

/**
 * Formats time from a Date object
 */
export function formatTime(
  date: Date,
  includeSeconds: boolean = false,
  timezone: string = 'UTC'
): string {
  if (!isValid(date)) return '';

  const formatString = includeSeconds ? 'HH:mm:ss' : 'HH:mm';

  // For UTC, use UTC methods directly
  if (timezone === 'UTC') {
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');

    if (includeSeconds) {
      const seconds = String(date.getUTCSeconds()).padStart(2, '0');
      return `${hours}:${minutes}:${seconds}`;
    }
    return `${hours}:${minutes}`;
  }

  // For other timezones, use formatInTimeZone
  return formatInTimeZone(date, timezone, formatString);
}

/**
 * Gets error message for invalid date input
 */
export function getDateValidationError(
  value: string,
  minDate?: Date,
  maxDate?: Date
): string | null {
  if (!value) return null;

  if (!isValidISO8601(value)) {
    return 'Please enter a valid date in ISO8601 format (YYYY-MM-DDTHH:mm:ss)';
  }

  const date = parseISO8601(value);
  if (!date) {
    return 'Invalid date';
  }

  if (!isDateInRange(date, minDate, maxDate)) {
    if (minDate && maxDate) {
      return `Date must be between ${format(
        minDate,
        'yyyy-MM-dd'
      )} and ${format(maxDate, 'yyyy-MM-dd')}`;
    } else if (minDate) {
      return `Date must be after ${format(minDate, 'yyyy-MM-dd')}`;
    } else if (maxDate) {
      return `Date must be before ${format(maxDate, 'yyyy-MM-dd')}`;
    }
  }

  return null;
}

/**
 * Prepares an ISO8601 string for use with DateTimePicker
 *
 * This helper function makes the conversion from ISO8601 strings to Date objects
 * explicit and helps developers understand timezone handling. The timezone encoded
 * in an ISO8601 string (e.g., "-05:00") only determines the moment in time, not
 * the timezone context for editing.
 *
 * @param iso8601 - ISO8601 timestamp string (e.g., "2024-03-15T14:30:00-05:00")
 * @param options - Configuration options
 * @param options.preferTimezone - IANA timezone to use for editing (overrides detection)
 * @param options.fallbackTimezone - Timezone to use if detection fails (default: 'local')
 * @returns Object with Date value, timezone for editing, and original offset
 *
 * @example
 * // Use local timezone for editing
 * const { value, timezone } = prepareDateTime("2024-03-15T14:30:00-08:00");
 * <DateTimePicker value={value} timezone={timezone} />
 *
 * @example
 * // Specify timezone for editing
 * const { value } = prepareDateTime("2024-03-15T14:30:00Z", {
 *   preferTimezone: "America/New_York"
 * });
 * <DateTimePicker value={value} timezone="America/New_York" />
 */
export function prepareDateTime(
  iso8601: string,
  options?: {
    preferTimezone?: string;
    fallbackTimezone?: string;
  }
): {
  value: Date;
  timezone: string;
  originalOffset: string;
} {
  const date = parseISO8601(iso8601);
  if (!date) {
    throw new Error(`Invalid ISO8601 string: ${iso8601}`);
  }

  // Extract timezone offset from the ISO8601 string (e.g., "-05:00", "+00:00", "Z")
  const offsetMatch = iso8601.match(/(Z|[+-]\d{2}:\d{2})$/);
  const originalOffset = offsetMatch ? offsetMatch[1] : '';

  // Determine timezone for editing context
  // Order of precedence: preferTimezone > fallbackTimezone > 'local'
  const timezone =
    options?.preferTimezone || options?.fallbackTimezone || 'local';

  return {
    value: date,
    timezone,
    originalOffset,
  };
}
