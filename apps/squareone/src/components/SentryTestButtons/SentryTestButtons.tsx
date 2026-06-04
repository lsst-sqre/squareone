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
 */
export default function SentryTestButtons() {
  const [shouldThrow, setShouldThrow] = useState(false);

  if (shouldThrow) {
    throw new Error('Sentry Test Error');
  }

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
    </div>
  );
}
