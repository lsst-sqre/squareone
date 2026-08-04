/*
 * ExecStats provides a summary of the execution status and timing of the
 * notebook execution. It also provides a button to request the recomputation
 * of the already-executed notebook.
 * Updated to handle undefined context gracefully.
 */

import { Button } from '@lsst-sqre/squared';
import { useRerunPage } from '@lsst-sqre/times-square-client';
import { formatDistanceToNow, parseISO } from 'date-fns';
import React from 'react';

import { makeReportError } from '@/lib/sentry/reportError';
import {
  TimesSquareHtmlEventsContext,
  type TimesSquareHtmlEventsContextValue,
} from '../TimesSquareHtmlEventsProvider';
import styles from './ExecStats.module.css';

/**
 * How long the panel keeps reporting a requested recompute before falling back
 * to the last reported execution.
 *
 * A soft delete schedules a fresh execution, so the events stream normally
 * reports the new run within an event interval or two and supersedes the
 * requested state on its own. This bound only matters if that never happens:
 * without it the panel would claim a computation is running forever, and the
 * Recompute button — the way out — would never come back.
 */
const RECOMPUTE_WAIT_TIMEOUT_MS = 30_000;

/**
 * How often the panel re-renders so its relative timestamps stay current.
 *
 * `formatDistanceToNow` is evaluated at render time, so "Computed less than a
 * minute ago" only advances when something re-renders the panel. Until the
 * events stream started closing on a terminal event, its heartbeat did that as
 * a side effect; now nothing does, and the phrasing would stay frozen for as
 * long as the page is open. 30 s keeps it within one step of the truth without
 * a per-second render.
 */
const RELATIVE_TIME_REFRESH_MS = 30_000;

/** Re-render on a slow tick so rendered relative times keep advancing. */
function useRelativeTimeRefresh(): void {
  const [, setTick] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(
      () => setTick((tick) => tick + 1),
      RELATIVE_TIME_REFRESH_MS
    );
    return () => clearInterval(timer);
  }, []);
}

/**
 * Fingerprint the execution an events payload describes.
 *
 * A recompute is confirmed by the *next* execution the server reports, not by
 * the soft delete's own response: until the new run is registered the stream
 * keeps describing the run that is being replaced. Comparing this fingerprint
 * against the one captured at request time detects that hand-off whichever way
 * it arrives — a queued/in-progress run, a new finish time, or a new rendering.
 */
function executionSignature(
  htmlEvent: TimesSquareHtmlEventsContextValue
): string {
  return [
    htmlEvent.executionStatus,
    htmlEvent.dateFinished,
    htmlEvent.htmlHash,
    htmlEvent.executionError?.code,
  ].join('|');
}

