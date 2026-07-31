// In-memory dev store for mocked Times Square notebook-execution state.
//
// Backs the dev mocks of the Times Square page HTML endpoints
// (`/times-square/api/v1/pages/:page/{html,htmlstatus,htmlevents}`) so the
// failure → error panel → re-run → loading flow is exercisable end-to-end
// without a live Times Square.
//
// Which state a page instance reports is driven by the dev mocks' existing
// `?a=` magic-parameter convention (see `resolveExecutionState`). It is
// colocated with the rest of the dev tooling so it never reaches the
// production build.

import type { ExecutionError } from '@lsst-sqre/times-square-client';

/** Magic `?a=` value that reports a still-executing page instance. */
export const PENDING_A_VALUE = '2';

/** Magic `?a=` value that reports a terminally failed page instance. */
export const FAILING_A_VALUE = '3';

/** Mocked execution state of a page instance. */
export type MockExecutionState = 'complete' | 'in_progress' | 'failed';

/**
 * The terminal failure reported for {@link FAILING_A_VALUE}.
 *
 * Mirrors a realistic Times Square `execution_error`: `code` is one of the
 * documented values and `title`/`message` are the API's own user-facing copy,
 * which Squareone renders verbatim.
 */
export const mockExecutionError: ExecutionError = {
  code: 'timeout',
  title: 'Notebook execution timed out',
  message:
    'The notebook did not finish executing within the allowed time. Try again, or simplify the notebook so it completes faster.',
};

/**
 * How long a re-run request keeps a page instance in the executing state.
 *
 * Long enough to watch the viewer's loading state and polling resume, short
 * enough that the instance settles back to its `?a=`-driven outcome without a
 * wait.
 */
export const RERUN_WINDOW_MS = 15_000;

/** Expiry timestamps of in-flight mock re-runs, keyed by page instance. */
const rerunExpiries = new Map<string, number>();

function instanceKey(page: string, a: string): string {
  return `${page}?a=${a}`;
}

/**
 * Record a re-run request (soft delete) for a page instance.
 *
 * Mirrors Times Square: the soft delete clears the cached rendering — including
 * a cached `execution_error` — and schedules a fresh execution, so the instance
 * reports as executing until {@link RERUN_WINDOW_MS} elapses.
 */
export function recordRerun(page: string, a: string): void {
  rerunExpiries.set(instanceKey(page, a), Date.now() + RERUN_WINDOW_MS);
}

/** Forget all recorded re-runs (used by tests). */
export function resetTimesSquareReruns(): void {
  rerunExpiries.clear();
}

/** Whether a page instance is inside its re-run window. */
function isRerunning(page: string, a: string): boolean {
  const expiry = rerunExpiries.get(instanceKey(page, a));
  if (expiry === undefined) {
    return false;
  }
  if (Date.now() >= expiry) {
    rerunExpiries.delete(instanceKey(page, a));
    return false;
  }
  return true;
}

/**
 * Resolve the mocked execution state of a page instance.
 *
 * A recorded re-run wins over the `?a=` value until its window elapses, after
 * which the instance settles back to the outcome its magic value describes.
 *
 * @param page - Page name/slug
 * @param a - Value of the `a` notebook parameter (the dev mocks' magic knob)
 */
export function resolveExecutionState(
  page: string,
  a: string
): MockExecutionState {
  if (isRerunning(page, a)) {
    return 'in_progress';
  }
  if (a === PENDING_A_VALUE) {
    return 'in_progress';
  }
  if (a === FAILING_A_VALUE) {
    return 'failed';
  }
  return 'complete';
}
