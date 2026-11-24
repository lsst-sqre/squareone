import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { QueryTimeoutError } from './errors';
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

/** Node's `fetch` failure for a connection that failed with `code`. */
function connectionReset(code = 'ECONNRESET'): TypeError {
  const cause = Object.assign(new Error(`read ${code}`), { code });
  return new TypeError('fetch failed', { cause });
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

  describe('rethrowReportWorthy', () => {
    it.each<[string, () => unknown]>([
      ['an HTTP 5xx', () => new HttpError('unavailable', 503)],
      ['a ZodError', makeZodError],
      ['a server-side network error', () => new TypeError('fetch failed')],
    ])(
      'rejects with %s after logging and reporting it once',
      async (_label, makeErr) => {
        const logger = makeLogger();
        const reportError = vi.fn();
        const err = makeErr();
        const fn = reportingQueryFn({
          fetchFn: async () => {
            throw err;
          },
          fallback: 'fallback',
          logger,
          reportError,
          context: { site: 'user-info' },
          isServer: true,
          rethrowReportWorthy: true,
        });
        await expect(fn()).rejects.toBe(err);
        expect(logger.error).toHaveBeenCalledTimes(1);
        expect(reportError).toHaveBeenCalledTimes(1);
        expect(reportError).toHaveBeenCalledWith(err, { site: 'user-info' });
      }
    );

    it.each([401, 403])(
      'still resolves to the fallback for an expected HTTP %s',
      async (status) => {
        const reportError = vi.fn();
        const fn = reportingQueryFn({
          fetchFn: async () => {
            throw new HttpError('auth', status);
          },
          fallback: 'fallback',
          logger: makeLogger(),
          reportError,
          isServer: true,
          rethrowReportWorthy: true,
        });
        await expect(fn()).resolves.toBe('fallback');
        expect(reportError).not.toHaveBeenCalled();
      }
    );

    it('rejects with the timeout error when the call times out', async () => {
      vi.useFakeTimers();
      try {
        const reportError = vi.fn();
        const fn = reportingQueryFn({
          fetchFn: () => new Promise<string>(() => {}),
          fallback: 'fallback',
          logger: makeLogger(),
          reportError,
          isServer: true,
          rethrowReportWorthy: true,
        });
        const result = fn();
        result.catch(() => {});
        await vi.advanceTimersByTimeAsync(5000);
        await expect(result).rejects.toBeInstanceOf(QueryTimeoutError);
        expect(reportError).toHaveBeenCalledTimes(1);
      } finally {
        vi.useRealTimers();
      }
    });

    it('still returns the value of a successful retry', async () => {
      const fn = reportingQueryFn({
        fetchFn: vi
          .fn<() => Promise<string>>()
          .mockRejectedValueOnce(connectionReset())
          .mockResolvedValue('ok'),
        fallback: 'fallback',
        logger: makeLogger(),
        isServer: true,
        rethrowReportWorthy: true,
      });
      await expect(fn()).resolves.toBe('ok');
    });

    it('resolves to the fallback for a browser network error, which is expected there', async () => {
      const fn = reportingQueryFn({
        fetchFn: async () => {
          throw new TypeError('fetch failed');
        },
        fallback: 'fallback',
        logger: makeLogger(),
        isServer: false,
        rethrowReportWorthy: true,
      });
      await expect(fn()).resolves.toBe('fallback');
    });

    it('defaults to resolving every failure to the fallback', async () => {
      const fn = reportingQueryFn({
        fetchFn: async () => {
          throw new HttpError('unavailable', 503);
        },
        fallback: 'fallback',
        logger: makeLogger(),
        isServer: true,
      });
      await expect(fn()).resolves.toBe('fallback');
    });
  });

  describe('server-side retry of a network-level failure', () => {
    /** A fetchFn whose first call rejects with a connection reset, then
     * resolves with `'ok'`. */
    function failOnceThenSucceed() {
      return vi
        .fn<() => Promise<string>>()
        .mockRejectedValueOnce(connectionReset())
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
        .mockRejectedValue(connectionReset());
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
      const retryErr = connectionReset();
      const fn = reportingQueryFn({
        fetchFn: vi
          .fn<() => Promise<string>>()
          .mockRejectedValueOnce(connectionReset())
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
          .mockRejectedValueOnce(connectionReset())
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

    it.each<[string, () => Error]>([
      [
        'a SyntaxError from a non-JSON body',
        () => new SyntaxError('Unexpected token < in JSON at position 0'),
      ],
      [
        'a URL-parse TypeError',
        () =>
          new TypeError('Failed to parse URL from /auth/api/v1/user-info', {
            cause: new TypeError('Invalid URL'),
          }),
      ],
      ['a fetch TypeError with no connection code', () => new TypeError('x')],
    ])(
      'does not retry %s, and reports it as before',
      async (_label, makeErr) => {
        const reportError = vi.fn();
        const logger = makeLogger();
        const err = makeErr();
        const fetchFn = vi
          .fn<() => Promise<string>>()
          .mockRejectedValueOnce(err)
          .mockResolvedValue('ok');
        const fn = reportingQueryFn({
          fetchFn,
          fallback: 'fallback',
          logger,
          reportError,
          isServer: true,
        });
        await expect(fn()).resolves.toBe('fallback');
        expect(fetchFn).toHaveBeenCalledTimes(1);
        expect(logger.warn).not.toHaveBeenCalled();
        expect(reportError).toHaveBeenCalledWith(err, {});
      }
    );

    it.each(['ECONNREFUSED', 'EPIPE', 'UND_ERR_SOCKET'])(
      'retries a connection failure with code %s',
      async (code) => {
        const fetchFn = vi
          .fn<() => Promise<string>>()
          .mockRejectedValueOnce(connectionReset(code))
          .mockResolvedValue('ok');
        const fn = reportingQueryFn({
          fetchFn,
          fallback: 'fallback',
          logger: makeLogger(),
          isServer: true,
        });
        await expect(fn()).resolves.toBe('ok');
        expect(fetchFn).toHaveBeenCalledTimes(2);
      }
    );

    it('does not retry a network error in the browser', async () => {
      const logger = makeLogger();
      const fetchFn = vi
        .fn<() => Promise<string>>()
        .mockRejectedValueOnce(connectionReset())
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

  describe('server-side timeout', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    /** A fetchFn that never settles, as a hung upstream would. */
    function hang() {
      return vi.fn<(signal?: AbortSignal) => Promise<string>>(
        () => new Promise<string>(() => {})
      );
    }

    it('resolves to the fallback when fetchFn never settles', async () => {
      const fn = reportingQueryFn({
        fetchFn: hang(),
        fallback: 'fallback',
        logger: makeLogger(),
        isServer: true,
      });
      const result = fn();
      await vi.advanceTimersByTimeAsync(5000);
      await expect(result).resolves.toBe('fallback');
    });

    it('aborts the signal passed to fetchFn with the timeout error', async () => {
      const fetchFn = hang();
      const fn = reportingQueryFn({
        fetchFn,
        fallback: 'fallback',
        logger: makeLogger(),
        isServer: true,
      });
      const result = fn();
      const signal = fetchFn.mock.calls[0][0];
      expect(signal).toBeInstanceOf(AbortSignal);
      expect(signal?.aborted).toBe(false);

      await vi.advanceTimersByTimeAsync(5000);
      await result;
      expect(signal?.aborted).toBe(true);
      expect(signal?.reason).toBeInstanceOf(QueryTimeoutError);
    });

    it('logs and reports a timeout once, without retrying it', async () => {
      const fetchFn = hang();
      const logger = makeLogger();
      const reportError = vi.fn();
      const fn = reportingQueryFn({
        fetchFn,
        fallback: 'fallback',
        logger,
        reportError,
        context: { site: 'broadcasts' },
        isServer: true,
      });
      const result = fn();
      await vi.advanceTimersByTimeAsync(60_000);
      await expect(result).resolves.toBe('fallback');

      expect(fetchFn).toHaveBeenCalledTimes(1);
      expect(logger.warn).not.toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalledTimes(1);
      expect(logger.error).toHaveBeenCalledWith(
        { err: expect.any(QueryTimeoutError), site: 'broadcasts' },
        expect.any(String)
      );
      expect(reportError).toHaveBeenCalledTimes(1);
      expect(reportError).toHaveBeenCalledWith(expect.any(QueryTimeoutError), {
        site: 'broadcasts',
      });
    });

    it('reports a timeout under a name distinct from a fetch TypeError', async () => {
      const reportError = vi.fn();
      const fn = reportingQueryFn({
        fetchFn: hang(),
        fallback: 'fallback',
        logger: makeLogger(),
        reportError,
        isServer: true,
      });
      const result = fn();
      await vi.advanceTimersByTimeAsync(5000);
      await result;

      const [err] = reportError.mock.calls[0];
      expect(err.name).toBe('QueryTimeoutError');
      expect(err.name).not.toBe(new TypeError('fetch failed').name);
    });

    it('reports the timeout even when fetchFn rejects with its own abort error', async () => {
      // `fetch` may reject an aborted request with a generic `AbortError`;
      // the attempt still fails with the timeout error.
      const reportError = vi.fn();
      const fn = reportingQueryFn({
        fetchFn: (signal) =>
          new Promise<string>((_resolve, reject) => {
            signal?.addEventListener('abort', () => {
              reject(new DOMException('aborted', 'AbortError'));
            });
          }),
        fallback: 'fallback',
        logger: makeLogger(),
        reportError,
        isServer: true,
      });
      const result = fn();
      await vi.advanceTimersByTimeAsync(5000);
      await expect(result).resolves.toBe('fallback');
      expect(reportError).toHaveBeenCalledWith(
        expect.any(QueryTimeoutError),
        {}
      );
    });

    it('times out after 5 seconds by default', async () => {
      let settled = false;
      const fn = reportingQueryFn({
        fetchFn: hang(),
        fallback: 'fallback',
        logger: makeLogger(),
        isServer: true,
      });
      const result = fn().finally(() => {
        settled = true;
      });

      await vi.advanceTimersByTimeAsync(4999);
      expect(settled).toBe(false);
      await vi.advanceTimersByTimeAsync(1);
      expect(settled).toBe(true);
      await expect(result).resolves.toBe('fallback');
    });

    it('takes the timeout from the timeoutMs option', async () => {
      const reportError = vi.fn();
      const fn = reportingQueryFn({
        fetchFn: hang(),
        fallback: 'fallback',
        logger: makeLogger(),
        reportError,
        isServer: true,
        timeoutMs: 250,
      });
      const result = fn();
      await vi.advanceTimersByTimeAsync(250);
      await expect(result).resolves.toBe('fallback');
      expect(reportError.mock.calls[0][0]).toMatchObject({ timeoutMs: 250 });
    });

    it('times out the retry of a network failure too', async () => {
      const reportError = vi.fn();
      const fetchFn = hang().mockRejectedValueOnce(connectionReset());
      const fn = reportingQueryFn({
        fetchFn,
        fallback: 'fallback',
        logger: makeLogger(),
        reportError,
        isServer: true,
      });
      const result = fn();
      await vi.advanceTimersByTimeAsync(5000);
      await expect(result).resolves.toBe('fallback');
      expect(fetchFn).toHaveBeenCalledTimes(2);
      expect(reportError).toHaveBeenCalledTimes(1);
      expect(reportError).toHaveBeenCalledWith(
        expect.any(QueryTimeoutError),
        {}
      );
    });

    it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY])(
      'applies no timeout server-side when timeoutMs is %s',
      async (timeoutMs) => {
        const reportError = vi.fn();
        const fn = reportingQueryFn({
          fetchFn: () =>
            new Promise<string>((resolve) => {
              setTimeout(() => resolve('ok'), 60_000);
            }),
          fallback: 'fallback',
          logger: makeLogger(),
          reportError,
          isServer: true,
          timeoutMs,
        });
        const result = fn();
        await vi.advanceTimersByTimeAsync(60_000);
        await expect(result).resolves.toBe('ok');
        expect(reportError).not.toHaveBeenCalled();
      }
    );

    it('still retries a connection failure once with no timeout', async () => {
      const fetchFn = vi
        .fn<(signal?: AbortSignal) => Promise<string>>()
        .mockRejectedValueOnce(connectionReset())
        .mockResolvedValue('ok');
      const fn = reportingQueryFn({
        fetchFn,
        fallback: 'fallback',
        logger: makeLogger(),
        isServer: true,
        timeoutMs: 0,
      });
      await expect(fn()).resolves.toBe('ok');
      expect(fetchFn).toHaveBeenCalledTimes(2);
      expect(vi.getTimerCount()).toBe(0);
    });

    it('gives the retry only the time left, so the call takes timeoutMs at most', async () => {
      // A connection reset late in the first attempt, then a hung retry: the
      // retry must not get a full timeout of its own.
      const reportError = vi.fn();
      const fetchFn = hang().mockImplementationOnce(
        () =>
          new Promise<string>((_resolve, reject) => {
            setTimeout(() => reject(connectionReset()), 3000);
          })
      );
      let settled = false;
      const fn = reportingQueryFn({
        fetchFn,
        fallback: 'fallback',
        logger: makeLogger(),
        reportError,
        isServer: true,
      });
      const result = fn().finally(() => {
        settled = true;
      });

      await vi.advanceTimersByTimeAsync(4999);
      expect(fetchFn).toHaveBeenCalledTimes(2);
      expect(settled).toBe(false);
      await vi.advanceTimersByTimeAsync(1);
      expect(settled).toBe(true);
      await expect(result).resolves.toBe('fallback');
      expect(reportError).toHaveBeenCalledWith(
        expect.any(QueryTimeoutError),
        {}
      );
      expect(fetchFn.mock.calls[1][0]?.aborted).toBe(true);
    });

    it('clears the timer when an attempt settles in time', async () => {
      const fetchFn = vi.fn<(signal?: AbortSignal) => Promise<string>>(
        async () => 'ok'
      );
      const fn = reportingQueryFn({
        fetchFn,
        fallback: 'fallback',
        logger: makeLogger(),
        isServer: true,
      });
      await expect(fn()).resolves.toBe('ok');
      expect(vi.getTimerCount()).toBe(0);
      expect(fetchFn.mock.calls[0][0]?.aborted).toBe(false);
    });

    it('passes fetchFn no signal in the browser', async () => {
      const fetchFn = vi.fn<(signal?: AbortSignal) => Promise<string>>(
        async () => 'ok'
      );
      const fn = reportingQueryFn({
        fetchFn,
        fallback: 'fallback',
        logger: makeLogger(),
        isServer: false,
      });
      await fn();
      expect(fetchFn).toHaveBeenCalledWith();
    });

    it('applies no timeout in the browser', async () => {
      const fn = reportingQueryFn({
        fetchFn: () =>
          new Promise<string>((resolve) => {
            setTimeout(() => resolve('ok'), 60_000);
          }),
        fallback: 'fallback',
        logger: makeLogger(),
        isServer: false,
      });
      const result = fn();
      await vi.advanceTimersByTimeAsync(60_000);
      await expect(result).resolves.toBe('ok');
    });
  });
});
