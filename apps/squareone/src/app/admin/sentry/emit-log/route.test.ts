import { beforeEach, describe, expect, test, vi } from 'vitest';

// Mock the route logger so we can assert warn/error are emitted without a real
// pino/Sentry pipeline running. This is the same server-side logger the
// pinoIntegration bridge instruments, so exercising it here is what verifies
// the transport in the server build.
const { warn, error, isLevelEnabled } = vi.hoisted(() => ({
  warn: vi.fn(),
  error: vi.fn(),
  isLevelEnabled: vi.fn((_level: string) => true),
}));
vi.mock('@/lib/logger', () => ({
  createRouteLogger: () => ({ warn, error, isLevelEnabled }),
}));

// The route flushes the Sentry log buffer before responding; mock the SDK so we
// can assert on that without a transport.
const { flush } = vi.hoisted(() => ({
  flush: vi.fn(async () => true),
}));
vi.mock('@sentry/nextjs', () => ({
  flush,
}));

import { POST } from './route';

describe('POST /admin/sentry/emit-log', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isLevelEnabled.mockReturnValue(true);
    flush.mockImplementation(async () => true);
  });

  test('emits a server-side pino warn and error record', async () => {
    const response = await POST();

    expect(warn).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body).toMatchObject({ emitted: ['warn', 'error'] });
  });

  test('awaits the Sentry flush before responding', async () => {
    let releaseFlush: (() => void) | undefined;
    flush.mockImplementation(
      () =>
        new Promise<boolean>((resolve) => {
          releaseFlush = () => resolve(true);
        })
    );

    let settled = false;
    const pending = POST().then((response) => {
      settled = true;
      return response;
    });

    // Yield to the microtask queue: the handler must still be waiting on flush.
    await Promise.resolve();
    await Promise.resolve();
    expect(settled).toBe(false);

    releaseFlush?.();
    const response = await pending;

    expect(flush).toHaveBeenCalledWith(2000);
    expect(response.status).toBe(200);
  });

  test('omits levels the logger has gated out of the emitted list', async () => {
    // e.g. LOG_LEVEL=error noops log.warn at construction time.
    isLevelEnabled.mockImplementation((level: string) => level === 'error');

    const response = await POST();
    const body = await response.json();

    expect(body).toMatchObject({ emitted: ['error'] });
  });
});
