import { ClipboardButton } from '@lsst-sqre/squared';
import { ArrowUpRight, BookOpen } from 'lucide-react';

import type { ApiEndpointGroup } from '../../lib/apiEndpoints/types';
import styles from './ApiEndpointsList.module.css';

/** Heading level for the dataset section headings. */
export type HeadingLevel = 2 | 3 | 4 | 5 | 6;

type ApiEndpointsListProps = {
  /** Endpoint groups to render, one section per group. */
  groups: ApiEndpointGroup[];
  /**
   * Heading level for each dataset section heading, so the listing can nest
   * under the surrounding MDX heading hierarchy. Defaults to `3` (the listing
   * is typically placed under an `## API endpoints` section heading).
   */
  headingLevel?: HeadingLevel;
};

/**
 * Presentational listing of API endpoints, grouped by dataset.
 *
 * Purely props-driven (no data fetching) so it can be exercised from Storybook
 * and unit tests. Each group renders a heading (the dataset display name,
 * linked to its docs when available) followed by the dataset description —
 * suffixed with a "Read the documentation" link to the dataset's documentation
 * site when available — and a list of endpoints. Each endpoint name is always
 * plain text; a curated, IVOA-mapped service additionally shows a book-icon
 * "IVOA doc" link to its standard. Each endpoint URL renders as copyable
 * monospace code text (not a
 * link, since these are programmatic API base URLs) with an icon-only
 * copy-to-clipboard button.
 */
export default function ApiEndpointsList({
  groups,
  headingLevel = 3,
}: ApiEndpointsListProps) {
  const Heading = `h${headingLevel}` as `h${HeadingLevel}`;

  return (
    <div className={styles.root}>
      {groups.map((group) => {
        // Visible "Read the documentation" link to the dataset's docs site,
        // appended to the description. The aria-label names the dataset so the
        // accessible name is unique and meaningful out of context.
        const docsLink = group.docsUrl ? (
          <a
            className={styles.docsLink}
            href={group.docsUrl}
            aria-label={`Read the ${group.displayName} documentation`}
          >
            Read the documentation
            <ArrowUpRight
              className={styles.docsLinkIcon}
              size={16}
              aria-hidden="true"
            />
          </a>
        ) : null;

        return (
          <section key={group.datasetKey} className={styles.group}>
            <Heading className={styles.heading}>
              {group.docsUrl ? (
                <a className={styles.headingLink} href={group.docsUrl}>
                  {group.displayName}
                </a>
              ) : (
                group.displayName
              )}
            </Heading>
            {group.description ? (
              <p className={styles.description}>
                {group.description}
                {docsLink ? <> {docsLink}</> : null}
              </p>
            ) : docsLink ? (
              <p className={styles.description}>{docsLink}</p>
            ) : null}
            <ul className={styles.list}>
              {group.endpoints.map((endpoint) => (
                <li
                  key={`${endpoint.label}:${endpoint.url}`}
                  className={styles.item}
                >
                  <div className={styles.labelCell}>
                    <span className={styles.label}>{endpoint.label}</span>
                    {endpoint.ivoaUrl ? (
                      <a
                        className={styles.ivoaLink}
                        href={endpoint.ivoaUrl}
                        title="IVOA doc"
                        aria-label="IVOA doc"
                      >
                        <BookOpen size={16} aria-hidden="true" />
                      </a>
                    ) : null}
                  </div>
                  <div className={styles.url}>
                    <code className={styles.urlCode}>{endpoint.url}</code>
                    <ClipboardButton
                      text={endpoint.url}
                      label=""
                      successLabel=""
                      ariaLabel={`Copy the ${endpoint.label} endpoint URL to the clipboard`}
                      size="sm"
                      appearance="text"
                      tone="secondary"
                      className={styles.copyButton}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
