import type { ApiEndpointsResult } from '../../lib/apiEndpoints/types';
import styles from './ApiEndpoints.module.css';
import ApiEndpointsList from './ApiEndpointsList';

type ApiEndpointsProps = {
  /** Resolved outcome of fetching/transforming service discovery. */
  result: ApiEndpointsResult;
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
export default function ApiEndpoints({ result }: ApiEndpointsProps) {
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

  return <ApiEndpointsList groups={result.groups} />;
}
