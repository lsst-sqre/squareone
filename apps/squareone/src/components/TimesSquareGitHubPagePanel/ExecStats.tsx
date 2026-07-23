/*
 * ExecStats provides a summary of the execution status and timing of the
 * notebook execution. It also provides a button to request the recomputation
 * of the already-executed notebook.
 * Updated to handle undefined context gracefully.
 */

import { Button } from '@lsst-sqre/squared';
import { formatDistanceToNow, parseISO } from 'date-fns';
import React from 'react';

import { makeReportError } from '@/lib/sentry/reportError';
import { TimesSquareHtmlEventsContext } from '../TimesSquareHtmlEventsProvider';
import styles from './ExecStats.module.css';

export default function ExecStats() {
  const htmlEvent = React.useContext(TimesSquareHtmlEventsContext);
  const [recomputeFailed, setRecomputeFailed] = React.useState(false);

  // Inject the app's Sentry-backed reporter so a report-worthy recompute
  // failure (5xx, network error) reaches Sentry with site context tags,
  // deduped by the reporter's per-session window.
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

    // The recompute request is no longer fire-and-forget: check the response
    // and surface / report any failure so a failed recompute is visible to the
    // user rather than silently doing nothing.
    setRecomputeFailed(false);
    try {
      const response = await fetch(htmlEvent.htmlUrl, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        setRecomputeFailed(true);
        reportError(
          new Error(
            `Recompute request failed: ${response.status} ${response.statusText}`
          ),
          { site: 'times-square-recompute', package: 'times-square-client' }
        );
      }
    } catch (err) {
      setRecomputeFailed(true);
      reportError(err, {
        site: 'times-square-recompute',
        package: 'times-square-client',
      });
    }
  };

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

  if (htmlEvent.executionStatus === 'in_progress') {
    return (
      <div className={styles.container}>
        <p>Computing…</p>
      </div>
    );
  }

  return null;
}
