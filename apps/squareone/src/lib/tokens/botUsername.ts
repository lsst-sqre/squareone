/**
 * Required prefix for Gafaelfawr service-token (bot) usernames.
 */
export const BOT_USERNAME_PREFIX = 'bot-';

/**
 * Gafaelfawr username regex.
 *
 * Usernames must contain only lowercase letters, digits, and hyphens,
 * start and end with a letter or digit, include at least one letter, and
 * may not contain leading, trailing, or doubled hyphens.
 */
export const GAFAELFAWR_USERNAME_REGEX =
  /^[a-z0-9](?:[a-z0-9]|-[a-z0-9])*[a-z](?:[a-z0-9]|-[a-z0-9])*$/;

/**
 * Validate a bot username.
 *
 * Returns `null` when the username is valid, otherwise a clear,
 * human-readable error message describing why it was rejected.
 */
export function validateBotUsername(username: string): string | null {
  if (username.length === 0) {
    return 'Username is required.';
  }

  if (!username.startsWith(BOT_USERNAME_PREFIX)) {
    return `Username must start with "${BOT_USERNAME_PREFIX}".`;
  }

  if (!GAFAELFAWR_USERNAME_REGEX.test(username)) {
    return (
      'Username must contain only lowercase letters, digits, and single ' +
      'hyphens, start and end with a letter or digit, and include at least ' +
      'one letter.'
    );
  }

  return null;
}
