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
import { TimesSquareHtmlEventsContext } from '../TimesSquareHtmlEventsProvider';
import styles from './ExecStats.module.css';

export default function ExecStats() {
  const htmlEvent = React.useContext(TimesSquareHtmlEventsContext);

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
    } catch (err) {
      reportError(err, {
        site: 'times-square-recompute',
        package: 'times-square-client',
      });
    }
  };

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
        <Button
          appearance="outline"
          tone="primary"
          disabled={recomputePending}
          onClick={handleRecompute}
        >
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
        <Button
          appearance="outline"
          tone="primary"
          disabled={recomputePending}
          onClick={handleRecompute}
        >
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

  if (htmlEvent.executionStatus === 'in_progress') {
    return (
      <div className={styles.container}>
        <p>Computing…</p>
      </div>
    );
  }

  return null;
}
