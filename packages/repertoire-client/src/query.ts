import type {
  DataService,
  Dataset,
  Environment,
  InfluxDatabase,
  InternalService,
  ServiceDiscovery,
  UiService,
} from './types';

/**
 * Options for checking service availability.
 * - `hasApi`: Check if the service is listed in applications (has an API)
 * - `hasUi`: Check if the service has a UI endpoint
 */
export type ServiceAvailabilityOptions = {
  hasApi?: boolean;
  hasUi?: boolean;
};

/**
 * Result from getDatasetsWithService query.
 */
export type DatasetWithService = {
  id: string;
  dataset: Dataset;
  serviceUrl: string;
};

/**
 * Any discovery service (UI, internal, or data) as far as access checks are
 * concerned: only its `required_scopes` matter.
 */
export type ScopedService = {
  readonly required_scopes?: readonly string[];
};

/**
 * What a Gafaelfawr API quota label refers to, from
 * {@link ServiceDiscoveryQuery.getQuotaLabelIndex}.
 */
export type QuotaLabelIndexEntry = {
  /** Name of the service declaring the label (e.g., 'tap', 'cutout'). */
  serviceName: string;
  /** The service's short human-readable title, if it declares one. */
  serviceTitle: string | null;
  /** URL of the service's documentation, if it declares one. */
  serviceDocsUrl: string | null;
  /** Short human-readable description of what the quota counts. */
  labelTitle: string;
  /** If true, hide the quota from user-facing quota summaries. */
  internal: boolean;
};

/**
 * Quota label (a key of Gafaelfawr's `quota.api`) to service metadata.
 */
export type QuotaLabelIndex = Record<string, QuotaLabelIndexEntry>;

/**
 * Query API for navigating service discovery data.
 * Provides methods to check availability and retrieve URLs for services,
 * datasets, and other platform resources.
 */
export class ServiceDiscoveryQuery {
  constructor(private discovery: ServiceDiscovery) {}

  // === Application queries ===

  /**
   * Check if an application is enabled in the platform.
   * Applications are Phalanx apps like portal, nublado, times-square.
   */
  hasApplication(name: string): boolean {
    return this.discovery.applications.includes(name);
  }

  /**
   * Get list of all enabled applications.
   */
  getApplications(): string[] {
    return this.discovery.applications;
  }

  // === Environment queries ===

  /**
   * Get the metadata for the Phalanx environment (name, label, titles,
   * description, docs URL).
   * Returns null when discovery predates Repertoire 3.0.0 and so has no
   * `environment` object.
   */
  getEnvironment(): Environment | null {
    return this.discovery.environment ?? null;
  }

  /**
   * Get the human-readable environment name, intended for status or error
   * reporting (not for building URLs).
   * Prefers `environment.name` (Repertoire 3.0.0) and falls back to the
   * deprecated top-level `environment_name`; null when neither is present.
   */
  getEnvironmentName(): string | null {
    return (
      this.discovery.environment?.name ??
      this.discovery.environment_name ??
      null
    );
  }

  // === UI service queries ===

  /**
   * Get the URL for a UI service.
   * UI services are user-facing interfaces like portal, nublado.
   */
  getUiServiceUrl(name: string): string | undefined {
    return this.discovery.services.ui[name]?.url;
  }

  /**
   * Get full UI service info including title, docs URL, and required scopes.
   */
  getUiService(name: string): UiService | undefined {
    return this.discovery.services.ui[name];
  }

  /**
   * Check if a UI service exists.
   */
  hasUiService(name: string): boolean {
    return name in this.discovery.services.ui;
  }

  // === Internal service queries ===

  /**
   * Get the URL for an internal service.
   * Internal services are backend APIs like gafaelfawr, semaphore.
   */
  getInternalServiceUrl(name: string): string | undefined {
    return this.discovery.services.internal[name]?.url;
  }

  /**
   * Get full internal service info including OpenAPI spec URL and versions.
   */
  getInternalService(name: string): InternalService | undefined {
    return this.discovery.services.internal[name];
  }

  /**
   * Check if an internal service exists.
   */
  hasInternalService(name: string): boolean {
    return name in this.discovery.services.internal;
  }

  // === Dataset queries ===

  /**
   * Get all datasets.
   */
  getDatasets(): Record<string, Dataset> {
    return this.discovery.datasets;
  }

  /**
   * Get a specific dataset by ID.
   */
  getDataset(id: string): Dataset | undefined {
    return this.discovery.datasets[id];
  }

  /**
   * Get a data service (e.g., 'tap', 'sia') of a specific dataset.
   * Data services are dataset-specific: the same service name can have a
   * different URL in each dataset.
   */
  getDataService(datasetId: string, name: string): DataService | undefined {
    return this.discovery.datasets[datasetId]?.services[name];
  }

  /**
   * Check if a dataset exists.
   */
  hasDataset(id: string): boolean {
    return id in this.discovery.datasets;
  }

  /**
   * Find all datasets that have a specific service (e.g., 'tap', 'sia').
   * Returns dataset info along with the service URL.
   */
  getDatasetsWithService(serviceName: string): DatasetWithService[] {
    return Object.entries(this.discovery.datasets)
      .filter(([, dataset]) => serviceName in dataset.services)
      .map(([id, dataset]) => ({
        id,
        dataset,
        serviceUrl: dataset.services[serviceName].url,
      }));
  }

  // === InfluxDB queries ===

  /**
   * Get all InfluxDB databases.
   */
  getInfluxDatabases(): Record<string, InfluxDatabase> {
    return this.discovery.influxdb_databases;
  }

  /**
   * Get a specific InfluxDB database by name.
   */
  getInfluxDatabase(name: string): InfluxDatabase | undefined {
    return this.discovery.influxdb_databases[name];
  }

