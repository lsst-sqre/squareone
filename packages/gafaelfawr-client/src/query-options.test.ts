import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ZodError } from 'zod';
import { getEmptyUserInfo } from './client';
import { loginInfoQueryOptions, userInfoQueryOptions } from './query-options';

/**
 * Stub `fetch` with an OK response carrying the given JSON body. A body that
 * does not match the schema makes the client's `.parse()` throw a ZodError.
 */
function mockFetchJson(body: unknown) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => body,
    }))
  );
}

/** Stub `fetch` with a non-OK HTTP response of the given status. */
function mockFetchStatus(status: number) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({
      ok: false,
      status,
      statusText: 'Error',
      json: async () => ({}),
    }))
  );
}

/** Stub `fetch` to reject with a network-level failure (no HTTP status). */
function mockFetchNetworkError() {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => {
      throw new TypeError('fetch failed');
    })
  );
}

// A minimal valid UserInfo payload (matches UserInfoSchema).
const validUserInfo = {
  username: 'someuser',
  name: 'Some User',
  email: 'someuser@example.com',
  uid: 1234,
  gid: 1234,
  groups: [],
  quota: null,
};

// A minimal valid LoginInfo payload (matches LoginInfoSchema).
const validLoginInfo = {
  csrf: 'csrf-token-value',
  username: 'someuser',
  scopes: [],
  config: { scopes: [] },
};

const baseUrl = 'https://example.com/auth/api/v1';

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('userInfoQueryOptions', () => {
  it('returns fetched user info on success', async () => {
    mockFetchJson(validUserInfo);
    const opts = userInfoQueryOptions(baseUrl);
    // biome-ignore lint/style/noNonNullAssertion: queryFn is always defined for our factory
    const result = await opts.queryFn!({} as never);

    expect(result).toMatchObject({ username: 'someuser' });
  });

  it('falls back to empty user info and does not report on a 401', async () => {
    mockFetchStatus(401);
    const reportError = vi.fn();
    const opts = userInfoQueryOptions(baseUrl, {
      reportError,
      context: { site: 'user-info', package: 'gafaelfawr-client' },
    });
    // biome-ignore lint/style/noNonNullAssertion: test assertion
    const result = await opts.queryFn!({} as never);

    expect(result).toEqual(getEmptyUserInfo());
    expect(reportError).not.toHaveBeenCalled();
  });

  it('does not report on a 403', async () => {
    mockFetchStatus(403);
    const reportError = vi.fn();
    const opts = userInfoQueryOptions(baseUrl, {
      reportError,
      context: { site: 'user-info' },
    });
    // biome-ignore lint/style/noNonNullAssertion: test assertion
    const result = await opts.queryFn!({} as never);

    expect(result).toEqual(getEmptyUserInfo());
    expect(reportError).not.toHaveBeenCalled();
  });

  it('invokes reportError on a 5xx and still falls back', async () => {
    mockFetchStatus(503);
    const reportError = vi.fn();
    const opts = userInfoQueryOptions(baseUrl, {
      reportError,
      context: { site: 'user-info', package: 'gafaelfawr-client' },
    });
    // biome-ignore lint/style/noNonNullAssertion: test assertion
    const result = await opts.queryFn!({} as never);

    expect(result).toEqual(getEmptyUserInfo());
    expect(reportError).toHaveBeenCalledTimes(1);
    const [, context] = reportError.mock.calls[0];
    expect(context).toMatchObject({
      site: 'user-info',
      package: 'gafaelfawr-client',
    });
  });

  it('invokes reportError with a ZodError on contract drift and falls back', async () => {
    // A payload missing the required `username` field makes UserInfoSchema.parse
    // throw a ZodError — API contract drift.
    mockFetchJson({ name: 'no username here' });
    const reportError = vi.fn();
    const opts = userInfoQueryOptions(baseUrl, {
      reportError,
      context: { site: 'user-info' },
    });
    // biome-ignore lint/style/noNonNullAssertion: test assertion
    const result = await opts.queryFn!({} as never);

    expect(result).toEqual(getEmptyUserInfo());
    expect(reportError).toHaveBeenCalledTimes(1);
    const [err] = reportError.mock.calls[0];
    expect(err).toBeInstanceOf(ZodError);
  });

  it('reports a server-side network failure when isServer is set', async () => {
    mockFetchNetworkError();
    const reportError = vi.fn();
    const opts = userInfoQueryOptions(baseUrl, {
      reportError,
      isServer: true,
      context: { site: 'user-info' },
    });
    // biome-ignore lint/style/noNonNullAssertion: test assertion
    const result = await opts.queryFn!({} as never);

    expect(result).toEqual(getEmptyUserInfo());
    expect(reportError).toHaveBeenCalledTimes(1);
  });
});

