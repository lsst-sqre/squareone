'use client';

import * as Sentry from '@sentry/nextjs';
import Link from 'next/link';
import { useEffect } from 'react';

import styles from '../components/MainContent/MainContent.module.css';

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

/**
 * Error boundary for page-level errors in App Router.
 *
 * This component catches errors in page components and nested layouts,
 * providing a user-friendly error message and recovery option.
 *
 * Errors are automatically reported to Sentry for monitoring.
 *
 * Unlike global-error.tsx, this renders within the root layout's HTML
 * structure, so it can use the existing styling and navigation.
 */
export default function ErrorPage({ error, reset }: ErrorProps) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <main className={styles.main}>
      <div
        style={{
          padding: '2rem',
          maxWidth: '600px',
          margin: '0 auto',
          textAlign: 'center',
        }}
      >
        <h1>Something went wrong</h1>
        <p style={{ color: 'var(--sqo-text-muted)', marginBottom: '1.5rem' }}>
          An error occurred while loading this page. Our team has been notified.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              cursor: 'pointer',
              backgroundColor: 'var(--sqo-brand-blue)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
            }}
          >
            Try again
          </button>
          <Link
            href="/"
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              textDecoration: 'none',
              backgroundColor: 'transparent',
              color: 'var(--sqo-brand-blue)',
              border: '1px solid var(--sqo-brand-blue)',
              borderRadius: '4px',
            }}
          >
            Go home
          </Link>
        </div>
      </div>
    </main>
  );
}
