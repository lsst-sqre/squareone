/**
 * Token-specific date formatting utilities.
 * These build on the core date utilities to provide token-specific display logic.
 */

import {
  formatAsISODate,
  getRelativeTimeDescription,
  parseTimestamp,
} from '../../lib/utils/dateFormatters';

const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 3600;
const SECONDS_PER_DAY = 86400;

type FormattedDate = {
  display: string;
  datetime: string | null;
};

/**
 * Format a token expiration timestamp for display.
 * @param expires - Expiration timestamp in seconds since epoch, or null/undefined if never expires
 * @returns Object with display text and ISO datetime for <time> element
 */
export function formatTokenExpiration(
  expires: number | null | undefined
): FormattedDate {
  if (expires == null) {
    return {
      display: 'Never expires',
      datetime: null,
    };
  }

  const expiryDate = parseTimestamp(expires);
  if (!expiryDate) {
    return {
      display: `Invalid date (${expires})`,
      datetime: null,
    };
  }

  const now = Math.floor(Date.now() / 1000);
  const secondsUntilExpiry = expires - now;

  // Already expired
  if (secondsUntilExpiry <= 0) {
    return {
      display: 'Expired',
      datetime: expiryDate.toISOString(),
    };
  }

  // Within 7 days - show relative time
  if (secondsUntilExpiry < SECONDS_PER_DAY * 7) {
    const timeDesc = getRelativeTimeDescription(secondsUntilExpiry, 'future');
    return {
      display: `Expires in ${timeDesc}`,
      datetime: expiryDate.toISOString(),
    };
  }

  // Show absolute date for longer periods
  return {
    display: `Expires on ${formatAsISODate(expiryDate)}`,
    datetime: expiryDate.toISOString(),
  };
}

/**
 * Format a token last used timestamp for display.
 * @param lastUsed - Last used timestamp in seconds since epoch, or null/undefined if never used
 * @returns Object with display text and ISO datetime for <time> element
 */
export function formatTokenLastUsed(
  lastUsed: number | null | undefined
): FormattedDate {
  if (lastUsed == null) {
    return {
      display: 'Never used',
      datetime: null,
    };
  }

  const lastUsedDate = parseTimestamp(lastUsed);
  if (!lastUsedDate) {
    return {
      display: `Invalid date (${lastUsed})`,
      datetime: null,
    };
  }

  const now = Math.floor(Date.now() / 1000);
  const secondsSinceLastUsed = now - lastUsed;

  // Within 7 days - show relative time
  if (secondsSinceLastUsed < SECONDS_PER_DAY * 7) {
    const timeDesc = getRelativeTimeDescription(secondsSinceLastUsed, 'past');
    return {
      display: `Last used ${timeDesc} ago`,
      datetime: lastUsedDate.toISOString(),
    };
  }

  // Show absolute date for longer periods
  return {
    display: `Last used ${formatAsISODate(lastUsedDate)}`,
    datetime: lastUsedDate.toISOString(),
  };
}

/**
 * Format a token creation timestamp for display.
 * Always shows the ISO8601 timestamp for when the token was created.
 * @param created - Creation timestamp in seconds since epoch, or null/undefined if unknown
 * @returns Object with display text (ISO8601 timestamp) and datetime for <time> element
 */
export function formatTokenCreated(
  created: number | null | undefined
): FormattedDate {
  if (created == null) {
    return {
      display: 'Unknown',
      datetime: null,
    };
  }

  const createdDate = parseTimestamp(created);
  if (!createdDate) {
    return {
      display: `Invalid date (${created})`,
      datetime: null,
    };
  }

  return {
    display: createdDate.toISOString(),
    datetime: createdDate.toISOString(),
  };
}

/**
 * Format an expiration timestamp as ISO8601 string for change history display.
 * Used in the Changes section to show what the expiration date was changed to/from.
 * @param expires - Expiration timestamp in seconds since epoch, or null/undefined if never expires
 * @returns ISO8601 timestamp string (e.g., "2025-03-15T14:30:45Z") or "Never expires"
 */
export function formatExpirationTimestamp(
  expires: number | null | undefined
): string {
  if (expires == null) {
    return 'Never expires';
  }

  const expiryDate = parseTimestamp(expires);
  if (!expiryDate) {
    return `Invalid date (${expires})`;
  }

  return expiryDate.toISOString();
}

/**
 * Format an event time for summary lines (relative time like "2h ago", "3d ago").
 * @param eventTime - Event timestamp in seconds since epoch
 * @returns Relative time string (e.g., "2h ago", "3d ago", "just now")
 */
export function formatEventTime(eventTime: number | null | undefined): string {
  if (eventTime == null) {
    return 'Unknown time';
  }

  const eventDate = parseTimestamp(eventTime);
  if (!eventDate) {
    return `Invalid date (${eventTime})`;
  }

  const now = Math.floor(Date.now() / 1000);
  const secondsAgo = now - eventTime;

  // Future events (shouldn't happen for history, but handle gracefully)
  if (secondsAgo < 0) {
    return 'just now';
  }

  // Less than 1 minute
  if (secondsAgo < SECONDS_PER_MINUTE) {
    return 'just now';
  }

  // Less than 1 hour - show minutes
  if (secondsAgo < SECONDS_PER_HOUR) {
    const minutes = Math.floor(secondsAgo / SECONDS_PER_MINUTE);
    return `${minutes}m ago`;
  }

  // Less than 1 day - show hours
  if (secondsAgo < SECONDS_PER_DAY) {
    const hours = Math.floor(secondsAgo / SECONDS_PER_HOUR);
    return `${hours}h ago`;
  }

  // 1 day or more - show days
  const days = Math.floor(secondsAgo / SECONDS_PER_DAY);
  return `${days}d ago`;
}

/**
 * Format an event time for detail view (exact UTC timestamp).
 * @param eventTime - Event timestamp in seconds since epoch
 * @returns UTC timestamp string (e.g., "2025-03-15 14:30:45 UTC")
 */
export function formatEventTimeUTC(
  eventTime: number | null | undefined
): string {
  if (eventTime == null) {
    return 'Unknown time';
  }

  const eventDate = parseTimestamp(eventTime);
  if (!eventDate) {
    return `Invalid date (${eventTime})`;
  }

  const year = eventDate.getUTCFullYear();
  const month = String(eventDate.getUTCMonth() + 1).padStart(2, '0');
  const day = String(eventDate.getUTCDate()).padStart(2, '0');
  const hours = String(eventDate.getUTCHours()).padStart(2, '0');
  const minutes = String(eventDate.getUTCMinutes()).padStart(2, '0');
  const seconds = String(eventDate.getUTCSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} UTC`;
}

/**
 * Format an event time with both display and datetime values for TokenDate component.
 * @param eventTime - Event timestamp in seconds since epoch
 * @returns Object with display text (relative) and ISO datetime string
 */
export function formatEventTimeWithUTC(
  eventTime: number | null | undefined
): FormattedDate {
  if (eventTime == null) {
    return {
      display: 'Unknown time',
      datetime: null,
    };
  }

  const eventDate = parseTimestamp(eventTime);
  if (!eventDate) {
    return {
      display: `Invalid date (${eventTime})`,
      datetime: null,
    };
  }

  return {
    display: formatEventTime(eventTime),
    datetime: eventDate.toISOString(),
  };
}
