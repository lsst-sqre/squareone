import type {
  Dataset,
  InfluxDatabase,
  InternalService,
  ServiceDiscovery,
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

  // === UI service queries ===

  /**
   * Get the URL for a UI service.
   * UI services are user-facing interfaces like portal, nublado.
   */
  getUiServiceUrl(name: string): string | undefined {
    return this.discovery.services.ui[name]?.url;
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
   * Get Times Square URL.
   */
  getTimesSquareUrl(): string | undefined {
    return this.getUiServiceUrl('times-square');
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
