import { describe, expect, test } from 'vitest';

import { isEmitLogDelivery, SMOKE_TEST_LEVELS } from './emitLogSmokeTest';

describe('emit-log smoke-test contract', () => {
  test('pins the levels the smoke test attempts to emit', () => {
    // The route filters this list through pino's level gate and the readout
    // subtracts the result from it to name the gated levels, so both sides
    // would silently agree on a shorter list if it changed here.
    expect(SMOKE_TEST_LEVELS).toEqual(['warn', 'error']);
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