export default function ExecStats() {
  const htmlEvent = React.useContext(TimesSquareHtmlEventsContext);

  useRelativeTimeRefresh();

  // The recompute goes through the package's shared soft-delete mutation, so
  // this path and the execution-error re-run path stay on one transport (and
  // one cache-invalidation policy). The by-URL call shape needs no service
  // discovery, so the hook takes no repertoire URL here.
  const {
    rerunPageAsync,
    isError: recomputeFailed,
    isPending: recomputePending,
  } = useRerunPage();

  // Inject the app's Sentry-backed reporter so a report-worthy recompute
  // failure (5xx, network error) reaches Sentry with site context tags,
  // deduped by the reporter's per-session window. The mutation hook is
  // deliberately Sentry-agnostic, so reporting stays here at the call site.
  const reportError = React.useMemo(
    () => makeReportError({ isServer: false }),
    []
  );

  // Execution fingerprint captured when a recompute was accepted, or null when
  // no recompute is awaiting confirmation from the events stream.
  const [requestedSignature, setRequestedSignature] = React.useState<
    string | null
  >(null);

  const signature = htmlEvent ? executionSignature(htmlEvent) : null;

  // The events stream still describes the run being replaced, so the recompute
  // has yet to be confirmed.
  const awaitingRecompute =
    requestedSignature !== null && requestedSignature === signature;

  React.useEffect(() => {
    if (requestedSignature === null) {
      return undefined;
    }

    // A differing fingerprint means the server has picked the recompute up, so
    // its own reporting drives the panel from here. Dropping the captured
    // fingerprint also keeps a later payload that happens to look identical
    // (the dev mocks settle back to a fixed completed run) from reviving the
    // requested state.
    if (requestedSignature !== signature) {
      setRequestedSignature(null);
      return undefined;
    }

    const timer = setTimeout(
      () => setRequestedSignature(null),
      RECOMPUTE_WAIT_TIMEOUT_MS
    );
    return () => clearTimeout(timer);
  }, [requestedSignature, signature]);

  // Return null if context is not available yet
  if (!htmlEvent) {
    return null;
  }

  const handleRecompute = async (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();

    if (!htmlEvent.htmlUrl) {
      return;
    }

    // The recompute request is not fire-and-forget: the mutation rejects on a
    // non-ok response or a network error, and the rejection is surfaced to the
    // user (via the mutation's own error state) and reported to Sentry. A new
    // attempt resets that state, so a successful retry clears the message.
    try {
      await rerunPageAsync({ htmlUrl: htmlEvent.htmlUrl });
      setRequestedSignature(executionSignature(htmlEvent));
    } catch (err) {
      reportError(err, {
        site: 'times-square-recompute',
        package: 'times-square-client',
      });
    }
  };

  // A computation the user asked for is reported from the click onwards: while
  // the soft delete is in flight, then until the events stream reports the run
  // it scheduled. Without this the panel kept summarizing the previous run, so
  // a click produced no visible response until the next execution was reported
  // — several seconds later, on a page whose HTML is still the old rendering.
  // Server-reported queued and in-progress runs share the state, so a recompute
  // reads as one continuous computation, and a queued run — which the panel
  // used to render as nothing at all — is reported too.
  const isComputing =
    recomputePending ||
    awaitingRecompute ||
    htmlEvent.executionStatus === 'queued' ||
    htmlEvent.executionStatus === 'in_progress';

  if (isComputing) {
    return (
      <div className={styles.container}>
        {/* biome-ignore lint/a11y/useSemanticElements: <output> is for form calculation results, not a status message about a background notebook execution */}
        <p className={styles.content} role="status">
          Computing…
        </p>
      </div>
    );
  }

  // A failed run reports `execution_status: 'complete'` with a non-null
  // `execution_error`, so the failure is checked before the completed branch —
  // otherwise the panel would claim the notebook was computed successfully.
  // Like the viewer's failure panel, this renders the API's own `title` and
  // authors no per-code copy of its own. The Recompute button stays: it is the
  // recovery path out of the failed state.
  if (htmlEvent.executionError) {
    return (
      <div className={styles.container}>
        <p className={styles.failure}>{htmlEvent.executionError.title}</p>
        {/* A failed run may settle without a finish time; the timestamp line
            is dropped rather than rendered empty. Duration is meaningless for
            a run that never produced a result, so it is omitted either way. */}
        {htmlEvent.dateFinished && (
          <p className={styles.content}>
            Failed{' '}
            <time
              dateTime={htmlEvent.dateFinished}
              title={htmlEvent.dateFinished}
            >
              {formatDistanceToNow(parseISO(htmlEvent.dateFinished), {
                addSuffix: true,
              })}
            </time>
            .
          </p>
        )}
        <Button appearance="outline" tone="primary" onClick={handleRecompute}>
          Recompute
        </Button>
        {recomputeFailed && (
          <p className={styles.error} role="alert">
            Failed to request a recompute. Please try again.
          </p>
        )}
      </div>
    );
  }

  if (htmlEvent.executionStatus === 'complete') {
    if (!htmlEvent.dateFinished) {
      return null;
    }

    const dateFinished = parseISO(htmlEvent.dateFinished);
    const formattedDuration = Number(htmlEvent.executionDuration).toFixed(1);
    return (
      <div className={styles.container}>
        <p className={styles.content}>
          Computed{' '}
          <time
            dateTime={htmlEvent.dateFinished}
            title={htmlEvent.dateFinished}
          >
            {formatDistanceToNow(dateFinished, { addSuffix: true })}
          </time>{' '}
          in {formattedDuration} seconds.
        </p>
        <Button appearance="outline" tone="primary" onClick={handleRecompute}>
          Recompute
        </Button>
        {recomputeFailed && (
          <p className={styles.error} role="alert">
            Failed to request a recompute. Please try again.
          </p>
        )}
      </div>
    );
  }

  return null;
}
