import type { ParsedUrlQuery } from 'node:querystring';

interface TokenQueryParams {
  name?: string;
  scopes?: string[];
  expiration?: string;
}

/**
 * Parse and validate query parameters for token form prefilling
 */
export function parseTokenQueryParams(query: ParsedUrlQuery): TokenQueryParams {
  const result: TokenQueryParams = {};

  // Parse name parameter
  if (typeof query.name === 'string' && query.name.trim().length > 0) {
    result.name = query.name.trim();
  }

  // Parse scopes parameter (can be comma-separated string or array)
  if (query.scope) {
    const scopeValues = Array.isArray(query.scope)
      ? query.scope
      : [query.scope];
    result.scopes = scopeValues
      .filter((s) => typeof s === 'string')
      .flatMap((s) => s.split(','))
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }

  // Parse expiration parameter
  if (
    typeof query.expiration === 'string' &&
    query.expiration.trim().length > 0
  ) {
    const exp = query.expiration.trim();
    // Validate it's either a preset duration or ISO8601 datetime
    if (
      ['1d', '7d', '30d', '90d', 'never'].includes(exp) ||
      isValidISODate(exp)
    ) {
      result.expiration = exp;
    }
  }

  return result;
}

/**
 * Basic validation for ISO8601 datetime strings
 */
function isValidISODate(dateString: string): boolean {
  try {
    const date = new Date(dateString);
    return (
      date instanceof Date &&
      !Number.isNaN(date.getTime()) &&
      dateString.includes('T')
    );
  } catch {
    return false;
  }
}
