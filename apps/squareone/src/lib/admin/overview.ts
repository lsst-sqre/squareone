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

/**
 * Links for the overview's Operator links section.
 *
 * Argo CD, Chronograf, and Kafdrop each appear only when discovery lists them
 * as UI services, followed by the environment's Phalanx documentation (when
 * discovery describes the environment) and the raw discovery document this
 * overview is built from. The links are not filtered by the viewer's scopes:
 * the admin section is already restricted to administrators.
 */
export function getOperatorLinks(
  discovery: ServiceDiscovery,
  repertoireUrl: string
): OperatorLink[] {
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
    description: 'The raw Repertoire discovery document behind this overview.',
    url: getDiscoveryEndpointUrl(repertoireUrl),
    docsUrl: null,
  });

  return links;
}

/** Whether an application offers a UI, an API, or both. */
export type ApplicationKind = 'UI' | 'API' | 'UI + API';

/** A service an application row is joined to, and where it lives. */
export type ApplicationServiceUrl = {
  /** `UI` for a `services.ui` entry, `API` for a `services.internal` one. */
  kind: 'UI' | 'API';
  /** The service's name in discovery, which may differ from the application. */
  service: string;
  url: string;
};

/** One row of the overview's Applications table. */
export type ApplicationRow = {
  /** Phalanx application name. */
  name: string;
  /** The UI service's title, else the internal service's title. */
  title: string | null;
  /** `null` when the application matches no service. */
  kind: ApplicationKind | null;
  /** The UI service's URL, then the internal service's. */
  urls: ApplicationServiceUrl[];
  /** The UI service's docs URL, else the internal service's. */
  docsUrl: string | null;
  /** Every scope either service requires, each listed once. */
  requiredScopes: string[];
  /** The internal service's OpenAPI specification. */
  openapiUrl: string | null;
};

/**
 * Services an application publishes under a name other than its own, beyond
 * the service named for the application itself.
 *
 * Repertoire keys `services.ui` and `services.internal` by service name, which
 * usually matches the Phalanx application name; these are the known
 * exceptions. This map is the only place that knows them.
 */
const APPLICATION_SERVICE_ALIASES: Readonly<Record<string, readonly string[]>> =
  {
    nublado: ['nublado-controller'],
    datalinker: ['datalink'],
    'vo-cutouts': ['cutout'],
  };

/**
 * The first entry in `services` named for the application or one of its
 * aliases, with the name it was found under.
 */
function findApplicationService<T>(
  services: Record<string, T>,
  application: string
): [name: string, service: T] | null {
  // Own-property checks, so an application or service named like an Object
  // property (`constructor`) never matches the prototype.
  const aliases = Object.hasOwn(APPLICATION_SERVICE_ALIASES, application)
    ? APPLICATION_SERVICE_ALIASES[application]
    : [];
  const candidates = [application, ...aliases];
  for (const name of candidates) {
    if (Object.hasOwn(services, name)) return [name, services[name]];
  }
  return null;
}

/** The kind of an application with a UI service, an API service, or both. */
function getApplicationKind(
  hasUi: boolean,
  hasApi: boolean
): ApplicationKind | null {
  if (hasUi && hasApi) return 'UI + API';
  if (hasUi) return 'UI';
  if (hasApi) return 'API';
  return null;
}

/**
 * Rows for the overview's Applications table: one per enabled Phalanx
 * application, in discovery order.
 *
 * Each application is joined to at most one UI service and one internal
 * service, named for the application or one of its known aliases (see
 * `APPLICATION_SERVICE_ALIASES`), so `nublado` joins both its `nublado` UI and
 * its `nublado-controller` API. An application that matches no service, such
 * as an infrastructure application like `cert-manager`, is a name-only row.
 */
export function buildApplicationRows(
  discovery: ServiceDiscovery
): ApplicationRow[] {
  return discovery.applications.map((name) => {
    const [uiName, uiService] =
      findApplicationService(discovery.services.ui, name) ?? [];
    const [internalName, internalService] =
      findApplicationService(discovery.services.internal, name) ?? [];

    const urls: ApplicationServiceUrl[] = [];
    if (uiName && uiService) {
      urls.push({ kind: 'UI', service: uiName, url: uiService.url });
    }
    if (internalName && internalService) {
      urls.push({
        kind: 'API',
        service: internalName,
        url: internalService.url,
      });
    }

    return {
      name,
      title: uiService?.title || internalService?.title || null,
      kind: getApplicationKind(Boolean(uiService), Boolean(internalService)),
      urls,
      docsUrl: uiService?.docs_url || internalService?.docs_url || null,
      requiredScopes: [
        ...new Set([
          ...(uiService?.required_scopes ?? []),
          ...(internalService?.required_scopes ?? []),
        ]),
      ],
      openapiUrl: internalService?.openapi ?? null,
    };
  });
}

/**
 * The rows whose application name or title contains `query`, ignoring case
 * and surrounding whitespace. A blank query keeps every row.
 */
export function filterApplicationRows(
  rows: ApplicationRow[],
  query: string
): ApplicationRow[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return rows;
  return rows.filter(
    (row) =>
      row.name.toLowerCase().includes(needle) ||
      (row.title?.toLowerCase().includes(needle) ?? false)
  );
}
