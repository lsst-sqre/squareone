'use client';

import { Button } from '@lsst-sqre/squared';
import * as Sentry from '@sentry/nextjs';
import React, { useState } from 'react';
import styles from './SentryTestButtons.module.css';

/**
 * Status of the most recent "Emit server log" attempt.
 *
 * The tone is a styling hook: it lets the readout paint a delivered log
 * differently from a failed one, so the two outcomes are not visually
 * identical.
 */
type EmitLogStatus = {
  message: string;
  tone: 'pending' | 'success' | 'failure';
};

/**
 * Read the smoke-test marker out of an emit-log response body.
 *
 * The route stamps the same marker onto every pino record it emits, so echoing
 * it back gives the operator an exact search term for the Sentry Logs UI. A
 * body that isn't the expected JSON must not turn a delivered log into a
 * reported failure, so anything unparseable yields `null` and the caller falls
 * back to the bare HTTP confirmation.
 */
async function readSmokeTestMarker(response: Response): Promise<string | null> {
  try {
    const body: unknown = await response.json();
    if (body !== null && typeof body === 'object' && 'marker' in body) {
      const { marker } = body as { marker: unknown };
      return typeof marker === 'string' ? marker : null;
    }
  } catch {
    // Not JSON (or a truncated body) — fall through to the null result.
  }
  return null;
}

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
 *
 * The outcome of the "Emit server log" round trip is reported in a status
 * readout that is always mounted (see the `<output>` below), so assistive tech
 * observes the live region before its first message rather than at the same
 * moment.
 */
export default function SentryTestButtons() {
  const [shouldThrow, setShouldThrow] = useState(false);
  const [emitLogStatus, setEmitLogStatus] = useState<EmitLogStatus | null>(
    null
  );
  const [isEmittingLog, setIsEmittingLog] = useState(false);

  if (shouldThrow) {
    throw new Error('Sentry Test Error');
  }

  const handleEmitLog = async () => {
    setIsEmittingLog(true);
    setEmitLogStatus({ message: 'Emitting…', tone: 'pending' });
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
      if (!response.ok) {
        setEmitLogStatus({
          message: `Failed to emit server log (HTTP ${response.status})`,
          tone: 'failure',
        });
        return;
      }
      const marker = await readSmokeTestMarker(response);
      setEmitLogStatus({
        message: marker
          ? `Emitted server log (HTTP ${response.status}). Search Sentry Logs for “${marker}”.`
          : `Emitted server log (HTTP ${response.status})`,
        tone: 'success',
      });
    } catch (error) {
      setEmitLogStatus({
        message: `Failed to emit server log: ${
          error instanceof Error ? error.message : 'unknown error'
        }`,
        tone: 'failure',
      });
    } finally {
      setIsEmittingLog(false);
    }
  };

  return (
    <div className={styles.root}>
      <div className={styles.buttons}>
        <Button
          type="button"
          tone="danger"
          onClick={() => setShouldThrow(true)}
        >
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
      </div>
      {/* Mounted unconditionally (and empty until there is something to say)
          so the live region exists before its first message, and kept outside
          the button row so it lays out as its own block rather than stretching
          as a flex sibling of the buttons. */}
      <output
        className={styles.status}
        data-tone={emitLogStatus?.tone ?? 'idle'}
        aria-live="polite"
        aria-atomic="true"
      >
        {emitLogStatus?.message}
      </output>
    </div>
  );
}
