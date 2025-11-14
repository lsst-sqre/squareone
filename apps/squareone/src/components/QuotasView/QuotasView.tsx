import {
  type GafaelfawrQuota,
  type GafaelfawrTapQuota,
  KeyValueList,
  type KeyValueListItem,
} from '@lsst-sqre/squared';
import React from 'react';
import styles from './QuotasView.module.css';

type QuotasViewProps = {
  quota: GafaelfawrQuota;
};

export default function QuotasView({ quota }: QuotasViewProps) {
  // Check if we have any quota data to display
  const hasNotebookQuota =
    quota.notebook !== null && quota.notebook !== undefined;
  const hasApiQuota = quota.api && Object.keys(quota.api).length > 0;
  const hasTapQuota = quota.tap && Object.keys(quota.tap).length > 0;

  return (
    <div className={styles.container}>
      {/* Notebooks Section */}
      {hasNotebookQuota && (
        <section id="notebook" className={styles.section}>
          <h2 className={styles.sectionTitle}>Notebooks</h2>
          <p className={styles.sectionDescription}>
            Resources available for JupyterLab servers.
          </p>
          <KeyValueList items={getNotebookItems(quota.notebook)} />
        </section>
      )}

      {/* Concurrent Queries Section */}
      {hasTapQuota && (
        <section id="tap" className={styles.section}>
          <h2 className={styles.sectionTitle}>Concurrent queries</h2>
          <p className={styles.sectionDescription}>
            You can have a limited number of in-flight catalog queries. Wait for
            queries to finish before submitting new ones.
          </p>
          <KeyValueList items={getTapItems(quota.tap)} />
        </section>
      )}

      {/* Rate Limits Section */}
      {hasApiQuota && (
        <section id="rate-limit" className={styles.section}>
          <h2 className={styles.sectionTitle}>Rate limits</h2>
          <p className={styles.sectionDescription}>
            APIs limit the number of requests you can make in a 15 minute
            window. Your request count resets every 15 minutes.
          </p>
          <KeyValueList items={getApiItems(quota.api)} />
        </section>
      )}
    </div>
  );
}

/**
 * Convert notebook quota to KeyValueList items
 */
function getNotebookItems(
  notebook: NonNullable<GafaelfawrQuota['notebook']>
): KeyValueListItem[] {
  const items: KeyValueListItem[] = [
    {
      key: 'CPU',
      value: `${notebook.cpu} ${notebook.cpu === 1 ? 'core' : 'cores'}`,
    },
    {
      key: 'Memory',
      value: `${notebook.memory} GB`,
    },
  ];

  // Only show spawn field when it's disabled (false)
  if (notebook.spawn === false) {
    items.push({
      key: 'Spawning',
      value: 'Disabled',
    });
  }

  return items;
}

/**
 * Convert API quota to KeyValueList items
 */
function getApiItems(api: GafaelfawrQuota['api']): KeyValueListItem[] {
  return Object.entries(api)
    .sort(([a], [b]) => a.localeCompare(b)) // Sort alphabetically by service name
    .map(([service, limit]) => ({
      key: service,
      value: `${limit} ${limit === 1 ? 'request' : 'requests'}`,
    }));
}

/**
 * Convert TAP quota to KeyValueList items
 */
function getTapItems(tap: GafaelfawrQuota['tap']): KeyValueListItem[] {
  return Object.entries(tap)
    .sort(([a], [b]) => a.localeCompare(b)) // Sort alphabetically by service name
    .map(([service, quotaObj]: [string, GafaelfawrTapQuota]) => ({
      key: service,
      value: `${quotaObj.concurrent} concurrent ${
        quotaObj.concurrent === 1 ? 'query' : 'queries'
      }`,
    }));
}
