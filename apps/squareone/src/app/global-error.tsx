'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect, useRef } from 'react';

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

/**
 * Global error boundary for the App Router.
 *
 * This component catches errors in the root layout and provides a recovery UI.
 * Unlike the regular error.tsx, this handles errors in the root layout itself.
 *
 * It must define its own <html> and <body> tags since the root layout may have
 * failed to render.
 *
 * Errors are automatically reported to Sentry for monitoring.
 */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  // Move focus to the error heading so keyboard and screen reader users are
  // told the page changed to an error state. The heading is made focusable
  // with tabIndex={-1} (programmatic focus only, not a Tab stop).
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <html lang="en">
      <body>
        {/*
         * This boundary replaces the root layout (and its AppShell <main>), so
         * it supplies its own <main> landmark to keep the page's content inside
         * a landmark region.
         */}
        <main
          style={{
            padding: '2rem',
            textAlign: 'center',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <h1 ref={headingRef} tabIndex={-1}>
            Something went wrong!
          </h1>
          <p style={{ color: '#666', marginBottom: '1.5rem' }}>
            An unexpected error occurred. Our team has been notified.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              cursor: 'pointer',
              backgroundColor: '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
