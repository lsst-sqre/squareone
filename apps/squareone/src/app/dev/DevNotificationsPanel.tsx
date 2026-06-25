'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useId, useState } from 'react';

import styles from './DevNotificationsPanel.module.css';

type CountResponse = { count: number };

/**
 * Dev-only control for the mocked unread-notification count.
 *
 * Lets a developer set how many unread notifications the mocked Semaphore user
 * endpoint reports, so the header user-menu unread badge (driven by
 * `useUnreadNotificationCount`) can be exercised without a live Semaphore. The
 * badge only renders when the `enableUserNotifications` feature flag is on.
 *
 * Reads the current count from `GET /api/dev/notifications-count` on mount and
 * writes back via `POST` on apply. After applying it invalidates the
 * unread-count query so the open Header reflects the new count without a manual
 * reload (the badge otherwise refreshes on its background poll / window focus).
 *
 * It is only imported by the dev-only `/dev` route, so it is tree-shaken from
 * production builds.
 */
export default function DevNotificationsPanel() {
  const queryClient = useQueryClient();
  const inputId = useId();

  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  // Populate the control from the current dev state on mount.
  useEffect(() => {
    let cancelled = false;
    fetch('/api/dev/notifications-count')
      .then((response) => response.json() as Promise<CountResponse>)
      .then((data) => {
        if (!cancelled) setCount(data.count);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleApply = async () => {
    setApplying(true);
    setApplied(false);
    try {
      await fetch('/api/dev/notifications-count', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count }),
      });
      // Refresh the header badge without a manual reload. The query key is
      // ['unread-notification-count', semaphoreUrl]; a prefix match invalidates
      // it regardless of the resolved Semaphore URL.
      await queryClient.invalidateQueries({
        queryKey: ['unread-notification-count'],
      });
      setApplied(true);
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.panel}>
        <p className={styles.muted}>Loading notifications state…</p>
      </div>
    );
  }

  return (
    <div className={styles.panel}>
      <header>
        <h1 className={styles.heading}>Dev notifications control panel</h1>
        <p className={styles.muted}>
          Set how many unread notifications the mocked Semaphore endpoint
          reports. The header unread badge shows this count when the{' '}
          <code>enableUserNotifications</code> feature flag is enabled.
        </p>
      </header>

      <section className={styles.section}>
        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor={inputId}>
            Unread notifications
          </label>
          <input
            id={inputId}
            className={styles.input}
            type="number"
            min={0}
            step={1}
            value={count}
            onChange={(event) => {
              setApplied(false);
              const next = Number.parseInt(event.target.value, 10);
              setCount(Number.isNaN(next) ? 0 : Math.max(0, next));
            }}
          />
        </div>
      </section>

      <div className={styles.applyRow}>
        <button
          type="button"
          className={styles.applyButton}
          onClick={handleApply}
          disabled={applying}
        >
          {applying ? 'Applying…' : 'Apply'}
        </button>
        {applied && <span className={styles.applied}>Applied ✓</span>}
      </div>
    </div>
  );
}
