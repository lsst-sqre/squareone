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

import type { ReportContext, ReportError } from '@lsst-sqre/api-client-core';
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
 * Build a stable dedupe key from a report context. Falls back to a constant so
 * a context-free report still dedupes against itself.
 */
function dedupeKey(context: ReportContext): string {
  const keys = Object.keys(context).sort();
  if (keys.length === 0) {
    return '__default__';
  }
  return keys.map((k) => `${k}=${String(context[k])}`).join('&');
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
 * within the runtime-appropriate dedupe window.
 *
 * @param options - Runtime hints; see {@link MakeReportErrorOptions}.
 * @returns A `reportError(err, context)` hook to inject into `reportingQueryFn`.
 */
export function makeReportError(
  options: MakeReportErrorOptions = {}
): ReportError {
  const isServer = options.isServer ?? detectIsServer();

  return (err: unknown, context: ReportContext = {}): void => {
    const key = dedupeKey(context);
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

    Sentry.captureException(err, { tags });
  };
}
