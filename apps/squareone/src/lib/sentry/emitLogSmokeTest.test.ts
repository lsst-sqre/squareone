import { describe, expect, test } from 'vitest';

import {
  EMIT_LOG_PATH,
  isEmitLogDelivery,
  SMOKE_TEST_LEVELS,
  SMOKE_TEST_MARKER,
} from './emitLogSmokeTest';

describe('emit-log smoke-test contract', () => {
  test('pins the levels the smoke test attempts to emit', () => {
    // The route filters this list through pino's level gate and the readout
    // subtracts the result from it to name the gated levels, so both sides
    // would silently agree on a shorter list if it changed here.
    expect(SMOKE_TEST_LEVELS).toEqual(['warn', 'error']);
  });

  test('pins the marker operators search Sentry Logs for', () => {
    // Every consumer imports this constant, so they can never disagree with
    // each other about its value — only with the operators, runbooks and saved
    // Sentry searches that type it by hand. This literal is the only place that
    // disagreement can surface, so renaming the marker has to fail here.
    expect(SMOKE_TEST_MARKER).toBe('sentry-logs-smoke-test');
  });

  test('pins the route path the smoke-test button POSTs to', () => {
    // The path is a filesystem fact (`app/admin/sentry/emit-log/route.ts`) that
    // no import can enforce: moving the route directory without editing this
    // constant leaves the button POSTing into a 404.
    expect(EMIT_LOG_PATH).toBe('/admin/sentry/emit-log');
  });

  test('recognizes every delivery outcome the route can report', () => {
    expect(isEmitLogDelivery('delivered')).toBe(true);
    expect(isEmitLogDelivery('flush-timeout')).toBe(true);
    expect(isEmitLogDelivery('sentry-disabled')).toBe(true);
  });

  test('rejects a body field that is not a delivery outcome', () => {
    // The readout falls back to a bare HTTP report for these, rather than
    // inventing a delivery verdict from a response that is not the route's.
    expect(isEmitLogDelivery('ok')).toBe(false);
    expect(isEmitLogDelivery(undefined)).toBe(false);
    expect(isEmitLogDelivery(true)).toBe(false);
  });
});
