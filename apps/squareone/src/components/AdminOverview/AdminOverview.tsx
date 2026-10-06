import type { ServiceDiscovery } from '@lsst-sqre/repertoire-client';

import { getEnvironmentSummary } from '../../lib/admin/overview';
import { Lede } from '../Typography';
import styles from './AdminOverview.module.css';
import EnvironmentSection from './EnvironmentSection';

type AdminOverviewProps = {
  /** The Repertoire service discovery document (3.0 or 2.x shape). */
  discovery: ServiceDiscovery;
};

/**
 * The `/admin` environment overview, rendered from Repertoire service
 * discovery.
 *
 * Presentational: it takes the discovery document as a prop, so stories and
 * tests can render any environment. Each section is its own component fed by
 * a pure builder in `lib/admin/overview.ts`; new sections (operator links,
 * applications, datasets, InfluxDB databases) slot in after the Environment
 * section in page order, following the same pattern.
 */
export default function AdminOverview({ discovery }: AdminOverviewProps) {
  return (
    <div className={styles.overview}>
      <h1>Overview</h1>
      <Lede>
        This Rubin Science Platform environment, as Repertoire service discovery
        describes it.
      </Lede>
      <EnvironmentSection environment={getEnvironmentSummary(discovery)} />
    </div>
  );
}