  // === Access checks ===

  /**
   * Check whether a user with the given Gafaelfawr scopes can use a service.
   *
   * Returns true when the service declares no `required_scopes`, or when
   * `userScopes` is undefined (an anonymous visitor, or login info not yet
   * loaded), so callers degrade to showing the service as they did before
   * Repertoire 3.0.0. Otherwise the user must hold every required scope.
   */
  canAccessService(
    service: ScopedService,
    userScopes?: readonly string[]
  ): boolean {
    const required = service.required_scopes ?? [];
    if (required.length === 0 || userScopes === undefined) {
      return true;
    }
    return required.every((scope) => userScopes.includes(scope));
  }

  // === Quota queries ===

  /**
   * Index every Gafaelfawr API quota label declared by a data or internal
   * service, so a quota label (a key of Gafaelfawr's `quota.api`) can be
   * shown with the title and docs URL of the service it applies to.
   *
   * Data services are keyed by service name, not dataset, since the same
   * service (e.g., TAP) declares the same label in every dataset. When a
   * label is declared more than once the first occurrence wins, visiting
   * data services (in dataset order) before internal services because they
   * are the user-facing entries and carry richer metadata (docs URLs).
   *
   * Empty for Repertoire 2.x discovery, which has no quota labels.
   */
  getQuotaLabelIndex(): QuotaLabelIndex {
    const index: QuotaLabelIndex = {};
    const services: [string, DataService | InternalService][] = [
      ...Object.values(this.discovery.datasets).flatMap((dataset) =>
        Object.entries(dataset.services)
      ),
      ...Object.entries(this.discovery.services.internal),
    ];
    for (const [serviceName, service] of services) {
      for (const [label, quotaLabel] of Object.entries(service.quota_labels)) {
        if (label in index) continue;
        index[label] = {
          serviceName,
          serviceTitle: service.title ?? null,
          serviceDocsUrl: service.docs_url ?? null,
          labelTitle: quotaLabel.title,
          internal: quotaLabel.internal,
        };
      }
    }
    return index;
  }

  // === Convenience methods for common services ===

  /**
   * Get Semaphore (broadcast service) URL.
   */
  getSemaphoreUrl(): string | undefined {
    return this.getInternalServiceUrl('semaphore');
  }

  /**
   * Get Gafaelfawr (auth service) v1 API URL.
   * Returns the versioned v1 endpoint URL, or undefined if not available.
   * Note: The base gafaelfawr URL is the service root, not the API endpoint,
   * so we specifically need the v1 version URL for API calls.
   */
  getGafaelfawrUrl(): string | undefined {
    const service = this.getInternalService('gafaelfawr');
    return service?.versions?.v1?.url;
  }

  /**
   * Get Portal (Firefly) URL.
   */
  getPortalUrl(): string | undefined {
    return this.getUiServiceUrl('portal');
  }

  /**
   * Get Nublado (JupyterHub) URL.
   */
  getNubladoUrl(): string | undefined {
    return this.getUiServiceUrl('nublado');
  }

  /**
   * Get the Squareone (RSP home page) URL, e.g. 'https://data.lsst.cloud/'.
   */
  getSquareoneUrl(): string | undefined {
    return this.getUiServiceUrl('squareone');
  }

  /**
   * Get the COmanage registry (account settings) URL.
   */
  getComanageUrl(): string | undefined {
    return this.getUiServiceUrl('comanage');
  }

  /**
   * Get Times Square v1 API URL.
   * Returns the versioned v1 endpoint URL, or undefined if not available.
   * Note: The base times-square URL is the service root, not the API endpoint,
   * so we specifically need the v1 version URL for API calls.
   */
  getTimesSquareUrl(): string | undefined {
    const service = this.getInternalService('times-square');
    return service?.versions?.v1?.url;
  }

  // === Flexible availability checks ===

  /**
   * Check if Times Square is available.
   * @param options - Specify which aspects to check:
   *   - `hasApi`: true to require times-square in applications
   *   - `hasUi`: true to require times-square UI service
   *   - No options: returns true if times-square exists anywhere
   */
  hasTimesSquare(options: ServiceAvailabilityOptions = {}): boolean {
    return this.checkServiceAvailability('times-square', options);
  }

  /**
   * Check if Portal is available.
   * @param options - Specify which aspects to check
   */
  hasPortal(options: ServiceAvailabilityOptions = {}): boolean {
    return this.checkServiceAvailability('portal', options);
  }

  /**
   * Check if Nublado is available.
   * @param options - Specify which aspects to check
   */
  hasNublado(options: ServiceAvailabilityOptions = {}): boolean {
    return this.checkServiceAvailability('nublado', options);
  }

  // === Private helpers ===

  /**
   * Generic availability check for a service.
   * - No options: returns true if service exists in applications OR ui services
   * - With options: all specified conditions must be true (AND logic)
   */
  private checkServiceAvailability(
    name: string,
    options: ServiceAvailabilityOptions
  ): boolean {
    const { hasApi, hasUi } = options;

    // If no options specified, check if service exists anywhere
    if (hasApi === undefined && hasUi === undefined) {
      return this.hasApplication(name) || this.hasUiService(name);
    }

    // Check requested aspects - all must be true
    const conditions: boolean[] = [];
    if (hasApi) {
      conditions.push(this.hasApplication(name));
    }
    if (hasUi) {
      conditions.push(this.hasUiService(name));
    }

    // All requested conditions must be true
    return conditions.length > 0 && conditions.every(Boolean);
  }
}

/**
 * Factory function to create a ServiceDiscoveryQuery instance.
 */
export function createDiscoveryQuery(
  discovery: ServiceDiscovery
): ServiceDiscoveryQuery {
  return new ServiceDiscoveryQuery(discovery);
}
