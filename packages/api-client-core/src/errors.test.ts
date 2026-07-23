import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { classifyError } from './errors';

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
