import type { ApiEndpointsResult } from '../../lib/apiEndpoints/types';
import styles from './ApiEndpoints.module.css';
import ApiEndpointsList, { type HeadingLevel } from './ApiEndpointsList';

type ApiEndpointsProps = {
  /** Resolved outcome of fetching/transforming service discovery. */
  result: ApiEndpointsResult;
  /**
   * Heading level for the dataset section headings, forwarded to
   * {@link ApiEndpointsList}. MDX authors set this (e.g.
   * `<ApiEndpoints headingLevel={3} />`) to nest the listing under their page's
   * heading hierarchy.
   */
  headingLevel?: HeadingLevel;
};

/**
 * Discovery-bound API endpoint listing for embedding in MDX via the
 * `compileMdxForRsc` components map.
 *
 * The page resolves discovery server-side and passes the outcome in:
 * - `omitted` -> render nothing (the section is left out);
 * - `unavailable` -> render a brief notice;
 * - `ok` -> render the {@link ApiEndpointsList} for the dataset groups.
 */
export default function ApiEndpoints({
  result,
  headingLevel,
}: ApiEndpointsProps) {
  if (result.status === 'omitted') {
    return null;
  }

  if (result.status === 'unavailable') {
    return (
      <p className={styles.notice}>
        The service endpoint listing is temporarily unavailable.
      </p>
    );
  }

  return (
    <ApiEndpointsList groups={result.groups} headingLevel={headingLevel} />
  );
}
