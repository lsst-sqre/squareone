export type ExpirationValue =
  | { type: 'preset'; value: '1d' | '7d' | '30d' | '90d' }
  | { type: 'never' };

export interface ExpirationOption {
  value: ExpirationValue;
  label: string;
  description?: string;
}

/**
 * Available expiration preset options
 */
export const EXPIRATION_OPTIONS: ExpirationOption[] = [
  {
    value: { type: 'preset', value: '1d' },
    label: '1 day',
    description: 'Token expires in 24 hours',
  },
  {
    value: { type: 'preset', value: '7d' },
    label: '7 days',
    description: 'Token expires in 1 week',
  },
  {
    value: { type: 'preset', value: '30d' },
    label: '30 days',
    description: 'Token expires in 1 month',
  },
  {
    value: { type: 'preset', value: '90d' },
    label: '90 days',
    description: 'Token expires in 3 months',
  },
  {
    value: { type: 'never' },
    label: 'Never',
    description: 'Token never expires (not recommended)',
  },
];

/**
 * Calculate expiration date from duration string
 */
export function calculateExpirationDate(duration: string): Date {
  const now = new Date();

  switch (duration) {
    case '1d':
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    case '7d':
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    case '30d':
      return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    case '90d':
      return new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    default:
      throw new Error(`Unknown duration: ${duration}`);
  }
}

/**
 * Format expiration value for API submission
 */
export function formatExpiration(value: ExpirationValue): string | null {
  if (value.type === 'never') {
    return null;
  }

  if (value.type === 'preset') {
    return calculateExpirationDate(value.value).toISOString();
  }

  throw new Error(`Unknown expiration type: ${(value as any).type}`);
}

/**
 * Format date in user's timezone with fallback (date and time)
 */
export function formatDateInTimezone(date: Date, timezone?: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    }).format(date);
  } catch {
    // Fallback to local time if timezone is invalid
    return date.toLocaleString();
  }
}

/**
 * Format date only (no time) in user's timezone with fallback
 */
export function formatDateOnly(date: Date, timezone?: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  } catch {
    // Fallback to local date if timezone is invalid
    return date.toLocaleDateString();
  }
}

/**
 * Parse query parameter expiration value into ExpirationValue
 */
export function parseExpirationFromQuery(
  expiration: string
): ExpirationValue | null {
  if (expiration === 'never') {
    return { type: 'never' };
  }

  if (['1d', '7d', '30d', '90d'].includes(expiration)) {
    return { type: 'preset', value: expiration as '1d' | '7d' | '30d' | '90d' };
  }

  return null;
}
