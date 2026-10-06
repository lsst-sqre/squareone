import { QueryClient } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ZodError } from 'zod';
import { getEmptyUserInfo } from './client';
import { mockTokenDetail } from './mock-data';
import {
  type AuthQueryConfig,
  loginInfoQueryOptions,
  userInfoQueryOptions,
  userScopesQueryOptions,
} from './query-options';

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

describe.each([
  {
    name: 'userInfoQueryOptions',
    factory: userInfoQueryOptions,
    body: validUserInfo,
    url: `${baseUrl}/user-info`,
  },
  {
    name: 'loginInfoQueryOptions',
    factory: loginInfoQueryOptions,
    body: validLoginInfo,
    url: `${baseUrl}/login`,
  },
])('$name request options', ({ factory, body, url }) => {
  async function runQuery(options?: AuthQueryConfig) {
    mockFetchJson(body);
    // biome-ignore lint/style/noNonNullAssertion: queryFn is always defined for our factory
    await factory(baseUrl, options).queryFn!({} as never);
    return vi.mocked(fetch);
  }

  it('sends only credentials in the browser (no headers, not isServer)', async () => {
    const fetchMock = await runQuery({ context: { site: 'test' } });

    expect(fetchMock).toHaveBeenCalledWith(url, { credentials: 'include' });
  });

  it('forwards headers uncached', async () => {
    const fetchMock = await runQuery({
      headers: { cookie: 'gafaelfawr=session' },
    });

    expect(fetchMock).toHaveBeenCalledWith(url, {
      credentials: 'include',
      headers: { cookie: 'gafaelfawr=session' },
      cache: 'no-store',
    });
  });

  it('never caches a server-side call, even with no headers to forward', async () => {
    const fetchMock = await runQuery({ isServer: true });

    expect(fetchMock).toHaveBeenCalledWith(url, {
      credentials: 'include',
      cache: 'no-store',
    });
  });
});

describe('userScopesQueryOptions', () => {
  const scopes = ['exec:notebook', 'read:tap'];

  /** Run the scopes query the way TanStack would, against `client`. */
  async function runScopesQuery(
    options?: Parameters<typeof userScopesQueryOptions>[1],
    client = new QueryClient()
  ) {
    // biome-ignore lint/style/noNonNullAssertion: queryFn is always defined for our factory
    return userScopesQueryOptions(baseUrl, options).queryFn!({
      client,
    } as never);
  }

  describe('from login info (the default, and the browser)', () => {
    it("returns the login info's scopes", async () => {
      mockFetchJson({ ...validLoginInfo, scopes });

      await expect(runScopesQuery()).resolves.toEqual(scopes);
      expect(fetch).toHaveBeenCalledWith(`${baseUrl}/login`, {
        credentials: 'include',
      });
    });

    it('returns null for an anonymous visitor (401) without reporting', async () => {
      mockFetchStatus(401);
      const reportError = vi.fn();

      await expect(runScopesQuery({ reportError })).resolves.toBeNull();
      expect(reportError).not.toHaveBeenCalled();
    });

    it('reads login info already in the query cache instead of fetching', async () => {
      mockFetchJson(validLoginInfo);
      const client = new QueryClient();
      client.setQueryData(loginInfoQueryOptions(baseUrl).queryKey, {
        ...validLoginInfo,
        scopes,
      });

      await expect(runScopesQuery(undefined, client)).resolves.toEqual(scopes);
      expect(fetch).not.toHaveBeenCalled();
    });

    it('forwards the auth options to the login-info fetch', async () => {
      mockFetchJson(validLoginInfo);

      await runScopesQuery({ headers: { cookie: 'gafaelfawr=session' } });

      expect(fetch).toHaveBeenCalledWith(`${baseUrl}/login`, {
        credentials: 'include',
        headers: { cookie: 'gafaelfawr=session' },
        cache: 'no-store',
      });
    });
  });

  describe('from token info (a delegated token on the server)', () => {
    const bearer = { authorization: 'Bearer gt-delegated' };

    it("returns the authenticating token's scopes", async () => {
      mockFetchJson({ ...mockTokenDetail, scopes });

      await expect(
        runScopesQuery({ source: 'token-info', headers: bearer })
      ).resolves.toEqual(scopes);
      expect(fetch).toHaveBeenCalledWith(`${baseUrl}/token-info`, {
        credentials: 'include',
        headers: bearer,
        cache: 'no-store',
      });
    });

    it('returns null on a 401 without reporting', async () => {
      mockFetchStatus(401);
      const reportError = vi.fn();

      await expect(
        runScopesQuery({ source: 'token-info', headers: bearer, reportError })
      ).resolves.toBeNull();
      expect(reportError).not.toHaveBeenCalled();
    });

    it('reports a 5xx and still falls back to null', async () => {
      mockFetchStatus(503);
      const reportError = vi.fn();
      const context = { site: 'user-scopes' };

      await expect(
        runScopesQuery({
          source: 'token-info',
          headers: bearer,
          reportError,
          context,
        })
      ).resolves.toBeNull();
      expect(reportError).toHaveBeenCalledWith(expect.any(Error), context);
    });

    it('reports contract drift as a ZodError and falls back to null', async () => {
      mockFetchJson({ ...mockTokenDetail, scopes: 'not-a-list' });
      const reportError = vi.fn();

      await expect(
        runScopesQuery({ source: 'token-info', headers: bearer, reportError })
      ).resolves.toBeNull();
      expect(reportError).toHaveBeenCalledWith(
        expect.any(ZodError),
        expect.anything()
      );
    });
  });

  it('is keyed separately from login info, fresh for 30 seconds', () => {
    const options = userScopesQueryOptions(baseUrl);

    expect(options.queryKey).toEqual(['gafaelfawr', 'user-scopes']);
    expect(options.staleTime).toBe(30_000);
    expect(options.refetchOnWindowFocus).toBe(true);
  });
});
