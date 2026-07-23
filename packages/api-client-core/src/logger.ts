/**
 * Minimal logger interface compatible with pino's calling convention.
 *
 * This is the single source of truth for the `Logger` type shared across the
 * Rubin Science Platform API client packages (gafaelfawr / repertoire /
 * semaphore / times-square). Those packages re-export this type for backward
 * compatibility.
 *
 * Each method takes a structured-context object followed by a message string,
 * matching pino's `log.error({ err }, 'message')` signature. A browser console
 * fallback is provided by {@link defaultLogger}.
 */
export type Logger = {
  debug: (obj: Record<string, unknown>, msg: string) => void;
  warn: (obj: Record<string, unknown>, msg: string) => void;
  error: (obj: Record<string, unknown>, msg: string) => void;
};

/**
 * A console-backed {@link Logger} used when no logger is injected.
 *
 * Maps `debug`/`warn`/`error` onto the corresponding `console` methods,
 * preserving the `(obj, msg)` argument order by logging the message first and
 * the structured object second.
 */
export const defaultLogger: Logger = {
  debug: (obj, msg) => console.log(msg, obj),
  warn: (obj, msg) => console.warn(msg, obj),
  error: (obj, msg) => console.error(msg, obj),
};
