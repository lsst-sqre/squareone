import { beforeEach, describe, expect, test, vi } from 'vitest';

import {
  EMIT_LOG_PATH,
  SMOKE_TEST_MARKER,
} from '@/lib/sentry/emitLogSmokeTest';

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

// The route flushes the Sentry log buffer before responding, and only after
// checking that Sentry can receive at all; mock the SDK so both can be asserted
// without a transport.
const { flush, isEnabled } = vi.hoisted(() => ({
  flush: vi.fn(async () => true),
  isEnabled: vi.fn(() => true),
}));
vi.mock('@sentry/nextjs', () => ({
  flush,
  isEnabled,
}));

import { POST } from './route';

describe(`POST ${EMIT_LOG_PATH}`, () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isLevelEnabled.mockReturnValue(true);
    flush.mockImplementation(async () => true);
    isEnabled.mockReturnValue(true);
  });

  test('emits a server-side pino warn and error record', async () => {
    const response = await POST();

    expect(warn).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(200);

    const body = await response.json();
    // The marker is asserted here because it is the only field a consumer
    // cannot derive: the readout quotes it back as the Sentry Logs search term
    // for records that never become issues, and every other test in this repo
    // supplies its own fixture copy.
    expect(body).toMatchObject({
      delivery: 'delivered',
      emitted: ['warn', 'error'],
      marker: SMOKE_TEST_MARKER,
    });
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

  test('reports a flush timeout rather than claiming delivery', async () => {
    // `Client.flush` resolves `false` when the timeout expires (it never
    // rejects, and transport send errors are swallowed inside the SDK), so an
    // unreachable Sentry ingest — the exact failure this smoke test exists to
    // detect — looks identical to a success unless the boolean is inspected.
    flush.mockImplementation(async () => false);

    const response = await POST();

    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({ delivery: 'flush-timeout' });
  });

  test('reports Sentry as disabled when the SDK has no transport', async () => {
    // With no DSN configured `Client.flush` short-circuits on `if (!transport)
    // { return true; }`, so a flush boolean alone would claim delivery to a
    // Sentry that can never receive anything.
    isEnabled.mockReturnValue(false);

    const response = await POST();

    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({
      delivery: 'sentry-disabled',
    });
    // There is no transport to drain, so the request should not spend the
    // flush timeout finding that out.
    expect(flush).not.toHaveBeenCalled();
  });

  test('omits levels the logger has gated out of the emitted list', async () => {
    // e.g. LOG_LEVEL=error noops log.warn at construction time.
    isLevelEnabled.mockImplementation((level: string) => level === 'error');

    const response = await POST();
    const body = await response.json();

    expect(body).toMatchObject({
      emitted: ['error'],
      marker: SMOKE_TEST_MARKER,
    });
  });
});
