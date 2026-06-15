import type { ApiEndpointGroup } from '../../lib/apiEndpoints/types';
import styles from './ApiEndpointsList.module.css';

type ApiEndpointsListProps = {
  /** Endpoint groups to render, one section per group. */
  groups: ApiEndpointGroup[];
};

/**
 * Presentational listing of API endpoints, grouped by dataset.
 *
 * Purely props-driven (no data fetching) so it can be exercised from
 * Storybook and unit tests. Each group renders a heading and a list of its
 * endpoints; each endpoint shows its label alongside a link to its URL.
 */
export default function ApiEndpointsList({ groups }: ApiEndpointsListProps) {
  return (
    <div className={styles.root}>
      {groups.map((group) => (
        <section key={group.datasetKey} className={styles.group}>
          <h2 className={styles.heading}>{group.datasetKey}</h2>
          <ul className={styles.list}>
            {group.endpoints.map((endpoint) => (
              <li
                key={`${endpoint.label}:${endpoint.url}`}
                className={styles.item}
              >
                <span className={styles.label}>{endpoint.label}</span>
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
