import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import {
  classifyError,
  isConnectionError,
  isNetworkError,
  QueryTimeoutError,
} from './errors';

/** A minimal HTTP-style error carrying a numeric statusCode, mirroring the
 * `SemaphoreError` / `RepertoireError` shape used across the client packages. */
class HttpError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

/** Produce a genuine ZodError by parsing invalid data against a schema. */
function makeZodError(): z.ZodError {
  const result = z.object({ name: z.string() }).safeParse({ name: 123 });
  if (result.success) {
    throw new Error('expected the schema parse to fail');
  }
  return result.error;
}

describe('classifyError', () => {
  it('classifies HTTP 401 as expected', () => {
    expect(classifyError(new HttpError('unauthorized', 401))).toBe('expected');
  });

  it('classifies HTTP 403 as expected', () => {
    expect(classifyError(new HttpError('forbidden', 403))).toBe('expected');
  });

  it('classifies a ZodError as report-worthy', () => {
    expect(classifyError(makeZodError())).toBe('report-worthy');
  });

  it('classifies HTTP 500 as report-worthy', () => {
    expect(classifyError(new HttpError('server error', 500))).toBe(
      'report-worthy'
    );
  });

  it('classifies HTTP 503 as report-worthy', () => {
    expect(classifyError(new HttpError('unavailable', 503))).toBe(
      'report-worthy'
    );
  });

  it('classifies a network error as report-worthy on the server', () => {
    const err = new TypeError('fetch failed');
    expect(classifyError(err, { isServer: true })).toBe('report-worthy');
  });

  it('classifies a network error as expected in the browser', () => {
    const err = new TypeError('fetch failed');
    expect(classifyError(err, { isServer: false })).toBe('expected');
  });

  it('treats a non-5xx, non-auth HTTP error (404) as expected', () => {
    expect(classifyError(new HttpError('not found', 404))).toBe('expected');
  });
});

describe('isNetworkError', () => {
  it('is true for a fetch TypeError', () => {
    expect(isNetworkError(new TypeError('fetch failed'))).toBe(true);
  });

  it('is true for an error carrying no HTTP status', () => {
    expect(isNetworkError(new HttpError('read ECONNRESET'))).toBe(true);
  });

  it('is false for an error carrying an HTTP status', () => {
    expect(isNetworkError(new HttpError('server error', 500))).toBe(false);
  });

  it('is false for a ZodError', () => {
    expect(isNetworkError(makeZodError())).toBe(false);
  });

  it('is true for a timeout', () => {
    expect(isNetworkError(new QueryTimeoutError(5000))).toBe(true);
  });
});

/** Node's `fetch` failure for a connection that failed with `code`. */
function fetchFailed(code: string): TypeError {
  const cause = Object.assign(new Error(`read ${code}`), { code });
  return new TypeError('fetch failed', { cause });
}

describe('isConnectionError', () => {
  it.each([
    'ECONNRESET',
    'ECONNREFUSED',
    'ECONNABORTED',
    'EPIPE',
    'UND_ERR_SOCKET',
  ])('is true for a fetch TypeError caused by %s', (code) => {
    expect(isConnectionError(fetchFailed(code))).toBe(true);
  });

  it.each<[string, () => unknown]>([
    ['a fetch TypeError with no cause', () => new TypeError('fetch failed')],
    ['a fetch TypeError caused by DNS failure', () => fetchFailed('ENOTFOUND')],
    [
      'a URL-parse TypeError',
      () =>
        new TypeError('Failed to parse URL from /auth/api/v1/user-info', {
          cause: new TypeError('Invalid URL'),
        }),
    ],
    [
      'a SyntaxError from an HTML body',
      () => new SyntaxError('Unexpected token < in JSON at position 0'),
    ],
    ['a timeout', () => new QueryTimeoutError(5000)],
    [
      'a non-TypeError carrying a connection code',
      () => Object.assign(new Error('read ECONNRESET'), { code: 'ECONNRESET' }),
    ],
    ['an HTTP error', () => new HttpError('server error', 500)],
  ])('is false for %s', (_label, makeErr) => {
    expect(isConnectionError(makeErr())).toBe(false);
  });
});

describe('QueryTimeoutError', () => {
  it('has its own name, distinct from a fetch TypeError', () => {
    const err = new QueryTimeoutError(5000);
    expect(err.name).toBe('QueryTimeoutError');
    expect(err.name).not.toBe(new TypeError('fetch failed').name);
  });

  it('records the timeout that elapsed', () => {
    const err = new QueryTimeoutError(250);
    expect(err.timeoutMs).toBe(250);
    expect(err.message).toBe('API query timed out after 250 ms');
  });

  it('is classified report-worthy on the server', () => {
    expect(classifyError(new QueryTimeoutError(5000), { isServer: true })).toBe(
      'report-worthy'
    );
  });
});
