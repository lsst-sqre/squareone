/**
 * Token-specific date formatting utilities.
 * These build on the core date utilities to provide token-specific display logic.
 */

import {
  parseTimestamp,
  formatAsISODate,
  getRelativeTimeDescription,
} from '../../lib/utils/dateFormatters';

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
