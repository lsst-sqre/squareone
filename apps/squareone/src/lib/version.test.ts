import { afterEach, describe, expect, it } from 'vitest';
import { version } from '../../package.json';
import { getAppVersion } from './version';

describe('getAppVersion', () => {
  const originalRelease = process.env.SENTRY_RELEASE;
  const originalVersion = process.env.SQUAREONE_VERSION;

  afterEach(() => {
    if (originalRelease === undefined) {
      delete process.env.SENTRY_RELEASE;
    } else {
      process.env.SENTRY_RELEASE = originalRelease;
    }
    if (originalVersion === undefined) {
      delete process.env.SQUAREONE_VERSION;
    } else {
      process.env.SQUAREONE_VERSION = originalVersion;
    }
  });

  it('reads the version from SQUAREONE_VERSION when set', () => {
    process.env.SQUAREONE_VERSION = 'tickets-DM-55226';
    expect(getAppVersion().version).toBe('tickets-DM-55226');
  });

  it('falls back to the package.json version when SQUAREONE_VERSION is unset', () => {
    delete process.env.SQUAREONE_VERSION;
    expect(getAppVersion().version).toBe(version);
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
