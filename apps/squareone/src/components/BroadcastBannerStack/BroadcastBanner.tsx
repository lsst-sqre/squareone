import type { Broadcast } from '@lsst-sqre/semaphore-client';
import { Button } from '@lsst-sqre/squared';
import type React from 'react';
import useDisclosure from 'react-a11y-disclosure';

import styles from './BroadcastBanner.module.css';

type BroadcastBannerProps = {
  broadcast?: Broadcast;
};

function getCategoryColor(category: Broadcast['category']): string {
  switch (category) {
    case 'info':
      return 'var(--rsd-color-primary-600)';
    case 'outage':
      return 'var(--rsd-color-red-500)';
    case 'notice':
      return 'var(--rsd-color-orange-500)';
    default:
      return 'var(--rsd-color-gray-500)';
  }
}

/*
 * A broadcast message banner.
 */
export default function BroadcastBanner({ broadcast }: BroadcastBannerProps) {
  const { toggleProps, contentProps, isExpanded } = useDisclosure({
    id: `broadcast-${broadcast?.id}`,
    isExpanded: false,
  });

  // If there isn't any broadcast content, don't show a banner
  if (!broadcast) {
    return null;
  }

  /* eslint-disable react/no-danger */
  /* eslint-disable react/jsx-props-no-spreading */
  return (
    <div
      className={styles.container}
      style={
        {
          '--banner-bg': getCategoryColor(broadcast.category),
        } as React.CSSProperties
      }
    >
      <aside className={styles.aside}>
        <div className={styles.summary}>
          <div
            className="summary-content"
            dangerouslySetInnerHTML={{ __html: broadcast.summary.html }}
          />
          {broadcast.body && (
            <div className={styles.disclosureButtonArea}>
              <Button
                type="button"
                appearance="outline"
                tone="tertiary"
                size="sm"
                {...toggleProps}
              >
                {isExpanded ? 'Show less' : 'Show more'}
              </Button>
            </div>
          )}
        </div>
        {broadcast.body && (
          <div className={styles.disclosure} {...contentProps}>
            <div dangerouslySetInnerHTML={{ __html: broadcast.body.html }} />
          </div>
        )}
      </aside>
    </div>
  );
  /* eslint-enable react/no-danger */
  /* eslint-enable react/jsx-props-no-spreading */
}
