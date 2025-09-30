/**
 * Date formatting utilities for token expiration and last used dates.
 * Uses epoch timestamps in seconds (not milliseconds).
 */

const SECONDS_PER_HOUR = 3600;
const SECONDS_PER_DAY = 86400;
const RELATIVE_THRESHOLD = SECONDS_PER_DAY; // 24 hours

/**
 * Formats an expiration timestamp.
 * @param expires - Expiration timestamp in seconds since epoch, or null if never expires
 * @returns Formatted expiration string
 */
export function formatExpiration(expires: number | null): string {
  if (expires === null) {
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
  const expiryDate = new Date(expires * 1000);
  const year = expiryDate.getUTCFullYear();
  const month = String(expiryDate.getUTCMonth() + 1).padStart(2, '0');
  const day = String(expiryDate.getUTCDate()).padStart(2, '0');
  return `Expires on ${year}-${month}-${day}`;
}

/**
 * Formats a last used timestamp.
 * @param lastUsed - Last used timestamp in seconds since epoch, or null if never used
 * @returns Formatted last used string
 */
export function formatLastUsed(lastUsed: number | null): string {
  if (lastUsed === null) {
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
  const lastUsedDate = new Date(lastUsed * 1000);
  const year = lastUsedDate.getUTCFullYear();
  const month = String(lastUsedDate.getUTCMonth() + 1).padStart(2, '0');
  const day = String(lastUsedDate.getUTCDate()).padStart(2, '0');
  return `Last used ${year}-${month}-${day}`;
}
