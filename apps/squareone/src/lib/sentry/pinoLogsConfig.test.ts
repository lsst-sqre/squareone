import { describe, expect, test } from 'vitest';

import { pinoLogsIntegrationOptions } from './pinoLogsConfig';

describe('pinoLogsIntegrationOptions', () => {
  test('routes exactly warn, error, and fatal through the Sentry Logs (log) channel', () => {
    // The log channel is what pinoIntegration ships to Sentry Logs via
    // _INTERNAL_captureLog. The bridge is a severity floor at warn, so pin the
    // exact list: shipping lower levels (info/debug/trace) would flood Sentry
    // Logs contrary to the documented design, while omitting `fatal` — the
    // level above error — would silently drop the most severe records.
    expect(pinoLogsIntegrationOptions.log?.levels).toEqual([
      'warn',
      'error',
      'fatal',
    ]);
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
