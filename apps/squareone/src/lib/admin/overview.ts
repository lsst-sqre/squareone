/**
 * Pure builders for the `/admin` environment overview.
 *
 * Each overview section is a presentational component in
 * `components/AdminOverview` fed by one function here, so everything the page
 * derives from Repertoire service discovery is unit-testable without React.
 * Builders accept both the Repertoire 3.0 shape and the older 2.x shape, which
 * lacks the `environment` object and the service titles, docs URLs, and
 * scopes.
 */

import type { ServiceDiscovery } from '@lsst-sqre/repertoire-client';

import { serviceDisplayName } from '../discovery/serviceDisplayName';

/** What the overview's Environment section shows about the environment. */
export type EnvironmentSummary = {
  /**
   * Human-readable name, often the hostname (Repertoire's `environment.name`,
   * or the deprecated `environment_name` under Repertoire 2.x).
   */
  name: string;
  /** Phalanx environment name, such as `idfdev`. */
  label: string | null;
  /** Short human-readable title. */
  title: string | null;
  /** Full human-readable title (may equal `title`). */
  titleLong: string | null;
  description: string | null;
  /** URL of the environment's documentation (its Phalanx page). */
  docsUrl: string | null;
};

/**
 * Summarizes the environment that discovery describes.
 *
 * Repertoire 3.0 publishes an `environment` object, which provides every
 * field. Repertoire 2.x publishes only `environment_name`, which becomes a
 * name-only summary with the other fields `null`. Returns `null` when
 * discovery names no environment at all.
 */
export function getEnvironmentSummary(
  discovery: ServiceDiscovery
): EnvironmentSummary | null {
  const { environment } = discovery;
  if (environment) {
    return {
      name: environment.name,
      label: environment.label,
      title: environment.title,
      titleLong: environment.title_long,
      description: environment.description?.trim() || null,
      docsUrl: environment.docs_url,
    };
  }

  if (discovery.environment_name) {
    return {
      name: discovery.environment_name,
      label: null,
      title: null,
      titleLong: null,
      description: null,
      docsUrl: null,
    };
  }

  return null;
}

/**
 * Whether discovery carries nothing to show.
 *
 * A failed discovery fetch resolves to the empty discovery rather than an
 * error (see `discoveryQueryOptions`), so the overview treats an empty
 * document as a failure to load.
 */
export function isEmptyDiscovery(discovery: ServiceDiscovery): boolean {
  return (
    !discovery.environment &&
    !discovery.environment_name &&
    discovery.applications.length === 0 &&
    Object.keys(discovery.datasets).length === 0 &&
    Object.keys(discovery.influxdb_databases).length === 0 &&
    Object.keys(discovery.services.ui).length === 0 &&
    Object.keys(discovery.services.internal).length === 0
  );
}

/** One card in the overview's Operator links section. */
export type OperatorLink = {
  /**
   * Stable key: the UI service name for an operator tool, or
   * `environment-docs` or `discovery`.
   */
  id: string;
  /** Link text: the service's discovery title, else a fixed name. */
  label: string;
  /** What the link leads to. */
  description: string;
  /** An absolute URL, or a Squareone path such as `/admin/discovery`. */
  url: string;
  /** Secondary link to the tool's own documentation, when discovery has one. */
  docsUrl: string | null;
};

/**
 * The operator tools the overview links to, in display order, keyed by their
 * `services.ui` name. `name` labels a service whose discovery entry has no
 * title (every service under Repertoire 2.x).
 */
const OPERATOR_SERVICES = [
  {
    service: 'argocd',
    name: 'Argo CD',
    description: "Deploy and sync this environment's Phalanx applications.",
  },
  {
    service: 'chronograf',
    name: 'Chronograf',
    description: "Explore and chart metrics in this environment's InfluxDB.",
  },
  {
    service: 'kafdrop',
    name: 'Kafdrop',
    description: "Browse this environment's Kafka topics and messages.",
  },
] as const;

/**
 * The URL of Repertoire's raw `/discovery` document, built the same way the
 * discovery client builds the URL it fetches.
 */
export function getDiscoveryEndpointUrl(repertoireUrl: string): string {
  return `${repertoireUrl.replace(/\/+$/, '')}/discovery`;
}

/** Path of the admin page that shows the formatted discovery document. */
export const DISCOVERY_PAGE_PATH = '/admin/discovery';

/**
 * Links for the overview's Operator links section.
 *
 * Argo CD, Chronograf, and Kafdrop each appear only when discovery lists them
 * as UI services, followed by the environment's Phalanx documentation (when
 * discovery describes the environment) and the admin page that shows the
 * discovery document this overview is built from. The links are not filtered
 * by the viewer's scopes: the admin section is already restricted to
 * administrators.
 */
export function getOperatorLinks(discovery: ServiceDiscovery): OperatorLink[] {
  const links: OperatorLink[] = [];

  for (const { service, name, description } of OPERATOR_SERVICES) {
    const uiService = discovery.services.ui[service];
    if (uiService) {
      links.push({
        id: service,
        label: uiService.title || name,
        description,
        url: uiService.url,
        docsUrl: uiService.docs_url ?? null,
      });
    }
  }

  if (discovery.environment) {
    links.push({
      id: 'environment-docs',
      label: 'Environment documentation',
      description: "This environment's page in the Phalanx documentation.",
      url: discovery.environment.docs_url,
      docsUrl: null,
    });
  }

  links.push({
    id: 'discovery',
    label: 'Service discovery',
    description: 'The Repertoire discovery document behind this overview.',
    url: DISCOVERY_PAGE_PATH,
    docsUrl: null,
  });

  return links;
}

/** Base URL of the Phalanx documentation's per-application pages. */
export const PHALANX_APPLICATION_DOCS_BASE =
  'https://phalanx.lsst.io/applications';

