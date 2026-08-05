/**
 * Tests for Times Square API client functions.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  deleteHtmlByUrl,
  deletePageHtml,
  fetchGitHubContents,
  fetchGitHubPrContents,
  sanitizeDisplayPath,
} from './client';
import { TimesSquareError } from './errors';

describe('sanitizeDisplayPath', () => {
  describe('valid paths', () => {
    it('passes through simple paths unchanged', () => {
      expect(sanitizeDisplayPath('owner/repo/notebook')).toBe(
        'owner/repo/notebook'
      );
    });

    it('passes through single-segment paths', () => {
      expect(sanitizeDisplayPath('notebook')).toBe('notebook');
    });

    it('passes through deeply nested paths', () => {
      expect(sanitizeDisplayPath('owner/repo/dir/subdir/notebook')).toBe(
        'owner/repo/dir/subdir/notebook'
      );
    });

    it('encodes spaces in path segments', () => {
      expect(sanitizeDisplayPath('owner/repo/my notebook')).toBe(
        'owner/repo/my%20notebook'
      );
    });

    it('encodes special characters in path segments', () => {
      expect(sanitizeDisplayPath('owner/repo/test@file')).toBe(
        'owner/repo/test%40file'
      );
      expect(sanitizeDisplayPath('owner/repo/file#1')).toBe(
        'owner/repo/file%231'
      );
      expect(sanitizeDisplayPath('owner/repo/a?b')).toBe('owner/repo/a%3Fb');
    });

    it('handles leading slashes by filtering empty segments', () => {
      expect(sanitizeDisplayPath('/owner/repo')).toBe('owner/repo');
    });

    it('handles trailing slashes by filtering empty segments', () => {
      expect(sanitizeDisplayPath('owner/repo/')).toBe('owner/repo');
    });

    it('handles double slashes by filtering empty segments', () => {
      expect(sanitizeDisplayPath('owner//repo')).toBe('owner/repo');
    });

    it('handles path with only leading and trailing slashes', () => {
      expect(sanitizeDisplayPath('/owner/repo/')).toBe('owner/repo');
    });
  });

  describe('path traversal prevention', () => {
    it('rejects paths starting with ..', () => {
      expect(() => sanitizeDisplayPath('../etc/passwd')).toThrow(
        TimesSquareError
      );
      expect(() => sanitizeDisplayPath('../etc/passwd')).toThrow(
        'path traversal'
      );
    });

    it('rejects paths with .. in the middle', () => {
      expect(() => sanitizeDisplayPath('owner/../other')).toThrow(
        TimesSquareError
      );
      expect(() => sanitizeDisplayPath('owner/repo/../../../etc')).toThrow(
        TimesSquareError
      );
    });

    it('rejects paths ending with ..', () => {
      expect(() => sanitizeDisplayPath('owner/repo/..')).toThrow(
        TimesSquareError
      );
    });

    it('rejects paths starting with .', () => {
      expect(() => sanitizeDisplayPath('./config')).toThrow(TimesSquareError);
    });

    it('rejects paths with . in the middle', () => {
      expect(() => sanitizeDisplayPath('owner/./repo')).toThrow(
        TimesSquareError
      );
    });

    it('rejects standalone ..', () => {
      expect(() => sanitizeDisplayPath('..')).toThrow(TimesSquareError);
    });

    it('rejects standalone .', () => {
      expect(() => sanitizeDisplayPath('.')).toThrow(TimesSquareError);
    });

    it('allows segments that contain but are not equal to ..', () => {
      // "foo.." and "..bar" are valid segment names, not traversal
      expect(sanitizeDisplayPath('owner/repo/file..ext')).toBe(
        'owner/repo/file..ext'
      );
      expect(sanitizeDisplayPath('owner/repo/..hidden')).toBe(
        'owner/repo/..hidden'
      );
    });

    it('allows segments that contain but are not equal to .', () => {
      // ".hidden" is a valid filename, not traversal
      expect(sanitizeDisplayPath('owner/repo/.hidden')).toBe(
        'owner/repo/.hidden'
      );
      expect(sanitizeDisplayPath('owner/repo/file.txt')).toBe(
        'owner/repo/file.txt'
      );
    });
  });

  describe('empty path handling', () => {
    it('rejects empty string', () => {
      expect(() => sanitizeDisplayPath('')).toThrow(TimesSquareError);
      expect(() => sanitizeDisplayPath('')).toThrow('cannot be empty');
    });

    it('rejects whitespace-only string', () => {
      expect(() => sanitizeDisplayPath('   ')).toThrow(TimesSquareError);
      expect(() => sanitizeDisplayPath('\t')).toThrow(TimesSquareError);
    });

    it('rejects path that is only slashes', () => {
      expect(() => sanitizeDisplayPath('/')).toThrow(TimesSquareError);
      expect(() => sanitizeDisplayPath('//')).toThrow(TimesSquareError);
      expect(() => sanitizeDisplayPath('///')).toThrow(TimesSquareError);
    });
  });

  describe('error status codes', () => {
    it('throws errors with 400 status code', () => {
      try {
        sanitizeDisplayPath('../evil');
      } catch (error) {
        expect(error).toBeInstanceOf(TimesSquareError);
        expect((error as TimesSquareError).statusCode).toBe(400);
      }
    });
  });

  describe('real-world attack vectors', () => {
    it('blocks SSRF attempts via path traversal', () => {
      // Attack: navigate up to hit internal services
      expect(() =>
        sanitizeDisplayPath('owner/../../../internal-service')
      ).toThrow(TimesSquareError);
    });

    it('blocks attempts to access system files', () => {
      expect(() => sanitizeDisplayPath('../../etc/passwd')).toThrow(
        TimesSquareError
      );
    });

    it('blocks multiple traversal sequences', () => {
      expect(() =>
        sanitizeDisplayPath('a/../b/../c/../../../etc/shadow')
      ).toThrow(TimesSquareError);
    });
  });
});

describe('GitHub contents normalization on parse', () => {
  const duplicateDirectoryContents = [
    {
      node_type: 'directory',
      path: 'o/r/dir',
      title: 'dir',
      contents: [
        { node_type: 'page', path: 'o/r/dir/nb1', title: 'nb1', contents: [] },
      ],
    },
    {
      node_type: 'directory',
      path: 'o/r/dir',
      title: 'dir',
      contents: [
        { node_type: 'page', path: 'o/r/dir/nb2', title: 'nb2', contents: [] },
      ],
    },
  ];

  function stubFetchJson(body: unknown): void {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify(body), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      )
    );
  }

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('fetchGitHubContents merges duplicate directory nodes', async () => {
    stubFetchJson({ contents: duplicateDirectoryContents });

    const result = await fetchGitHubContents('/times-square/api/v1');

    expect(result.contents).toHaveLength(1);
    expect(result.contents[0].contents.map((child) => child.path)).toEqual([
      'o/r/dir/nb1',
      'o/r/dir/nb2',
    ]);
  });

  it('fetchGitHubPrContents merges duplicate directory nodes', async () => {
    stubFetchJson({
      contents: duplicateDirectoryContents,
      owner: 'o',
      repo: 'r',
      commit: 'abc123',
      yaml_check: null,
      nbexec_check: null,
      pull_requests: [],
    });

    const result = await fetchGitHubPrContents(
      '/times-square/api/v1',
      'o',
      'r',
      'abc123'
    );

    expect(result.contents).toHaveLength(1);
    expect(result.contents[0].contents.map((child) => child.path)).toEqual([
      'o/r/dir/nb1',
      'o/r/dir/nb2',
    ]);
    expect(result.owner).toBe('o');
  });
});

describe('HTML soft delete (re-run)', () => {
  const deleteResponse = {
    html_url: 'https://example.com/v1/pages/summit-weather/html',
    html_events_url: 'https://example.com/v1/pages/summit-weather/html/events',
  };

  function stubDeleteOk(): ReturnType<typeof vi.fn> {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(deleteResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );
    vi.stubGlobal('fetch', fetchMock);
    return fetchMock;
  }

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('deletePageHtml issues a DELETE to the page html endpoint', async () => {
    const fetchMock = stubDeleteOk();

    await deletePageHtml('/times-square/api/v1', 'summit-weather');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/times-square/api/v1/pages/summit-weather/html');
    expect(init).toMatchObject({ method: 'DELETE' });
  });

  it('deletePageHtml appends the page instance parameters', async () => {
    const fetchMock = stubDeleteOk();

    await deletePageHtml('/times-square/api/v1/', 'summit-weather', {
      site: 'summit',
      day_obs: '2026-07-31',
    });

    expect(fetchMock.mock.calls[0][0]).toBe(
      '/times-square/api/v1/pages/summit-weather/html?site=summit&day_obs=2026-07-31'
    );
  });

  it('deletePageHtml returns the parsed delete response', async () => {
    stubDeleteOk();

    const result = await deletePageHtml(
      '/times-square/api/v1',
      'summit-weather'
    );

    expect(result).toEqual(deleteResponse);
  });

  it('deletePageHtml throws a TimesSquareError on a failed request', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          new Response('{}', { status: 404, statusText: 'Not Found' })
        )
    );

    await expect(
      deletePageHtml('/times-square/api/v1', 'summit-weather')
    ).rejects.toBeInstanceOf(TimesSquareError);
  });

  it('deleteHtmlByUrl issues a DELETE to the given html URL with params', async () => {
    const fetchMock = stubDeleteOk();

    await deleteHtmlByUrl(
      'https://example.com/times-square/api/v1/pages/summit-weather/html',
      { site: 'summit' }
    );

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(
      'https://example.com/times-square/api/v1/pages/summit-weather/html?site=summit'
    );
    expect(init).toMatchObject({ method: 'DELETE' });
  });
});
