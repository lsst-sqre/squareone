import { Card, CardGroup } from '@lsst-sqre/squared';
import { Fragment, type ReactNode } from 'react';

import type { DatasetDocsResult } from '../../lib/datasetDocs/types';
import styles from './DatasetDocsCards.module.css';

/** Heading level for each card's dataset name. */
export type HeadingLevel = 2 | 3 | 4 | 5 | 6;

export type DatasetDocsCardsProps = {
  /** Resolved outcome of fetching/transforming service discovery. */
  result: DatasetDocsResult;
  /**
   * Content rendered above the cards, such as the section heading. It renders
   * only when the cards (or the unavailable notice) do, so a section heading
   * placed here is omitted along with the cards.
   */
  children?: ReactNode;
  /**
   * Heading level for each card's dataset name, so the cards can nest under
   * the surrounding MDX heading hierarchy. Defaults to `3` (the cards are
   * typically placed under a `## Data previews` section heading).
   */
  headingLevel?: HeadingLevel;
};

/**
 * Discovery-driven dataset documentation cards for embedding in the `/docs`
 * page MDX via the `compileMdxForRsc` components map.
 *
 * The page resolves discovery server-side and passes the outcome in:
 * - `omitted` (no `repertoireUrl`), or `ok` with no datasets -> render
 *   nothing, not even `children`, so the section is left out;
 * - `unavailable` -> render `children` and a brief notice;
 * - `ok` -> render `children` followed by a squared `CardGroup` with one
 *   `Card` per dataset (its display name and description), in the resolved
 *   order. A card is wrapped in a link to the dataset's `docsUrl` when it has
 *   one, and rendered unlinked otherwise.
 *
 * Purely props-driven (no data fetching), so it renders from Storybook and
 * unit tests.
 */
export default function DatasetDocsCards({
  result,
  children,
  headingLevel = 3,
}: DatasetDocsCardsProps) {
  if (result.status === 'omitted') {
    return null;
  }

  if (result.status === 'unavailable') {
    return (
      <>
        {children}
        <p className={styles.notice}>
          The dataset documentation links are temporarily unavailable.
        </p>
      </>
    );
  }

  if (result.datasets.length === 0) {
    return null;
  }

  const Heading = `h${headingLevel}` as `h${HeadingLevel}`;

  return (
    <>
      {children}
      <CardGroup>
        {result.datasets.map((dataset) => {
          const card = (
            <Card>
              <Heading>{dataset.displayName}</Heading>
              {dataset.description ? <p>{dataset.description}</p> : null}
            </Card>
          );
          return dataset.docsUrl ? (
            <a key={dataset.datasetKey} href={dataset.docsUrl}>
              {card}
            </a>
          ) : (
            <Fragment key={dataset.datasetKey}>{card}</Fragment>
          );
        })}
      </CardGroup>
    </>
  );
}
