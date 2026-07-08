'use client';

import type { UserNotification } from '@lsst-sqre/semaphore-client';
import { Badge, Note } from '@lsst-sqre/squared';
import Link from 'next/link';

import { formatUtcTimestamp } from '../../lib/utils/dateFormatters';
import RenderedMarkdown from '../RenderedMarkdown';
import styles from './NotificationDetailView.module.css';

/** Where the "back to listing" links point by default. */
const DEFAULT_RETURN_HREF = '/admin/notifications';

export type NotificationDetailViewProps = {
  /**
   * The notification to display. Omitted while loading, on error, or when the
   * id was not found.
   */
  notification?: UserNotification;
  /** Whether the notification is still loading. */
  isLoading?: boolean;
  /**
   * Set when the fetch failed. A 404 (unknown id) is rendered as a graceful
   * not-found state rather than a generic error.
   */
  error?: Error | null;
  /** Where the "Return to notifications" link points. */
  returnHref?: string;
};

/**
 * True when the error represents an unknown-id (404) response, whether it is a
 * `SemaphoreError` (carrying a numeric `statusCode`) or a plain `Error` whose
 * message mentions 404.
 */
function isNotFoundError(error: Error): boolean {
  const statusCode = (error as { statusCode?: number }).statusCode;
  if (typeof statusCode === 'number') {
    return statusCode === 404;
  }
  return /\b404\b/.test(error.message ?? '');
}

/**
 * Presentational view of a single admin notification.
 *
 * Renders the notification's rendered-Markdown summary and body plus its full
 * metadata (id, recipient, sender, created, read status). It is fully driven by
 * props so it can be exercised from Storybook with fixtures; data fetching lives
 * in the container. An error (including a 404 for an unknown id) renders a
 * graceful not-found / error state with a link back to the listing.
 */
export default function NotificationDetailView({
  notification,
  isLoading = false,
  error = null,
  returnHref = DEFAULT_RETURN_HREF,
}: NotificationDetailViewProps) {
  if (isLoading) {
    return (
      <div className={styles.container}>
        <p className={styles.loadingState}>Loading notification…</p>
      </div>
    );
  }

  // A 404, any other fetch error, or simply no data (without an error) all
  // resolve to the graceful not-found / error state so a stale link never
  // dead-ends on a blank page.
  if (error || !notification) {
    const notFound = !error || isNotFoundError(error);
    return (
      <div className={styles.container}>
        <Note type="warning">
          <h2 className={styles.errorHeading}>
            {notFound ? 'Notification not found' : 'Error loading notification'}
          </h2>
          <p>
            {notFound
              ? 'This notification could not be found. It may have been removed, or the link may be out of date.'
              : error.message}
          </p>
          <p>
            <Link href={returnHref}>Return to notifications</Link>
          </p>
        </Note>
      </div>
    );
  }

  const { id, recipient, sender, created, read, summary, body } = notification;
  const isRead = read !== null && read !== undefined;
  const hasBody = !!body && body.trim() !== '';

  return (
    <div className={styles.container}>
      <p className={styles.backLink}>
        <Link href={returnHref}>&larr; Back to notifications</Link>
      </p>

      <div className={styles.metadataCard}>
        <div className={styles.metadataHeader}>
          {/* The summary is the page's primary title, so it carries h1
           * semantics. RenderedMarkdown emits a block <div>/<p>, which a
           * literal <h1> may not legally contain, so an ARIA heading is the
           * only valid way to expose it as the h1. */}
          {/* biome-ignore lint/a11y/useSemanticElements: an <h1> may not contain the block <div>/<p> RenderedMarkdown emits */}
          <div className={styles.summary} role="heading" aria-level={1}>
            <RenderedMarkdown markdown={summary} />
          </div>
          <Badge
            variant="soft"
            color={isRead ? 'gray' : 'blue'}
            radius="full"
            size="sm"
          >
            {isRead ? 'Read' : 'Unread'}
          </Badge>
        </div>

        <dl className={styles.metadataGrid}>
          <div className={styles.metadataRow}>
            <dt className={styles.metadataLabel}>ID</dt>
            <dd className={styles.metadataValue}>
              <code className={styles.id}>{id}</code>
            </dd>
          </div>

          <div className={styles.metadataRow}>
            <dt className={styles.metadataLabel}>Recipient</dt>
            <dd className={styles.metadataValue}>{recipient}</dd>
          </div>

          <div className={styles.metadataRow}>
            <dt className={styles.metadataLabel}>Sender</dt>
            <dd className={styles.metadataValue}>{sender}</dd>
          </div>

          <div className={styles.metadataRow}>
            <dt className={styles.metadataLabel}>Created</dt>
            <dd className={styles.metadataValue}>
              <time dateTime={created}>{formatUtcTimestamp(created)}</time>
            </dd>
          </div>

          <div className={styles.metadataRow}>
            <dt className={styles.metadataLabel}>Read</dt>
            <dd className={styles.metadataValue}>
              {isRead ? (
                <time dateTime={read}>{formatUtcTimestamp(read)}</time>
              ) : (
                <span className={styles.muted}>&mdash;</span>
              )}
            </dd>
          </div>
        </dl>
      </div>

      <section className={styles.bodySection}>
        <h2 className={styles.bodyHeading}>Message body</h2>
        {hasBody ? (
          <RenderedMarkdown markdown={body} />
        ) : (
          <p className={styles.noBody}>This notification has no body.</p>
        )}
      </section>
    </div>
  );
}
