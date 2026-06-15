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
 * linked to its docs when available) followed by the dataset description and a
 * list of endpoints. A curated endpoint label links to its IVOA standard doc;
 * an unmapped one renders as plain text. Each endpoint also links to its URL.
 */
export default function ApiEndpointsList({
  groups,
  headingLevel = 3,
}: ApiEndpointsListProps) {
  const Heading = `h${headingLevel}` as `h${HeadingLevel}`;

  return (
    <div className={styles.root}>
      {groups.map((group) => (
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
            <p className={styles.description}>{group.description}</p>
          ) : null}
          <ul className={styles.list}>
            {group.endpoints.map((endpoint) => (
              <li
                key={`${endpoint.label}:${endpoint.url}`}
                className={styles.item}
              >
                {endpoint.ivoaUrl ? (
                  <a className={styles.label} href={endpoint.ivoaUrl}>
                    {endpoint.label}
                  </a>
                ) : (
                  <span className={styles.label}>{endpoint.label}</span>
                )}
                <a className={styles.url} href={endpoint.url}>
                  {endpoint.url}
                </a>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
