import type { ServiceDiscovery } from '@lsst-sqre/repertoire-client';

import {
  buildApplicationRows,
  getEnvironmentSummary,
  getOperatorLinks,
} from '../../lib/admin/overview';
import { Lede } from '../Typography';
import styles from './AdminOverview.module.css';
import ApplicationsTable from './ApplicationsTable';
import EnvironmentSection from './EnvironmentSection';
import OperatorLinks from './OperatorLinks';

type AdminOverviewProps = {
  /** The Repertoire service discovery document (3.0 or 2.x shape). */
  discovery: ServiceDiscovery;
  /** The Repertoire URL the discovery document was read from. */
  repertoireUrl: string;
};

/**
 * The `/admin` environment overview, rendered from Repertoire service
 * discovery.
 *
 * Presentational: it takes the discovery document as a prop, so stories and
 * tests can render any environment. Each section is its own component fed by
 * a pure builder in `lib/admin/overview.ts`: the Environment section, the
 * operator links, and the Applications table. New sections (datasets,
 * InfluxDB databases) slot in after these, following the same pattern.
 */
export default function AdminOverview({
  discovery,
  repertoireUrl,
}: AdminOverviewProps) {
  return (
    <div className={styles.overview}>
      <h1>Overview</h1>
      <Lede>
        This Rubin Science Platform environment, as Repertoire service discovery
        describes it.
      </Lede>
      <EnvironmentSection environment={getEnvironmentSummary(discovery)} />
      <OperatorLinks links={getOperatorLinks(discovery, repertoireUrl)} />
      <ApplicationsTable rows={buildApplicationRows(discovery)} />
    </div>
  );
}
