import { describe, expect, test } from 'vitest';

import { pinoLogsIntegrationOptions } from './pinoLogsConfig';

describe('pinoLogsIntegrationOptions', () => {
  test('routes exactly warn and error through the Sentry Logs (log) channel', () => {
    // The log channel is what pinoIntegration ships to Sentry Logs via
    // _INTERNAL_captureLog. The bridge is scoped to warn/error only, so pin the
    // exact list: shipping lower levels (info/debug/trace) would flood Sentry
    // Logs contrary to the documented design.
    expect(pinoLogsIntegrationOptions.log?.levels).toEqual(['warn', 'error']);
  });

  test('never routes any level through the error (issue-creating) channel', () => {
    // pinoIntegration's error channel calls captureException/captureMessage,
    // which creates Sentry issues and can fire Slack alerts. The bridge must
    // stay strictly on the Logs channel: reportError remains the sole alerting
    // path, so there is no double-capture. An empty error.levels list is the
    // load-bearing invariant here.
    expect(pinoLogsIntegrationOptions.error?.levels).toEqual([]);
  });
});
