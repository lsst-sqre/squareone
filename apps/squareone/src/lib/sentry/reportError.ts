// App-side `reportError` implementation injected into the shared
// `reportingQueryFn` (from `@lsst-sqre/api-client-core`).
//
// It calls `Sentry.captureException` with the call-site context forwarded as
// Sentry tags, guarded by an in-memory dedupe window so that 60 s query polling
// cannot flood Sentry during a sustained outage:
//
//   - Client-side: at most once per call site per browser session (the dedupe
//     key never expires within the page's lifetime).
//   - Server-side: at most once per call site per ~15-minute window, so a
//     long-running server process re-reports periodically rather than staying
//     silent forever.
//
// The package that owns `reportingQueryFn` stays Sentry-agnostic; this module
// is where the Sentry SDK dependency lives.

import {
  QueryTimeoutError,
  type ReportContext,
  type ReportError,
} from '@lsst-sqre/api-client-core';
import * as Sentry from '@sentry/nextjs';

/** Server-side dedupe window: re-report a given call site at most this often. */
export const SERVER_DEDUPE_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

/**
 * In-memory dedupe state, keyed by a stable string derived from the report
 * context. Client-side the value is unused (presence alone suppresses); server-
 * side it stores the last-capture timestamp so the window can expire.
 */
const lastReportedAt = new Map<string, number>();

/**
 * Reset the dedupe state. Exported for tests only; there is no need to call
 * this in production code.
 */
export function __resetReportErrorDedupe(): void {
  lastReportedAt.clear();
}

/**
 * Identify an error for deduplication purposes. Uses the error's class name
 * (e.g. `ZodError`, `SemaphoreError`) so distinct failure modes are told apart;
 * falls back to the primitive type for non-`Error` throwables.
 */
function errorIdentity(err: unknown): string {
  return err instanceof Error ? err.name : typeof err;
}

/**
 * Build a stable dedupe key from an error and its report context. The context
 * (site/package tags) identifies the call site; the error's class name is
 * folded in so that distinct failure modes at the same site each capture once
 * per window rather than the first error masking later, different ones (e.g. a
 * transient 503 masking a later ZodError from contract drift). Falls back to a
 * constant context component so a context-free report still dedupes against
 * itself.
 */
function dedupeKey(err: unknown, context: ReportContext): string {
  const keys = Object.keys(context).sort();
  const contextKey =
    keys.length === 0
      ? '__default__'
      : keys.map((k) => `${k}=${String(context[k])}`).join('&');
  return `${errorIdentity(err)}|${contextKey}`;
}

/**
 * A Sentry fingerprint for an error, or undefined to keep Sentry's default
 * grouping.
 *
 * A {@link QueryTimeoutError} has a fixed message and a stack that is only
 * the timer that fired, so by default every upstream's timeouts would group
 * into one Sentry issue. Fingerprinting it by the call site's `site` tag gives
 * each upstream (service discovery, broadcasts, user info, …) an issue of its
 * own. Other errors keep the default grouping, whose stack traces already
 * tell their call sites apart.
 */
function fingerprintFor(
  err: unknown,
  context: ReportContext
): string[] | undefined {
  if (err instanceof QueryTimeoutError && context.site !== undefined) {
    return ['QueryTimeoutError', String(context.site)];
  }
  return undefined;
}

/** Options controlling {@link makeReportError}'s runtime-dependent behavior. */
export type MakeReportErrorOptions = {
  /**
   * Whether the reporter runs server-side. Server-side uses a time-boxed dedupe
   * window; client-side dedupes once per session. Defaults to detecting the
   * absence of a `window` global.
   */
  isServer?: boolean;
};

/** Detect a server (Node) runtime by the absence of the `window` global. */
function detectIsServer(): boolean {
  return typeof window === 'undefined';
}

/**
 * Create a {@link ReportError} that captures report-worthy errors to Sentry,
 * tagging each event with the call-site context and suppressing duplicates
 * within the runtime-appropriate dedupe window. A timeout is fingerprinted by
 * its `site`, so each upstream's timeouts form their own Sentry issue.
 *
 * @param options - Runtime hints; see {@link MakeReportErrorOptions}.
 * @returns A `reportError(err, context)` hook to inject into `reportingQueryFn`.
 */
export function makeReportError(
  options: MakeReportErrorOptions = {}
): ReportError {
  const isServer = options.isServer ?? detectIsServer();

  return (err: unknown, context: ReportContext = {}): void => {
    const key = dedupeKey(err, context);
    const now = Date.now();
    const previous = lastReportedAt.get(key);

    if (previous !== undefined) {
      // Client-side: any prior capture for this key suppresses forever (session
      // dedupe). Server-side: suppress only while inside the window.
      if (!isServer || now - previous < SERVER_DEDUPE_WINDOW_MS) {
        return;
      }
    }

    lastReportedAt.set(key, now);

    // Forward the call-site context as Sentry tags so events are filterable by
    // site/package in the Sentry UI. Tag values must be primitives.
    const tags: Record<string, string> = {};
    for (const [k, v] of Object.entries(context)) {
      tags[k] = String(v);
    }

    const fingerprint = fingerprintFor(err, context);
    Sentry.captureException(
      err,
      fingerprint === undefined ? { tags } : { tags, fingerprint }
    );
  };
}
