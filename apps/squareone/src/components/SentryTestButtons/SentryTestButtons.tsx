'use client';

import { Button } from '@lsst-sqre/squared';
import * as Sentry from '@sentry/nextjs';
import React, { useState } from 'react';
import styles from './SentryTestButtons.module.css';

/**
 * Buttons that exercise the Sentry error-reporting pipeline from the
 * `/admin/sentry` page.
 *
 * - "Throw uncaught error" throws during render (via a state flag) so the App
 *   Router error boundary (`app/error.tsx`) catches it and reports it to
 *   Sentry. Errors thrown directly in an event handler bypass React error
 *   boundaries, so the throw is deferred to the next render instead.
 * - "Capture handled exception" reports a handled exception with
 *   `Sentry.captureException` without interrupting the page.
 * - "Emit server log" POSTs to `/admin/sentry/emit-log`, whose route handler
 *   emits server-side pino warn/error records. The `Sentry.pinoIntegration()`
 *   bridge ships those to Sentry Logs (not issues), so this verifies the
 *   pino→Sentry Logs transport in the server build.
 */
export default function SentryTestButtons() {
  const [shouldThrow, setShouldThrow] = useState(false);
  const [emitLogStatus, setEmitLogStatus] = useState<string | null>(null);

  if (shouldThrow) {
    throw new Error('Sentry Test Error');
  }

  const handleEmitLog = async () => {
    setEmitLogStatus('Emitting…');
    try {
      const response = await fetch('/admin/sentry/emit-log', {
        method: 'POST',
      });
      setEmitLogStatus(
        response.ok
          ? `Emitted server log (HTTP ${response.status})`
          : `Failed to emit server log (HTTP ${response.status})`
      );
    } catch (error) {
      setEmitLogStatus(
        `Failed to emit server log: ${
          error instanceof Error ? error.message : 'unknown error'
        }`
      );
    }
  };

  return (
    <div className={styles.buttons}>
      <Button type="button" tone="danger" onClick={() => setShouldThrow(true)}>
        Throw uncaught error
      </Button>
      <Button
        type="button"
        appearance="outline"
        onClick={() =>
          Sentry.captureException(new Error('Sentry Test Error (handled)'))
        }
      >
        Capture handled exception
      </Button>
      <Button
        type="button"
        appearance="outline"
        onClick={() => {
          void handleEmitLog();
        }}
      >
        Emit server log
      </Button>
      {emitLogStatus && <output>{emitLogStatus}</output>}
    </div>
  );
}
