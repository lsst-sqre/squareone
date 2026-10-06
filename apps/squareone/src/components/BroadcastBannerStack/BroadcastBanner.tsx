import type { Broadcast } from '@lsst-sqre/semaphore-client';
import { Button } from '@lsst-sqre/squared';
import type React from 'react';
import useDisclosure from 'react-a11y-disclosure';
import styles from './BroadcastBanner.module.css';
import { broadcastAccessibleName } from './broadcastLabel';

type BroadcastBannerProps = {
  broadcast?: Broadcast;
};

function getCategoryColor(category: Broadcast['category']): string {
  switch (category) {
    case 'info':
      // White banner text sits on this color, so use the accessible teal
      // (>=4.5:1) rather than the raw brand primary-600 (4.14:1 on white).
      return 'var(--rsd-component-interactive-color)';
    case 'outage':
      // White banner text sits on this color, so use red-600 (#ad1919,
      // 7.17:1 on white) rather than red-500 (#ed4c4c, only 3.66:1).
      return 'var(--rsd-color-red-600)';
    case 'notice':
      // White banner text sits on this color, so use orange-600 (#8f4d0a,
      // 6.49:1 on white) rather than orange-500 (#e08d35, only 2.61:1).
      return 'var(--rsd-color-orange-600)';
    default:
      return 'var(--rsd-color-gray-500)';
  }
}

/*
 * A broadcast message banner.
 *
 * The banner intentionally does not carry an ARIA live-region role. Because
 * banners arrive after a client-side fetch, the live-region semantics live on
 * the persistent containers rendered by `BroadcastBannerStack`, which are in
 * the DOM before the fetch resolves so a screen reader announces banners as
 * they are inserted. The named complementary `<aside>` landmark below keeps
 * each banner distinct for landmark navigation.
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

  // Derive a short plain-text accessible name from the Markdown summary so the
  // landmark is not announced with literal Markdown syntax, and does not
  // duplicate the full banner body (also announced by the live region). Fall
  // back to a generic label if the summary reduces to no readable text.
  const accessibleName =
    broadcastAccessibleName(broadcast.summary.gfm) || 'Broadcast message';

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
      <aside className={styles.aside} aria-label={accessibleName}>
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
