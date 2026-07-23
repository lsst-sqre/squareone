import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import type { Logger } from './logger';
import { reportingQueryFn } from './reporting-query-fn';

class HttpError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

function makeZodError(): z.ZodError {
  const result = z.object({ name: z.string() }).safeParse({ name: 123 });
  if (result.success) {
    throw new Error('expected the schema parse to fail');
  }
  return result.error;
}

function makeLogger(): Logger {
  return {
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };
}

describe('reportingQueryFn', () => {
  it('returns the fetched value on success', async () => {
    const fn = reportingQueryFn({
      fetchFn: async () => 'ok',
      fallback: 'fallback',
      logger: makeLogger(),
    });
    await expect(fn()).resolves.toBe('ok');
  });

  it('does not log or report on success', async () => {
    const logger = makeLogger();
    const reportError = vi.fn();
    const fn = reportingQueryFn({
      fetchFn: async () => 'ok',
      fallback: 'fallback',
      logger,
      reportError,
    });
    await fn();
    expect(logger.error).not.toHaveBeenCalled();
    expect(reportError).not.toHaveBeenCalled();
  });

  it('returns the fallback when the fetch throws an expected error', async () => {
    const fn = reportingQueryFn({
      fetchFn: async () => {
        throw new HttpError('unauthorized', 401);
      },
      fallback: 'fallback',
      logger: makeLogger(),
    });
    await expect(fn()).resolves.toBe('fallback');
  });

  it('returns the fallback when the fetch throws a report-worthy error', async () => {
    const fn = reportingQueryFn({
      fetchFn: async () => {
        throw makeZodError();
      },
      fallback: 'fallback',
      logger: makeLogger(),
    });
    await expect(fn()).resolves.toBe('fallback');
  });

  it('logs every failure', async () => {
    const logger = makeLogger();
    const fn = reportingQueryFn({
      fetchFn: async () => {
        throw new HttpError('unauthorized', 401);
      },
      fallback: 'fallback',
      logger,
    });
    await fn();
    expect(logger.error).toHaveBeenCalledTimes(1);
  });

  it('does not invoke reportError for an expected error', async () => {
    const reportError = vi.fn();
    const fn = reportingQueryFn({
      fetchFn: async () => {
        throw new HttpError('forbidden', 403);
      },
      fallback: 'fallback',
      logger: makeLogger(),
      reportError,
    });
    await fn();
    expect(reportError).not.toHaveBeenCalled();
  });

  it('invokes reportError for a report-worthy error with the caught error and context', async () => {
    const reportError = vi.fn();
    const err = makeZodError();
    const fn = reportingQueryFn({
      fetchFn: async () => {
        throw err;
      },
      fallback: 'fallback',
      logger: makeLogger(),
      reportError,
      context: { site: 'broadcasts', package: 'semaphore-client' },
    });
    await fn();
    expect(reportError).toHaveBeenCalledTimes(1);
    expect(reportError).toHaveBeenCalledWith(err, {
      site: 'broadcasts',
      package: 'semaphore-client',
    });
  });

  it('still logs and returns the fallback when no reportError hook is provided', async () => {
    const logger = makeLogger();
    const fn = reportingQueryFn({
      fetchFn: async () => {
        throw makeZodError();
      },
      fallback: 'fallback',
      logger,
    });
    await expect(fn()).resolves.toBe('fallback');
    expect(logger.error).toHaveBeenCalledTimes(1);
  });

  it('treats a network error as report-worthy on the server', async () => {
    const reportError = vi.fn();
    const fn = reportingQueryFn({
      fetchFn: async () => {
        throw new TypeError('fetch failed');
      },
      fallback: 'fallback',
      logger: makeLogger(),
      reportError,
      isServer: true,
    });
    await fn();
    expect(reportError).toHaveBeenCalledTimes(1);
  });

  it('treats a network error as expected in the browser', async () => {
    const reportError = vi.fn();
    const fn = reportingQueryFn({
      fetchFn: async () => {
        throw new TypeError('fetch failed');
      },
      fallback: 'fallback',
      logger: makeLogger(),
      reportError,
      isServer: false,
    });
    await fn();
    expect(reportError).not.toHaveBeenCalled();
  });
});
