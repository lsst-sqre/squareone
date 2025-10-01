/**
 * Date formatting utilities for token expiration and last used dates.
 * Uses epoch timestamps in seconds (not milliseconds).
 */

const SECONDS_PER_HOUR = 3600;
const SECONDS_PER_DAY = 86400;
const RELATIVE_THRESHOLD = SECONDS_PER_DAY; // 24 hours

/**
 * Formats an expiration timestamp.
 * @param expires - Expiration timestamp in seconds since epoch, or null/undefined if never expires
 * @returns Formatted expiration string
 */
export function formatExpiration(expires: number | null | undefined): string {
  if (expires == null) {
    // Checks both null and undefined
    return 'Never expires';
  }

  const now = Math.floor(Date.now() / 1000);
  const secondsUntilExpiry = expires - now;

  // Already expired
  if (secondsUntilExpiry <= 0) {
    return 'Expired';
  }

  // Within 24 hours - show relative time
  if (secondsUntilExpiry < RELATIVE_THRESHOLD) {
    const hours = Math.floor(secondsUntilExpiry / SECONDS_PER_HOUR);
    if (hours < 1) {
      return 'Expires in less than 1 hour';
    }
    return `Expires in ${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  }

  // More than 24 hours - show absolute date
  const days = Math.floor(secondsUntilExpiry / SECONDS_PER_DAY);
  if (days < 7) {
    return `Expires in ${days} ${days === 1 ? 'day' : 'days'}`;
  }

  // Show absolute date for longer periods
  // Check if expires is actually a string that needs parsing
  let timestamp: number;
  if (typeof expires === 'string') {
    timestamp = Date.parse(expires);
  } else {
    timestamp = expires * 1000;
  }

  const expiryDate = new Date(timestamp);

  if (isNaN(expiryDate.getTime())) {
    return `Invalid date (${expires})`;
  }

  const year = expiryDate.getUTCFullYear();
  const month = String(expiryDate.getUTCMonth() + 1).padStart(2, '0');
  const day = String(expiryDate.getUTCDate()).padStart(2, '0');
  return `Expires on ${year}-${month}-${day}`;
}

/**
 * Formats a last used timestamp.
 * @param lastUsed - Last used timestamp in seconds since epoch, or null/undefined if never used
 * @returns Formatted last used string
 */
export function formatLastUsed(lastUsed: number | null | undefined): string {
  if (lastUsed == null) {
    // Checks both null and undefined
    return 'Never used';
  }

  const now = Math.floor(Date.now() / 1000);
  const secondsSinceLastUsed = now - lastUsed;

  // Within 24 hours - show relative time
  if (secondsSinceLastUsed < RELATIVE_THRESHOLD) {
    const hours = Math.floor(secondsSinceLastUsed / SECONDS_PER_HOUR);
    if (hours < 1) {
      return 'Last used less than 1 hour ago';
    }
    return `Last used ${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  }

  // More than 24 hours - show relative days if less than a week
  const days = Math.floor(secondsSinceLastUsed / SECONDS_PER_DAY);
  if (days < 7) {
    return `Last used ${days} ${days === 1 ? 'day' : 'days'} ago`;
  }

  // Show absolute date for longer periods
  // Check if lastUsed is actually a string that needs parsing
  let timestamp: number;
  if (typeof lastUsed === 'string') {
    timestamp = Date.parse(lastUsed);
  } else {
    timestamp = lastUsed * 1000;
  }

  const lastUsedDate = new Date(timestamp);

  if (isNaN(lastUsedDate.getTime())) {
    return `Invalid date (${lastUsed})`;
  }

  const year = lastUsedDate.getUTCFullYear();
  const month = String(lastUsedDate.getUTCMonth() + 1).padStart(2, '0');
  const day = String(lastUsedDate.getUTCDate()).padStart(2, '0');
  return `Last used ${year}-${month}-${day}`;
}
