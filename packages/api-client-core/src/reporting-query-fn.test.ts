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

  describe('server-side retry of a network-level failure', () => {
    /** A fetchFn whose first call rejects with a connection reset, then
     * resolves with `'ok'`. */
    function failOnceThenSucceed() {
      return vi
        .fn<() => Promise<string>>()
        .mockRejectedValueOnce(new TypeError('fetch failed'))
        .mockResolvedValue('ok');
    }

    it('returns the retried value when the retry succeeds', async () => {
      const fetchFn = failOnceThenSucceed();
      const fn = reportingQueryFn({
        fetchFn,
        fallback: 'fallback',
        logger: makeLogger(),
        isServer: true,
      });
      await expect(fn()).resolves.toBe('ok');
      expect(fetchFn).toHaveBeenCalledTimes(2);
    });

    it('does not report or log an error when the retry succeeds', async () => {
      const logger = makeLogger();
      const reportError = vi.fn();
      const fn = reportingQueryFn({
        fetchFn: failOnceThenSucceed(),
        fallback: 'fallback',
        logger,
        reportError,
        isServer: true,
      });
      await fn();
      expect(reportError).not.toHaveBeenCalled();
      expect(logger.error).not.toHaveBeenCalled();
    });

    it('logs the first failure as one warning with the call-site context', async () => {
      const logger = makeLogger();
      const fetchFn = failOnceThenSucceed();
      const fn = reportingQueryFn({
        fetchFn,
        fallback: 'fallback',
        logger,
        context: { site: 'broadcasts', package: 'semaphore-client' },
        isServer: true,
      });
      await fn();
      expect(logger.warn).toHaveBeenCalledTimes(1);
      expect(logger.warn).toHaveBeenCalledWith(
        {
          err: expect.any(TypeError),
          site: 'broadcasts',
          package: 'semaphore-client',
        },
        expect.any(String)
      );
    });

    it('retries when isServer is auto-detected', async () => {
      // The package's Vitest environment is Node, which has no `window`.
      const fetchFn = failOnceThenSucceed();
      const fn = reportingQueryFn({
        fetchFn,
        fallback: 'fallback',
        logger: makeLogger(),
      });
      await expect(fn()).resolves.toBe('ok');
      expect(fetchFn).toHaveBeenCalledTimes(2);
    });

    it('returns the fallback after two network failures', async () => {
      const fetchFn = vi
        .fn<() => Promise<string>>()
        .mockRejectedValue(new TypeError('fetch failed'));
      const fn = reportingQueryFn({
        fetchFn,
        fallback: 'fallback',
        logger: makeLogger(),
        isServer: true,
      });
      await expect(fn()).resolves.toBe('fallback');
      expect(fetchFn).toHaveBeenCalledTimes(2);
    });

    it('logs and reports two network failures exactly once', async () => {
      const logger = makeLogger();
      const reportError = vi.fn();
      const retryErr = new TypeError('fetch failed');
      const fn = reportingQueryFn({
        fetchFn: vi
          .fn<() => Promise<string>>()
          .mockRejectedValueOnce(new TypeError('fetch failed'))
          .mockRejectedValueOnce(retryErr),
        fallback: 'fallback',
        logger,
        reportError,
        context: { site: 'service-discovery' },
        isServer: true,
      });
      await fn();
      expect(logger.error).toHaveBeenCalledTimes(1);
      expect(reportError).toHaveBeenCalledTimes(1);
      expect(reportError).toHaveBeenCalledWith(retryErr, {
        site: 'service-discovery',
      });
    });

    it('classifies the retry error, not the first one', async () => {
      // A reset connection followed by a 401 is an anonymous visitor, not an
      // outage: the retry's answer decides.
      const reportError = vi.fn();
      const fn = reportingQueryFn({
        fetchFn: vi
          .fn<() => Promise<string>>()
          .mockRejectedValueOnce(new TypeError('fetch failed'))
          .mockRejectedValueOnce(new HttpError('unauthorized', 401)),
        fallback: 'fallback',
        logger: makeLogger(),
        reportError,
        isServer: true,
      });
      await expect(fn()).resolves.toBe('fallback');
      expect(reportError).not.toHaveBeenCalled();
    });

    it.each([
      ['an HTTP 401', () => new HttpError('unauthorized', 401), false],
      ['an HTTP 500', () => new HttpError('server error', 500), true],
      ['a ZodError', makeZodError, true],
    ])(
      'does not retry %s and classifies it as before',
      async (_label, makeErr, reported) => {
        const logger = makeLogger();
        const reportError = vi.fn();
        const err = makeErr();
        const fetchFn = vi.fn<() => Promise<string>>().mockRejectedValue(err);
        const fn = reportingQueryFn({
          fetchFn,
          fallback: 'fallback',
          logger,
          reportError,
          context: { site: 'user-info' },
          isServer: true,
        });
        await expect(fn()).resolves.toBe('fallback');
        expect(fetchFn).toHaveBeenCalledTimes(1);
        expect(logger.warn).not.toHaveBeenCalled();
        expect(logger.error).toHaveBeenCalledTimes(1);
        expect(reportError.mock.calls).toEqual(
          reported ? [[err, { site: 'user-info' }]] : []
        );
      }
    );

    it('does not retry a network error in the browser', async () => {
      const logger = makeLogger();
      const fetchFn = vi
        .fn<() => Promise<string>>()
        .mockRejectedValueOnce(new TypeError('fetch failed'))
        .mockResolvedValue('ok');
      const fn = reportingQueryFn({
        fetchFn,
        fallback: 'fallback',
        logger,
        isServer: false,
      });
      await expect(fn()).resolves.toBe('fallback');
      expect(fetchFn).toHaveBeenCalledTimes(1);
      expect(logger.warn).not.toHaveBeenCalled();
    });
  });
});
