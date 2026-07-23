import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ZodError } from 'zod';
import { getEmptyGitHubContents, getEmptyGitHubPrContents } from './client';
import {
  githubContentsQueryOptions,
  githubPrContentsQueryOptions,
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

// A minimal valid GitHub contents payload (matches GitHubContentsRootSchema).
const validGitHubContents = { contents: [] };

// A minimal valid GitHub PR contents payload (matches GitHubPrContentsSchema).
const validGitHubPrContents = {
  contents: [],
  pull_requests: [],
  yaml_check: null,
  nbexec_check: null,
};

const baseUrl = 'https://example.com/times-square/api/v1';

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('githubContentsQueryOptions', () => {
  it('returns fetched contents on success', async () => {
    mockFetchJson(validGitHubContents);
    const opts = githubContentsQueryOptions(baseUrl);
    // biome-ignore lint/style/noNonNullAssertion: queryFn is always defined for our factory
    const result = await opts.queryFn!({} as never);

    expect(result).toEqual({ contents: [] });
  });

  it('falls back to empty contents and does not report on a 403', async () => {
    mockFetchStatus(403);
    const reportError = vi.fn();
    const opts = githubContentsQueryOptions(baseUrl, {
      reportError,
      context: { site: 'github-contents', package: 'times-square-client' },
    });
    // biome-ignore lint/style/noNonNullAssertion: test assertion
    const result = await opts.queryFn!({} as never);

    expect(result).toEqual(getEmptyGitHubContents());
    expect(reportError).not.toHaveBeenCalled();
  });

  it('invokes reportError on a 5xx and still falls back to empty contents', async () => {
    mockFetchStatus(503);
    const reportError = vi.fn();
    const opts = githubContentsQueryOptions(baseUrl, {
      reportError,
      context: { site: 'github-contents', package: 'times-square-client' },
    });
    // biome-ignore lint/style/noNonNullAssertion: test assertion
    const result = await opts.queryFn!({} as never);

    expect(result).toEqual(getEmptyGitHubContents());
    expect(reportError).toHaveBeenCalledTimes(1);
    const [, context] = reportError.mock.calls[0];
    expect(context).toMatchObject({
      site: 'github-contents',
      package: 'times-square-client',
    });
  });

  it('invokes reportError with a ZodError on contract drift and falls back', async () => {
    // A payload missing the required `contents` field makes the schema throw.
    mockFetchJson({ not_contents: true });
    const reportError = vi.fn();
    const opts = githubContentsQueryOptions(baseUrl, {
      reportError,
      context: { site: 'github-contents' },
    });
    // biome-ignore lint/style/noNonNullAssertion: test assertion
    const result = await opts.queryFn!({} as never);

    expect(result).toEqual(getEmptyGitHubContents());
    expect(reportError).toHaveBeenCalledTimes(1);
    const [err] = reportError.mock.calls[0];
    expect(err).toBeInstanceOf(ZodError);
  });

  it('reports a server-side network failure when isServer is set', async () => {
    mockFetchNetworkError();
    const reportError = vi.fn();
    const opts = githubContentsQueryOptions(baseUrl, {
      reportError,
      isServer: true,
      context: { site: 'github-contents' },
    });
    // biome-ignore lint/style/noNonNullAssertion: test assertion
    const result = await opts.queryFn!({} as never);

    expect(result).toEqual(getEmptyGitHubContents());
    expect(reportError).toHaveBeenCalledTimes(1);
  });
});

describe('githubPrContentsQueryOptions', () => {
  const owner = 'lsst-sqre';
  const repo = 'times-square-demo';
  const commit = 'abc123';

  it('returns fetched PR contents on success', async () => {
    mockFetchJson(validGitHubPrContents);
    const opts = githubPrContentsQueryOptions(owner, repo, commit, baseUrl);
    // biome-ignore lint/style/noNonNullAssertion: queryFn is always defined for our factory
    const result = await opts.queryFn!({} as never);

    expect(result).toMatchObject({ contents: [], pull_requests: [] });
  });

  it('falls back to empty PR contents and does not report on a 403', async () => {
    mockFetchStatus(403);
    const reportError = vi.fn();
    const opts = githubPrContentsQueryOptions(owner, repo, commit, baseUrl, {
      reportError,
      context: { site: 'github-pr-contents', package: 'times-square-client' },
    });
    // biome-ignore lint/style/noNonNullAssertion: test assertion
    const result = await opts.queryFn!({} as never);

    expect(result).toEqual(getEmptyGitHubPrContents());
    expect(reportError).not.toHaveBeenCalled();
  });

  it('invokes reportError on a 5xx and still falls back to empty PR contents', async () => {
    mockFetchStatus(500);
    const reportError = vi.fn();
    const opts = githubPrContentsQueryOptions(owner, repo, commit, baseUrl, {
      reportError,
      context: { site: 'github-pr-contents', package: 'times-square-client' },
    });
    // biome-ignore lint/style/noNonNullAssertion: test assertion
    const result = await opts.queryFn!({} as never);

    expect(result).toEqual(getEmptyGitHubPrContents());
    expect(reportError).toHaveBeenCalledTimes(1);
    const [, context] = reportError.mock.calls[0];
    expect(context).toMatchObject({
      site: 'github-pr-contents',
      package: 'times-square-client',
    });
  });

  it('invokes reportError with a ZodError on contract drift and falls back', async () => {
    // A payload missing required fields makes the schema throw.
    mockFetchJson({ not_contents: true });
    const reportError = vi.fn();
    const opts = githubPrContentsQueryOptions(owner, repo, commit, baseUrl, {
      reportError,
      context: { site: 'github-pr-contents' },
    });
    // biome-ignore lint/style/noNonNullAssertion: test assertion
    const result = await opts.queryFn!({} as never);

    expect(result).toEqual(getEmptyGitHubPrContents());
    expect(reportError).toHaveBeenCalledTimes(1);
    const [err] = reportError.mock.calls[0];
    expect(err).toBeInstanceOf(ZodError);
  });

  it('reports a server-side network failure when isServer is set', async () => {
    mockFetchNetworkError();
    const reportError = vi.fn();
    const opts = githubPrContentsQueryOptions(owner, repo, commit, baseUrl, {
      reportError,
      isServer: true,
      context: { site: 'github-pr-contents' },
    });
    // biome-ignore lint/style/noNonNullAssertion: test assertion
    const result = await opts.queryFn!({} as never);

    expect(result).toEqual(getEmptyGitHubPrContents());
    expect(reportError).toHaveBeenCalledTimes(1);
  });
});