describe('loginInfoQueryOptions', () => {
  it('returns fetched login info on success', async () => {
    mockFetchJson(validLoginInfo);
    const opts = loginInfoQueryOptions(baseUrl);
    // biome-ignore lint/style/noNonNullAssertion: queryFn is always defined for our factory
    const result = await opts.queryFn!({} as never);

    expect(result).toMatchObject({ csrf: 'csrf-token-value' });
  });

  it('falls back to null and does not report on a 401', async () => {
    mockFetchStatus(401);
    const reportError = vi.fn();
    const opts = loginInfoQueryOptions(baseUrl, {
      reportError,
      context: { site: 'login-info', package: 'gafaelfawr-client' },
    });
    // biome-ignore lint/style/noNonNullAssertion: test assertion
    const result = await opts.queryFn!({} as never);

    expect(result).toBeNull();
    expect(reportError).not.toHaveBeenCalled();
  });

  it('does not report on a 403', async () => {
    mockFetchStatus(403);
    const reportError = vi.fn();
    const opts = loginInfoQueryOptions(baseUrl, {
      reportError,
      context: { site: 'login-info' },
    });
    // biome-ignore lint/style/noNonNullAssertion: test assertion
    const result = await opts.queryFn!({} as never);

    expect(result).toBeNull();
    expect(reportError).not.toHaveBeenCalled();
  });

  it('invokes reportError on a 5xx and still falls back to null', async () => {
    mockFetchStatus(500);
    const reportError = vi.fn();
    const opts = loginInfoQueryOptions(baseUrl, {
      reportError,
      context: { site: 'login-info', package: 'gafaelfawr-client' },
    });
    // biome-ignore lint/style/noNonNullAssertion: test assertion
    const result = await opts.queryFn!({} as never);

    expect(result).toBeNull();
    expect(reportError).toHaveBeenCalledTimes(1);
    const [, context] = reportError.mock.calls[0];
    expect(context).toMatchObject({
      site: 'login-info',
      package: 'gafaelfawr-client',
    });
  });

  it('invokes reportError with a ZodError on contract drift and falls back to null', async () => {
    // Missing the required `csrf` field → ZodError on parse.
    mockFetchJson({ scopes: [], config: { scopes: [] } });
    const reportError = vi.fn();
    const opts = loginInfoQueryOptions(baseUrl, {
      reportError,
      context: { site: 'login-info' },
    });
    // biome-ignore lint/style/noNonNullAssertion: test assertion
    const result = await opts.queryFn!({} as never);

    expect(result).toBeNull();
    expect(reportError).toHaveBeenCalledTimes(1);
    const [err] = reportError.mock.calls[0];
    expect(err).toBeInstanceOf(ZodError);
  });

  it('reports a server-side network failure when isServer is set', async () => {
    mockFetchNetworkError();
    const reportError = vi.fn();
    const opts = loginInfoQueryOptions(baseUrl, {
      reportError,
      isServer: true,
      context: { site: 'login-info' },
    });
    // biome-ignore lint/style/noNonNullAssertion: test assertion
    const result = await opts.queryFn!({} as never);

    expect(result).toBeNull();
    expect(reportError).toHaveBeenCalledTimes(1);
  });
});
