/**
 * Log Node process warnings (such as `MaxListenersExceededWarning` or a
 * `DeprecationWarning`) through pino, so they reach Sentry Logs as well as
 * the pod's stderr.
 *
 * Node prints each process warning to stderr from its own `warning` listener;
 * this module adds a second listener, so the pino record is additive and the
 * stderr line is unchanged. The record is a pino `warn`, which the Sentry pino
 * bridge ships to Sentry Logs but never turns into an issue or an alert (see
 * src/lib/sentry/pinoLogsConfig.ts).
 */

import type { Logger } from 'pino';

let uninstallCurrent: (() => void) | undefined;

/**
 * Log every process warning as a pino `warn` record carrying the warning as
 * `err` (so the record includes its stack), plus `warningName` and
 * `warningCode` fields for searching. The message is the warning's message.
 *
 * Installing is idempotent: while an installation is active, a further call
 * registers nothing and returns the active installation's uninstall function.
 * Uninstalling (used by tests) removes the listener.
 *
 * @returns A function that removes the listener.
 */
export function installProcessWarningLogger(
  logger: Pick<Logger, 'warn'>
): () => void {
  if (uninstallCurrent) return uninstallCurrent;

  const onWarning = (warning: unknown) => {
    // Node emits warnings as Error objects, but any code can emit `warning`
    // with an arbitrary value, and a throw here would crash the process.
    // Object() boxes primitives and turns null and undefined into {}, so
    // reading the fields never throws.
    const { name, code, message } = Object(warning) as Partial<
      Error & { code: string }
    >;
    logger.warn(
      { err: warning, warningName: name, warningCode: code },
      typeof message === 'string' ? message : String(warning)
    );
  };
  process.on('warning', onWarning);

  const uninstall = () => {
    process.off('warning', onWarning);
    if (uninstallCurrent === uninstall) uninstallCurrent = undefined;
  };
  uninstallCurrent = uninstall;
  return uninstall;
}
