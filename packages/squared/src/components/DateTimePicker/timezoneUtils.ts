import { getTimezoneOffset as getOffset, toZonedTime } from 'date-fns-tz';

/**
 * Common timezone identifiers grouped by region
 * These are IANA timezone identifiers
 */
export const TIMEZONE_GROUPS = {
  UTC: ['UTC'],
  'North America': [
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'America/Anchorage',
    'America/Honolulu',
    'America/Toronto',
    'America/Vancouver',
  ],
  Europe: [
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Europe/Rome',
    'Europe/Madrid',
    'Europe/Amsterdam',
    'Europe/Stockholm',
    'Europe/Vienna',
    'Europe/Warsaw',
    'Europe/Prague',
    'Europe/Budapest',
    'Europe/Zurich',
  ],
  Asia: [
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Asia/Hong_Kong',
    'Asia/Seoul',
    'Asia/Singapore',
    'Asia/Bangkok',
    'Asia/Mumbai',
    'Asia/Dubai',
    'Asia/Jerusalem',
    'Asia/Manila',
  ],
  Australia: [
    'Australia/Sydney',
    'Australia/Melbourne',
    'Australia/Brisbane',
    'Australia/Perth',
    'Australia/Adelaide',
    'Australia/Darwin',
  ],
  Other: [
    'Pacific/Auckland',
    'Africa/Cairo',
    'Africa/Johannesburg',
    'America/Sao_Paulo',
    'America/Mexico_City',
    'America/Buenos_Aires',
  ],
} as const;

/**
 * Get all available timezones as a flat array
 */
export function getAllTimezones(): string[] {
  return Object.values(TIMEZONE_GROUPS).flat();
}

/**
 * Get timezone groups for dropdown display
 */
export function getTimezoneGroups(): Array<{
  label: string;
  timezones: Array<{ value: string; label: string; offset: string }>;
}> {
  const now = new Date();

  return Object.entries(TIMEZONE_GROUPS).map(([groupName, timezones]) => ({
    label: groupName,
    timezones: timezones.map((tz) => ({
      value: tz,
      label: getTimezoneLabel(tz),
      offset: getTimezoneOffset(tz, now),
    })),
  }));
}

/**
 * Get a human-readable label for a timezone
 */
export function getTimezoneLabel(timezone: string): string {
  if (timezone === 'UTC') {
    return 'UTC';
  }

  // Convert timezone identifier to readable format
  // e.g., "America/New_York" -> "New York"
  const parts = timezone.split('/');
  const city = parts[parts.length - 1].replace(/_/g, ' ');

  // Add some common city name corrections
  const cityCorrections: Record<string, string> = {
    'New York': 'New York (Eastern)',
    Chicago: 'Chicago (Central)',
    Denver: 'Denver (Mountain)',
    'Los Angeles': 'Los Angeles (Pacific)',
    'Sao Paulo': 'São Paulo',
    'Buenos Aires': 'Buenos Aires',
    'Mexico City': 'Mexico City',
  };

  return cityCorrections[city] || city;
}

/**
 * Get the current browser timezone
 */
export function getBrowserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    // Fallback to UTC if browser doesn't support timezone detection
    return 'UTC';
  }
}

/**
 * Check if a timezone is valid
 */
export function isValidTimezone(timezone: string): boolean {
  try {
    // Try to format a date in this timezone
    Intl.DateTimeFormat('en', { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get timezone offset string (e.g., "+05:30", "-08:00")
 */
export function getTimezoneOffset(
  timezone: string,
  date: Date = new Date()
): string {
  try {
    if (timezone === 'UTC') {
      return '+00:00';
    }

    // Validate timezone first
    if (!isValidTimezone(timezone)) {
      return '+00:00';
    }

    // Use date-fns-tz to get the offset
    const offsetMinutes = getOffset(timezone, date) / (1000 * 60);

    // Check for NaN
    if (Number.isNaN(offsetMinutes)) {
      return '+00:00';
    }

    // Convert to hours and minutes
    const hours = Math.floor(Math.abs(offsetMinutes) / 60);
    const minutes = Math.abs(offsetMinutes) % 60;
    const sign = offsetMinutes >= 0 ? '+' : '-';

    return `${sign}${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}`;
  } catch {
    return '+00:00';
  }
}

/**
 * Convert a date from one timezone to another
 */
export function convertTimezone(
  date: Date,
  fromTimezone: string,
  toTimezone: string
): Date {
  // Early returns
  if (!date) return date;
  if (fromTimezone === toTimezone) return date;

  try {
    // Validate both timezones
    if (!isValidTimezone(fromTimezone) || !isValidTimezone(toTimezone)) {
      return date;
    }

    // Convert the date to the target timezone
    // Note: date-fns-tz's toZonedTime converts a UTC date to the target timezone
    return toZonedTime(date, toTimezone);
  } catch {
    // On any error, return the original date unchanged
    return date;
  }
}

/**
 * Get current time in a specific timezone
 */
export function getCurrentTimeInTimezone(timezone: string): Date {
  const now = new Date();

  if (timezone === 'UTC') {
    return now;
  }

  try {
    return toZonedTime(now, timezone);
  } catch {
    return now;
  }
}

/**
 * Format timezone for display in UI
 * e.g., "UTC" or "Pacific Standard Time (PST, UTC-8)"
 */
export function formatTimezoneDisplay(
  timezone: string,
  date: Date = new Date()
): string {
  if (timezone === 'UTC') {
    return 'UTC';
  }

  try {
    const offset = getTimezoneOffset(timezone, date);
    const label = getTimezoneLabel(timezone);

    // Try to get the timezone abbreviation
    const formatter = new Intl.DateTimeFormat('en', {
      timeZone: timezone,
      timeZoneName: 'short',
    });

    const parts = formatter.formatToParts(date);
    const timeZoneName = parts.find(
      (part) => part.type === 'timeZoneName'
    )?.value;

    if (timeZoneName && timeZoneName !== timezone) {
      return `${label} (${timeZoneName}, UTC${offset})`;
    } else {
      return `${label} (UTC${offset})`;
    }
  } catch {
    return getTimezoneLabel(timezone);
  }
}

/**
 * Search timezones by name or offset
 */
export function searchTimezones(query: string): string[] {
  const lowerQuery = query.toLowerCase();
  const allTimezones = getAllTimezones();

  return allTimezones.filter((timezone) => {
    const label = getTimezoneLabel(timezone).toLowerCase();
    const offset = getTimezoneOffset(timezone);

    return (
      timezone.toLowerCase().includes(lowerQuery) ||
      label.includes(lowerQuery) ||
      offset.includes(lowerQuery)
    );
  });
}

/**
 * Get a list of common timezones for quick access
 */
export function getCommonTimezones(): Array<{ value: string; label: string }> {
  const common = [
    'UTC',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Asia/Tokyo',
    'Australia/Sydney',
  ];

  return common.map((timezone) => ({
    value: timezone,
    label: formatTimezoneDisplay(timezone),
  }));
}
