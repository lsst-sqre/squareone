import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

// Mock the Sentry SDK so the capture path can be asserted without a real
// Sentry client being initialized.
vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
}));

import * as Sentry from '@sentry/nextjs';
import { __resetReportErrorDedupe, makeReportError } from './reportError';

const captureException = vi.mocked(Sentry.captureException);

describe('reportError', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    __resetReportErrorDedupe();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('captures the exception with site/package context tags', () => {
    const reportError = makeReportError({ isServer: false });
    const err = new Error('report-worthy');

    reportError(err, { site: 'broadcasts', package: 'semaphore-client' });

    expect(captureException).toHaveBeenCalledTimes(1);
    const [captured, hint] = captureException.mock.calls[0];
    expect(captured).toBe(err);
    // Tags carrying the call-site context reach Sentry.
    expect(hint).toMatchObject({
      tags: { site: 'broadcasts', package: 'semaphore-client' },
    });
  });

  test('client-side: dedupes to at most one capture per session', () => {
    const reportError = makeReportError({ isServer: false });
    const context = { site: 'broadcasts', package: 'semaphore-client' };

    // Sustained failure under polling: many calls, same call site.
    for (let i = 0; i < 10; i++) {
      reportError(new Error('report-worthy'), context);
    }

    expect(captureException).toHaveBeenCalledTimes(1);
  });

  test('server-side: dedupes to one capture per ~15-minute window', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
    const reportError = makeReportError({ isServer: true });
    const context = { site: 'broadcasts', package: 'semaphore-client' };

    reportError(new Error('report-worthy'), context);
    // A minute later (well inside the window) — suppressed.
    vi.advanceTimersByTime(60_000);
    reportError(new Error('report-worthy'), context);
    expect(captureException).toHaveBeenCalledTimes(1);

    // Past the 15-minute window — captured again.
    vi.advanceTimersByTime(15 * 60_000);
    reportError(new Error('report-worthy'), context);
    expect(captureException).toHaveBeenCalledTimes(2);
  });

  test('distinct call sites dedupe independently', () => {
    const reportError = makeReportError({ isServer: false });

    reportError(new Error('report-worthy'), { site: 'broadcasts' });
    reportError(new Error('report-worthy'), { site: 'discovery' });

    expect(captureException).toHaveBeenCalledTimes(2);
  });
});
