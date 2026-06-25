'use client';

import type { UserNotificationFormatted } from '@lsst-sqre/semaphore-client';
import { Badge } from '@lsst-sqre/squared';
import Link from 'next/link';

import { formatUtcTimestamp } from '../../lib/utils/dateFormatters';
import RenderedMarkdown from '../RenderedMarkdown';
import styles from './UserNotificationDetailView.module.css';

/** Where the "back to notifications" link points by default. */
const DEFAULT_RETURN_HREF = '/notifications';

export type UserNotificationDetailViewProps = {
  /**
   * The notification to display. Omitted while loading, on error, or when the
   * id was not found.
   */
  notification?: UserNotificationFormatted;
  /** Whether the notification is still loading. */
  isLoading?: boolean;
  /**
   * Set when the fetch failed. A 404 (unknown id) is rendered as a graceful
   * not-found state rather than a generic error.
   */
  error?: Error | null;
  /** Where the "Back to notifications" link points. */
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
 * Presentational view of a single user-facing notification.
 *
 * Renders the notification's rendered-Markdown summary and body (the user API's
 * pre-rendered `gfm` field, for visual consistency with the admin UI) plus its
 * metadata (id, created, read status) and a read-status {@link Badge}. Unlike the
 * admin {@link NotificationDetailView}, the user surface omits sender/recipient.
 * It is fully driven by props so it can be exercised from Storybook with
 * fixtures; data fetching lives in the container. An error (including a 404 for
 * an unknown id) renders a graceful not-found / error state with a link back to
 * the inbox.
 */
export default function UserNotificationDetailView({
  notification,
  isLoading = false,
  error = null,
  returnHref = DEFAULT_RETURN_HREF,
}: UserNotificationDetailViewProps) {
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
        <div className={styles.errorState}>
          <h2>
            {notFound ? 'Notification not found' : 'Error loading notification'}
          </h2>
          <p>
            {notFound
              ? 'This notification could not be found. It may have been removed, or the link may be out of date.'
              : error.message}
          </p>
          <p>
            <Link href={returnHref}>&larr; Back to notifications</Link>
          </p>
        </div>
      </div>
    );
  }

  const { id, created, read, summary, body } = notification;
  const isRead = read !== null && read !== undefined;
  const hasBody = !!body && body.gfm.trim() !== '';

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
            <RenderedMarkdown markdown={summary.gfm} />
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
          <RenderedMarkdown markdown={body.gfm} />
        ) : (
          <p className={styles.noBody}>This notification has no body.</p>
        )}
      </section>
    </div>
  );
}
