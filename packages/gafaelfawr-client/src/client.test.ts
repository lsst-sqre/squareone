/**
 * Tests for Gafaelfawr client functions.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createToken,
  DEFAULT_GAFAELFAWR_URL,
  deleteToken,
  fetchLoginInfo,
  fetchTokenChangeHistory,
  fetchTokenDetails,
  fetchUserInfo,
  fetchUserTokens,
  getEmptyUserInfo,
} from './client';
import { GafaelfawrError } from './errors';
import { mockLoginInfo, mockTokens, mockUserInfo } from './mock-data';

describe('fetchUserInfo', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('fetches and validates user info', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockUserInfo),
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await fetchUserInfo('/auth/api/v1');

    expect(mockFetch).toHaveBeenCalledWith('/auth/api/v1/user-info', {
      credentials: 'include',
    });
    expect(result.username).toBe('testuser');
    expect(result.groups).toHaveLength(2);
  });

  it('normalizes URL with trailing slash', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockUserInfo),
    });
    vi.stubGlobal('fetch', mockFetch);

    await fetchUserInfo('/auth/api/v1/');

    expect(mockFetch).toHaveBeenCalledWith('/auth/api/v1/user-info', {
      credentials: 'include',
    });
  });

  it('throws GafaelfawrError on non-OK response', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
    });
    vi.stubGlobal('fetch', mockFetch);

    await expect(fetchUserInfo('/auth/api/v1')).rejects.toThrow(
      GafaelfawrError
    );
    await expect(fetchUserInfo('/auth/api/v1')).rejects.toThrow('401');
  });

  it('throws on invalid response data', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ invalid: 'data' }),
    });
    vi.stubGlobal('fetch', mockFetch);

    await expect(fetchUserInfo('/auth/api/v1')).rejects.toThrow();
  });
});

describe('getEmptyUserInfo', () => {
  it('returns empty user info structure', () => {
    const empty = getEmptyUserInfo();
    expect(empty.username).toBe('');
    expect(empty.groups).toEqual([]);
    expect(empty.quota).toBeNull();
  });
});

describe('fetchLoginInfo', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('fetches and validates login info', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockLoginInfo),
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await fetchLoginInfo('/auth/api/v1');

    expect(mockFetch).toHaveBeenCalledWith('/auth/api/v1/login', {
      credentials: 'include',
    });
    expect(result.csrf).toBe(mockLoginInfo.csrf);
    expect(result.scopes).toHaveLength(3);
  });

  it('throws GafaelfawrError on error', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      statusText: 'Forbidden',
    });
    vi.stubGlobal('fetch', mockFetch);

    await expect(fetchLoginInfo('/auth/api/v1')).rejects.toThrow(
      GafaelfawrError
    );
  });
});

describe('fetchUserTokens', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('fetches and validates token list', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockTokens),
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await fetchUserTokens('testuser', '/auth/api/v1');

    expect(mockFetch).toHaveBeenCalledWith(
      '/auth/api/v1/users/testuser/tokens',
      { credentials: 'include' }
    );
    expect(result).toHaveLength(mockTokens.length);
    expect(result[0].token).toBe(mockTokens[0].token);
  });

  it('URL-encodes username', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });
    vi.stubGlobal('fetch', mockFetch);

    await fetchUserTokens('user@example.com', '/auth/api/v1');

    expect(mockFetch).toHaveBeenCalledWith(
      '/auth/api/v1/users/user%40example.com/tokens',
      { credentials: 'include' }
    );
  });
});

describe('fetchTokenDetails', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('fetches and validates token details', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockTokens[0]),
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await fetchTokenDetails(
      'testuser',
      'gt-abc123def456ghij789', // 22 chars
      '/auth/api/v1'
    );

    expect(mockFetch).toHaveBeenCalledWith(
      '/auth/api/v1/users/testuser/tokens/gt-abc123def456ghij789',
      { credentials: 'include' }
    );
    expect(result.token).toBe(mockTokens[0].token);
  });

  it('throws on 404', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    });
    vi.stubGlobal('fetch', mockFetch);

    await expect(
      fetchTokenDetails('testuser', 'nonexistent', '/auth/api/v1')
    ).rejects.toThrow(GafaelfawrError);
  });
});

describe('fetchTokenChangeHistory', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('fetches history without filters', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
      headers: new Headers(),
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await fetchTokenChangeHistory(
      'testuser',
      {},
      '/auth/api/v1'
    );

    expect(mockFetch).toHaveBeenCalledWith(
      '/auth/api/v1/users/testuser/token-change-history',
      { credentials: 'include' }
    );
    expect(result.entries).toEqual([]);
    expect(result.nextCursor).toBeNull();
    expect(result.totalCount).toBeNull();
  });

  it('includes filter parameters in URL', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
      headers: new Headers(),
    });
    vi.stubGlobal('fetch', mockFetch);

    await fetchTokenChangeHistory(
      'testuser',
      {
        tokenType: 'user',
        limit: 20,
      },
      '/auth/api/v1'
    );

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('token_type=user'),
      expect.anything()
    );
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('limit=20'),
      expect.anything()
    );
  });

  it('parses pagination from Link header', async () => {
    const headers = new Headers();
    headers.set(
      'Link',
      '</auth/api/v1/users/testuser/token-change-history?cursor=abc123>; rel="next"'
    );
    headers.set('X-Total-Count', '100');

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
      headers,
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await fetchTokenChangeHistory(
      'testuser',
      {},
      '/auth/api/v1'
    );

    expect(result.nextCursor).toBe('abc123');
    expect(result.totalCount).toBe(100);
  });
});

describe('createToken', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('creates token with correct request', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ token: 'gt-new-token-here' }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await createToken(
      'testuser',
      {
        token_name: 'My Token',
        scopes: ['read:tap'],
        expires: 1700000000,
      },
      'csrf-token',
      '/auth/api/v1'
    );

    expect(mockFetch).toHaveBeenCalledWith(
      '/auth/api/v1/users/testuser/tokens',
      {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': 'csrf-token',
        },
        body: JSON.stringify({
          token_name: 'My Token',
          scopes: ['read:tap'],
          expires: 1700000000,
        }),
      }
    );
    expect(result.token).toBe('gt-new-token-here');
  });

  it('throws with formatted error on validation failure', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 422,
      statusText: 'Unprocessable Entity',
      json: () =>
        Promise.resolve({
          detail: [
            { loc: ['body', 'token_name'], msg: 'required', type: 'missing' },
          ],
        }),
    });
    vi.stubGlobal('fetch', mockFetch);

    await expect(
      createToken(
        'testuser',
        { token_name: '', scopes: [] },
        'csrf',
        '/auth/api/v1'
      )
    ).rejects.toThrow('body.token_name: required');
  });
});

describe('deleteToken', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('deletes token with correct request', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
    });
    vi.stubGlobal('fetch', mockFetch);

    await deleteToken('testuser', 'gt-token123', 'csrf-token', '/auth/api/v1');

    expect(mockFetch).toHaveBeenCalledWith(
      '/auth/api/v1/users/testuser/tokens/gt-token123',
      {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'X-CSRF-Token': 'csrf-token',
        },
      }
    );
  });

  it('throws on 404', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: () => Promise.reject(new Error('No JSON')),
    });
    vi.stubGlobal('fetch', mockFetch);

    await expect(
      deleteToken('testuser', 'nonexistent', 'csrf', '/auth/api/v1')
    ).rejects.toThrow(GafaelfawrError);
  });
});

describe('DEFAULT_GAFAELFAWR_URL', () => {
  it('has correct value', () => {
    expect(DEFAULT_GAFAELFAWR_URL).toBe('/auth/api/v1');
  });
});
