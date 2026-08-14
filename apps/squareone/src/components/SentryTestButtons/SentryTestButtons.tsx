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
 *   pino→Sentry Logs transport in the server build. The button is held in
 *   `loading` state while the POST is in flight so concurrent requests can't
 *   race each other's status updates.
 */
export default function SentryTestButtons() {
  const [shouldThrow, setShouldThrow] = useState(false);
  const [emitLogStatus, setEmitLogStatus] = useState<string | null>(null);
  const [isEmittingLog, setIsEmittingLog] = useState(false);

  if (shouldThrow) {
    throw new Error('Sentry Test Error');
  }

  const handleEmitLog = async () => {
    setIsEmittingLog(true);
    setEmitLogStatus('Emitting…');
    try {
      const response = await fetch('/admin/sentry/emit-log', {
        method: 'POST',
        // Without this header the /admin ingress (loginRedirect: true) turns an
        // expired session's 401 into a 302 toward CILogon, which fetch follows
        // cross-origin and fails as an opaque CORS error. Gafaelfawr answers
        // XHR-flagged requests with a direct 403 instead, so the status shown
        // below reflects the real auth failure rather than a phantom transport
        // failure on the page meant to diagnose transport.
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
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
    } finally {
      setIsEmittingLog(false);
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
        loading={isEmittingLog}
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
