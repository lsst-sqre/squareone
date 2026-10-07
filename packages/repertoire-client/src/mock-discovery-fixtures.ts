import discovery21Data from './__fixtures__/discovery-2.1.0-data.json';
import discovery30DataDev from './__fixtures__/discovery-3.0.0-data-dev.json';
import { DiscoverySchema, type ServiceDiscovery } from './schemas';

/**
 * Live Repertoire `/discovery` responses, parsed through `DiscoverySchema`,
 * for tests and Storybook that need a whole real environment rather than the
 * hand-written {@link mockDiscovery}.
 */

/**
 * The data-dev (`idfdev`) Repertoire 3.0.0 response: the `environment`
 * object, 41 enabled applications, service titles, docs URLs, and scopes
 * (including the Argo CD, Chronograf, and Kafdrop UI services), five datasets,
 * and one local InfluxDB database.
 */
export const mockDiscoveryDataDev: ServiceDiscovery =
  DiscoverySchema.parse(discovery30DataDev);

/**
 * The production (`data.lsst.cloud`) Repertoire 2.1.0 response: only the
 * deprecated `environment_name` (no `environment`), and services without
 * titles, docs URLs, scopes, or quota labels. Use it to exercise the fallbacks
 * for an environment still on Repertoire 2.x.
 */
export const mockDiscovery2x: ServiceDiscovery =
  DiscoverySchema.parse(discovery21Data);
