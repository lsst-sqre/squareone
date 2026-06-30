/**
 * Date formatting utilities for token expiration and last used dates.
 * Uses epoch timestamps in seconds (not milliseconds).
 */

const SECONDS_PER_HOUR = 3600;
const SECONDS_PER_DAY = 86400;
const RELATIVE_THRESHOLD = SECONDS_PER_DAY; // 24 hours

/**
 * Parse a timestamp value into a Date object.
 * @param value - Timestamp in seconds since epoch, or ISO date string, or null/undefined
 * @returns Date object or null if value is null/undefined
 */
export function parseTimestamp(
  value: number | string | null | undefined
): Date | null {
  if (value == null) {
    return null;
  }

  let timestamp: number;
  if (typeof value === 'string') {
    timestamp = Date.parse(value);
  } else {
    timestamp = value * 1000; // Convert seconds to milliseconds
  }

  const date = new Date(timestamp);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Format a Date object as YYYY-MM-DD in UTC.
 * @param date - Date object to format
 * @returns Formatted date string
 */
export function formatAsISODate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format an ISO 8601 timestamp as a stable, timezone-independent
 * `YYYY-MM-DD HH:MM UTC` string.
 *
 * Returns the original string unchanged when it does not parse to a valid date,
 * so a malformed value is surfaced verbatim rather than as `Invalid Date`.
 * @param iso - ISO 8601 timestamp string
 * @returns Formatted `YYYY-MM-DD HH:MM UTC` string, or `iso` if it is invalid
 */
export function formatUtcTimestamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes} UTC`;
}

/**
 * Format an ISO 8601 timestamp as a past-tense relative description of how long
 * ago it was, e.g. `"18 days ago"` or `"less than 1 hour ago"`.
 *
 * Reads the current time via `Date.now()` at call time, so callers that need
 * deterministic output (tests) should stub the clock. Returns the original
 * string unchanged when it does not parse to a valid date.
 * @param iso - ISO 8601 timestamp string
 * @returns Relative description with a trailing " ago", or `iso` if invalid
 */
export function formatRelativeToNow(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  const secondsAgo = Math.max(0, (Date.now() - date.getTime()) / 1000);
  return `${getRelativeTimeDescription(secondsAgo, 'past')} ago`;
}

/**
 * Get a relative time description.
 * @param seconds - Number of seconds for the time period
 * @param direction - 'past' for "ago" or 'future' for "in"
 * @returns Relative time description (e.g., "2 hours", "3 days")
 */
export function getRelativeTimeDescription(
  seconds: number,
  _direction: 'past' | 'future' = 'future'
): string {
  const days = Math.floor(seconds / SECONDS_PER_DAY);
  if (days >= 1) {
    return `${days} ${days === 1 ? 'day' : 'days'}`;
  }

  const hours = Math.floor(seconds / SECONDS_PER_HOUR);
  if (hours >= 1) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  }

  return 'less than 1 hour';
}

/**
 * Determine if a time difference should use relative formatting.
 * @param secondsDiff - Absolute difference in seconds
 * @param threshold - Threshold in seconds for relative formatting (default: 24 hours)
 * @returns True if should use relative formatting
 */
export function shouldUseRelativeFormat(
  secondsDiff: number,
  threshold: number = RELATIVE_THRESHOLD
): boolean {
  return secondsDiff < threshold;
}

/**
 * Formats an expiration timestamp.
 * @param expires - Expiration timestamp in seconds since epoch, or null/undefined if never expires
 * @returns Formatted expiration string
 */
export function formatExpiration(expires: number | null | undefined): string {
  if (expires == null) {
    return 'Never expires';
  }

  const expiryDate = parseTimestamp(expires);
  if (!expiryDate) {
    return `Invalid date (${expires})`;
  }

  const now = Math.floor(Date.now() / 1000);
  const secondsUntilExpiry = expires - now;

  // Already expired
  if (secondsUntilExpiry <= 0) {
    return 'Expired';
  }

  // Within 7 days - show relative time
  if (secondsUntilExpiry < SECONDS_PER_DAY * 7) {
    const timeDesc = getRelativeTimeDescription(secondsUntilExpiry, 'future');
    return `Expires in ${timeDesc}`;
  }

  // Show absolute date for longer periods
  return `Expires on ${formatAsISODate(expiryDate)}`;
}

/**
 * Formats a last used timestamp.
 * @param lastUsed - Last used timestamp in seconds since epoch, or null/undefined if never used
 * @returns Formatted last used string
 */
export function formatLastUsed(lastUsed: number | null | undefined): string {
  if (lastUsed == null) {
    return 'Never used';
  }

  const lastUsedDate = parseTimestamp(lastUsed);
  if (!lastUsedDate) {
    return `Invalid date (${lastUsed})`;
  }

  const now = Math.floor(Date.now() / 1000);
  const secondsSinceLastUsed = now - lastUsed;

  // Within 7 days - show relative time
  if (secondsSinceLastUsed < SECONDS_PER_DAY * 7) {
    const timeDesc = getRelativeTimeDescription(secondsSinceLastUsed, 'past');
    return `Last used ${timeDesc} ago`;
  }

  // Show absolute date for longer periods
  return `Last used ${formatAsISODate(lastUsedDate)}`;
}
