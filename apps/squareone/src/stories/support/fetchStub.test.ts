import { describe, expect, test } from 'vitest';

import { matchesRequest, requestMethod, requestUrl } from './fetchStub';

describe('requestUrl', () => {
  test('reads the URL out of every input form fetch accepts', () => {
    expect(requestUrl('/auth/api/v1/login')).toBe('/auth/api/v1/login');
    expect(requestUrl(new URL('https://example.org/tokens?limit=5'))).toBe(
      'https://example.org/tokens?limit=5'
    );
    expect(requestUrl(new Request('https://example.org/tokens'))).toBe(
      'https://example.org/tokens'
    );
  });
});

describe('requestMethod', () => {
  test('defaults to GET, as fetch does', () => {
    expect(requestMethod('/tokens')).toBe('GET');
    expect(requestMethod('/tokens', {})).toBe('GET');
  });

  test('normalizes the case of a method given in the init', () => {
    // `fetch` uppercases the standard methods itself, so a stub comparing
    // against 'POST' must not care which case the caller wrote.
    expect(requestMethod('/tokens', { method: 'post' })).toBe('POST');
  });

  test('reads the method off a Request input, which carries its own', () => {
    // A caller that builds a Request puts the method there and passes no init
    // at all, so an init-only reading would see every such call as a GET.
    expect(
      requestMethod(
        new Request('https://example.org/tokens', { method: 'POST' })
      )
    ).toBe('POST');
  });
});

describe('matchesRequest', () => {
  test('matches a request for the given path and method', () => {
    expect(
      matchesRequest(
        '/admin/sentry/emit-log',
        { method: 'POST' },
        {
          pathname: '/admin/sentry/emit-log',
          method: 'POST',
        }
      )
    ).toBe(true);
  });

  test('ignores a query string and fragment on the request', () => {
    // A stub that matched the whole URL string would stop intercepting the
    // moment the component under test appended a cache-buster, and the story
    // would then time out on a request that quietly went to the network.
    expect(
      matchesRequest(
        '/admin/sentry/emit-log?probe=1#top',
        { method: 'POST' },
        {
          pathname: '/admin/sentry/emit-log',
          method: 'POST',
        }
      )
    ).toBe(true);
  });

  test('matches an absolute URL for the same path', () => {
    expect(
      matchesRequest(
        new URL('/admin/sentry/emit-log', window.location.origin),
        { method: 'POST' },
        { pathname: '/admin/sentry/emit-log', method: 'POST' }
      )
    ).toBe(true);
  });

  test('does not match a path that merely ends with the target', () => {
    // Suffix matching is the bug this replaces: a proxy or basePath prefix
    // would have made an unrelated route answer with the stub's body.
    expect(
      matchesRequest(
        '/tenant/admin/sentry/emit-log',
        { method: 'POST' },
        {
          pathname: '/admin/sentry/emit-log',
          method: 'POST',
        }
      )
    ).toBe(false);
  });

  test('does not match another method on the same path', () => {
    expect(
      matchesRequest('/admin/sentry/emit-log', undefined, {
        pathname: '/admin/sentry/emit-log',
        method: 'POST',
      })
    ).toBe(false);
  });

  test('defaults to matching GET when no method is required', () => {
    expect(matchesRequest('/tokens', undefined, { pathname: '/tokens' })).toBe(
      true
    );
    expect(
      matchesRequest('/tokens', { method: 'DELETE' }, { pathname: '/tokens' })
    ).toBe(false);
  });
});
