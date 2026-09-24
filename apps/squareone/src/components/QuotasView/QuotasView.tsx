import type { NotebookQuota, Quota } from '@lsst-sqre/gafaelfawr-client';
import type { QuotaLabelIndex } from '@lsst-sqre/repertoire-client';
import { KeyValueList, type KeyValueListItem } from '@lsst-sqre/squared';
import { BookOpen } from 'lucide-react';

import {
  type ApiQuotaItem,
  buildApiQuotaItems,
} from '../../lib/quotas/apiQuotaItems';
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
  const apiItems = buildApiQuotaItems(quota.api, quotaLabelIndex).map(
    toKeyValueListItem
  );
  const hasApiQuota = apiItems.length > 0;
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
 * Render an API rate-limit row, with an icon link to the service's
 * documentation after the limit when discovery provides one.
 */
function toKeyValueListItem(item: ApiQuotaItem): KeyValueListItem {
  if (!item.docsUrl) {
    return { key: item.key, value: item.value };
  }
  const docsLabel = item.docsLabel ?? undefined;
  return {
    key: item.key,
    value: (
      <span className={styles.rateLimit}>
        {item.value}
        <a
          className={styles.docsLink}
          href={item.docsUrl}
          title={docsLabel}
          aria-label={docsLabel}
        >
          <BookOpen size={16} aria-hidden="true" />
        </a>
      </span>
    ),
  };
}

/**
 * Convert TAP quota to KeyValueList items
 */
function getTapItems(tap: Quota['tap']): KeyValueListItem[] {
  if (!tap) return [];
  return Object.entries(tap)
    .sort(([a], [b]) => a.localeCompare(b)) // Sort alphabetically by service name
    .map(([service, quotaObj]) => ({
      key: service,
      value: `${quotaObj.concurrent} concurrent ${
        quotaObj.concurrent === 1 ? 'query' : 'queries'
      }`,
    }));
}
