import type { NotebookQuota, Quota } from '@lsst-sqre/gafaelfawr-client';
import type { QuotaLabelIndex } from '@lsst-sqre/repertoire-client';
import { KeyValueList, type KeyValueListItem } from '@lsst-sqre/squared';
import { useMemo } from 'react';

import {
  type ApiQuotaItem,
  buildApiQuotaItems,
} from '../../lib/quotas/apiQuotaItems';
import { buildDiskQuotaItems } from '../../lib/quotas/diskQuotaItems';
import {
  buildConcurrentQueryItems,
  buildDataScannedItems,
} from '../../lib/quotas/tapQuotaItems';
import DocsIconLink from '../DocsIconLink';
import styles from './QuotasView.module.css';

type QuotasViewProps = {
  /** The user's quotas from Gafaelfawr. */
  quota: Quota;
  /**
   * Quota labels declared by service discovery, used to label the rate limits
   * with the services they apply to. Without it (discovery disabled or a
   * Repertoire 2.x environment) the raw Gafaelfawr quota labels are shown.
   */
  quotaLabelIndex?: QuotaLabelIndex;
};

export default function QuotasView({
  quota,
  quotaLabelIndex,
}: QuotasViewProps) {
  // Check if we have any quota data to display
  const hasNotebookQuota =
    quota.notebook !== null && quota.notebook !== undefined;
  const apiItems = useMemo(
    () =>
      buildApiQuotaItems(quota.api, quotaLabelIndex).map(toKeyValueListItem),
    [quota.api, quotaLabelIndex]
  );
  const hasApiQuota = apiItems.length > 0;
  const diskItems = useMemo(
    () => buildDiskQuotaItems(quota.disk),
    [quota.disk]
  );
  const hasDiskQuota = diskItems.length > 0;
  const concurrentQueryItems = useMemo(
    () => buildConcurrentQueryItems(quota.tap),
    [quota.tap]
  );
  const hasTapQuota = concurrentQueryItems.length > 0;
  const dataScannedItems = useMemo(
    () => buildDataScannedItems(quota.tap),
    [quota.tap]
  );
  const hasDataScannedQuota = dataScannedItems.length > 0;

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

      {/* Storage Section */}
      {hasDiskQuota && (
        <section id="storage" className={styles.section}>
          <h2 className={styles.sectionTitle}>Storage</h2>
          <p className={styles.sectionDescription}>
            Storage quota for individual filesystem mounts.
          </p>
          <KeyValueList className={styles.mountPoints} items={diskItems} />
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
          <KeyValueList items={concurrentQueryItems} />
        </section>
      )}

      {/* Data Scanned Section */}
      {hasDataScannedQuota && (
        <section id="data-scanned" className={styles.section}>
          <h2 className={styles.sectionTitle}>Data scanned</h2>
          <p className={styles.sectionDescription}>
            These services limit the total amount of data that can be scanned to
            produce your query results within a 24-hour period.
          </p>
          <KeyValueList items={dataScannedItems} />
        </section>
      )}

      {/* Rate Limits Section */}
      {hasApiQuota && (
        <section id="rate-limit" className={styles.section}>
          <h2 className={styles.sectionTitle}>Rate limits</h2>
          <p className={styles.sectionDescription}>
            APIs limit the number of requests you can make in a 60 second
            window. Your request count resets every minute.
          </p>
          <KeyValueList className={styles.rateLimits} items={apiItems} />
        </section>
      )}
    </div>
  );
}

/**
 * Convert notebook quota to KeyValueList items
 */
function getNotebookItems(notebook: NotebookQuota): KeyValueListItem[] {
  const items: KeyValueListItem[] = [
    {
      key: 'CPU',
      value: `${notebook.cpu} ${notebook.cpu === 1 ? 'core' : 'cores'}`,
    },
    {
      // Gafaelfawr's notebook memory quota is in GiB.
      key: 'Memory',
      value: `${notebook.memory} GiB`,
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
 * Render an API rate-limit row, with an icon link to the service's
 * documentation after the limit when discovery provides one.
 */
function toKeyValueListItem({
  key,
  value,
  docs,
}: ApiQuotaItem): KeyValueListItem {
  if (!docs) {
    return { key, value };
  }
  return {
    key,
    value: (
      <span className={styles.rateLimit}>
        {value}
        <DocsIconLink href={docs.url} label={docs.label} />
      </span>
    ),
  };
}
