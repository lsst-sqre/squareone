import { RepertoireError } from '@lsst-sqre/repertoire-client';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

// Mock the Sentry SDK so the capture path can be asserted without a real
// Sentry client being initialized.
vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
}));

import * as Sentry from '@sentry/nextjs';
import { __resetReportErrorDedupe } from './reportError';
import { reportPrefetchError } from './reportPrefetchError';

const captureException = vi.mocked(Sentry.captureException);

describe('reportPrefetchError', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    __resetReportErrorDedupe();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('reports a 5xx RepertoireError with the call-site context', () => {
    const err = new RepertoireError('boom', 503);

    reportPrefetchError(err, { site: 'broadcasts-prefetch' });

    expect(captureException).toHaveBeenCalledTimes(1);
    const [captured, hint] = captureException.mock.calls[0];
    expect(captured).toBe(err);
    expect(hint).toMatchObject({ tags: { site: 'broadcasts-prefetch' } });
  });

  test('reports a server-side network failure (no status code)', () => {
    reportPrefetchError(new TypeError('fetch failed'), {
      site: 'broadcasts-prefetch',
    });

    expect(captureException).toHaveBeenCalledTimes(1);
  });

  test('stays quiet on an expected auth failure (403)', () => {
    reportPrefetchError(new RepertoireError('forbidden', 403), {
      site: 'broadcasts-prefetch',
    });

    expect(captureException).not.toHaveBeenCalled();
  });
});
