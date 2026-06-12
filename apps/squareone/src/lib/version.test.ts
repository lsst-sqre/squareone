import { afterEach, describe, expect, it } from 'vitest';
import { getAppVersion } from './version';

describe('getAppVersion', () => {
  const originalRelease = process.env.SENTRY_RELEASE;

  afterEach(() => {
    if (originalRelease === undefined) {
      delete process.env.SENTRY_RELEASE;
    } else {
      process.env.SENTRY_RELEASE = originalRelease;
    }
  });

  it('returns the package.json version', () => {
    expect(getAppVersion().version).toBe('0.32.0');
  });

  it('reads the revision from SENTRY_RELEASE when set', () => {
    process.env.SENTRY_RELEASE = 'abc1234';
    expect(getAppVersion().revision).toBe('abc1234');
  });

  it('falls back to a null revision when SENTRY_RELEASE is unset', () => {
    delete process.env.SENTRY_RELEASE;
    expect(getAppVersion().revision).toBeNull();
  });
});