/** One entry in the overview's Applications list. */
export type ApplicationLink = {
  /** Phalanx application name. */
  name: string;
  /** URL of the application's page in the Phalanx documentation. */
  docsUrl: string;
};

/**
 * Links for the overview's Applications list: one per enabled Phalanx
 * application, in discovery order, to its page in the Phalanx documentation.
 *
 * Discovery's `applications` is a flat list of names that is independent of
 * its `services` maps, so nothing here joins an application to a service.
 */
export function buildApplicationLinks(
  discovery: ServiceDiscovery
): ApplicationLink[] {
  return discovery.applications.map((name) => ({
    name,
    docsUrl: `${PHALANX_APPLICATION_DOCS_BASE}/${encodeURIComponent(name)}/`,
  }));
}

/**
 * Whether a discovered service is a browser UI (`services.ui`) or an API
 * (`services.internal`).
 */
export type ServiceKind = 'UI' | 'API';

/** One row of the overview's Services table. */
export type ServiceRow = {
  /**
   * Stable key, `<kind>:<name>`, since a UI service and an API service may
   * share a name.
   */
  id: string;
  kind: ServiceKind;
  /** The service's key in `services.ui` or `services.internal`. */
  name: string;
  /**
   * The service's discovery title, or `null` when it has none (as under
   * Repertoire 2.x) or the title is blank.
   */
  title: string | null;
  url: string;
  /** Gafaelfawr scopes the service requires (all of them), without repeats. */
  requiredScopes: string[];
  /** URL of the service's documentation. */
  docsUrl: string | null;
  /** URL of an API's OpenAPI specification; always `null` for a UI. */
  openapiUrl: string | null;
};

/** The fields every discovered service carries, whatever its kind. */
type DiscoveredService = ServiceDiscovery['services']['ui'][string];

/** The Services table row for one discovered service. */
function buildServiceRow(
  kind: ServiceKind,
  name: string,
  service: DiscoveredService,
  openapiUrl: string | null
): ServiceRow {
  return {
    id: `${kind}:${name}`,
    kind,
    name,
    title: serviceDisplayName(service.title, '') || null,
    url: service.url,
    requiredScopes: [...new Set(service.required_scopes)],
    docsUrl: service.docs_url ?? null,
    openapiUrl,
  };
}

/**
 * Rows for the overview's Services table: one per UI service, then one per
 * internal (API) service, each in discovery order.
 *
 * The services maps are a namespace of their own, independent of discovery's
 * `applications` list, so a row is a service as discovery publishes it and
 * nothing here joins a service to an application.
 */
export function buildServiceRows(discovery: ServiceDiscovery): ServiceRow[] {
  const { ui, internal } = discovery.services;
  return [
    ...Object.entries(ui).map(([name, service]) =>
      buildServiceRow('UI', name, service, null)
    ),
    ...Object.entries(internal).map(([name, service]) =>
      buildServiceRow('API', name, service, service.openapi ?? null)
    ),
  ];
}

/**
 * The rows whose service name or title contains `query`, ignoring case and
 * surrounding whitespace. A blank query keeps every row.
 */
export function filterServiceRows(
  rows: ServiceRow[],
  query: string
): ServiceRow[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return rows;
  return rows.filter(
    (row) =>
      row.name.toLowerCase().includes(needle) ||
      (row.title?.toLowerCase().includes(needle) ?? false)
  );
}

/** One row of the overview's Datasets table. */
export type DatasetRow = {
  /** The dataset's key in discovery, such as `dp1`. */
  name: string;
  description: string | null;
  /** URL of the dataset's documentation. */
  docsUrl: string | null;
  /** URL of the dataset's Butler repository configuration. */
  butlerConfigUrl: string | null;
  /**
   * URL of the dataset's ObsCore exporter configuration (Repertoire 3.0 and
   * later).
   */
  obscoreConfigUrl: string | null;
  /** Names of the data services the dataset exposes, alphabetically. */
  services: string[];
};

/**
 * Rows for the overview's Datasets table: one per dataset, in discovery
 * order.
 *
 * Absent optional fields, and a blank description, are `null`. Service names
 * are sorted so the same service sits in the same place in every row.
 */
export function buildDatasetRows(discovery: ServiceDiscovery): DatasetRow[] {
  return Object.entries(discovery.datasets).map(([name, dataset]) => ({
    name,
    description: dataset.description?.trim() || null,
    docsUrl: dataset.docs_url ?? null,
    butlerConfigUrl: dataset.butler_config ?? null,
    obscoreConfigUrl: dataset.obscore_config ?? null,
    services: Object.keys(dataset.services).sort(),
  }));
}

/** One row of the overview's InfluxDB databases table. */
export type InfluxRow = {
  /** The database's key in discovery, such as `idfdev_efd`. */
  name: string;
  /** Name of the database within the InfluxDB server. */
  database: string;
  /** URL of the InfluxDB server. */
  url: string;
  /** Whether the database is local to this Phalanx environment. */
  local: boolean;
  /** URL of the Kafka schema registry for the database's measurements. */
  schemaRegistryUrl: string;
  /**
   * URL from which an authenticated client fetches the database's
   * credentials. The overview shows it but never fetches it.
   */
  credentialsUrl: string;
};

/**
 * Rows for the overview's InfluxDB databases table: one per database, in
 * discovery order.
 */
export function buildInfluxRows(discovery: ServiceDiscovery): InfluxRow[] {
  return Object.entries(discovery.influxdb_databases).map(([name, influx]) => ({
    name,
    database: influx.database,
    url: influx.url,
    local: influx.local,
    schemaRegistryUrl: influx.schema_registry,
    credentialsUrl: influx.credentials_url,
  }));
}
