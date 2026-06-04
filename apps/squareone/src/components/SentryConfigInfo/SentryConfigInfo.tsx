'use client';

import React from 'react';

import { useStaticConfig } from '../../hooks/useStaticConfig';
import styles from './SentryConfigInfo.module.css';
import { getSentryDashboardUrl } from './sentryDashboardUrl';

/**
 * Render a sample rate for display. Sample rates are numbers in [0, 1]; `0` is
 * a meaningful value, so an unset (undefined) rate is shown as "Not set"
 * rather than being coerced to a falsy blank.
 */
function formatSampleRate(rate: number | undefined): string {
  return rate === undefined ? 'Not set' : String(rate);
}

/**
 * Read-only summary of the runtime Sentry configuration for the `/admin/sentry`
 * page.
 *
 * Reads the resolved app config via {@link useStaticConfig} and displays the
 * enabled status (whether a DSN is present), environment name, traces/replay
 * sample rates, and the app base URL. When Sentry is enabled (a DSN is present)
 * and both `sentryOrg` and `sentryProject` are configured it also renders a link
 * to the project's Sentry dashboard; the link is hidden when Sentry is disabled
 * or either slug is unset.
 */
export default function SentryConfigInfo() {
  const config = useStaticConfig();

  const enabled = Boolean(config.sentryDsn);
  const dashboardUrl =
    enabled && config.sentryOrg && config.sentryProject
      ? getSentryDashboardUrl(config.sentryOrg, config.sentryProject)
      : null;

  return (
    <section className={styles.root}>
      <h2>Configuration</h2>
      <dl className={styles.list}>
        <dt className={styles.label}>Status</dt>
        <dd className={styles.value}>{enabled ? 'Enabled' : 'Disabled'}</dd>

        <dt className={styles.label}>Environment</dt>
        <dd className={styles.value}>{config.environmentName}</dd>

        <dt className={styles.label}>Traces sample rate</dt>
        <dd className={styles.value}>
          {formatSampleRate(config.sentryTracesSampleRate)}
        </dd>

        <dt className={styles.label}>Session replay sample rate</dt>
        <dd className={styles.value}>
          {formatSampleRate(config.sentryReplaysSessionSampleRate)}
        </dd>

        <dt className={styles.label}>Error replay sample rate</dt>
        <dd className={styles.value}>
          {formatSampleRate(config.sentryReplaysOnErrorSampleRate)}
        </dd>

        <dt className={styles.label}>Base URL</dt>
        <dd className={styles.value}>{config.baseUrl}</dd>
      </dl>

      {dashboardUrl && (
        <p className={styles.dashboard}>
          <a
            className={styles.link}
            href={dashboardUrl}
            target="_blank"
            rel="noreferrer"
          >
            Open Sentry dashboard
          </a>
        </p>
      )}
    </section>
  );
}
