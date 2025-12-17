// Query API - placeholder
import type { ServiceDiscovery } from './types';

export class ServiceDiscoveryQuery {
  constructor(private discovery: ServiceDiscovery) {}

  hasApplication(_name: string): boolean {
    return false;
  }

  getApplications(): string[] {
    return this.discovery.applications;
  }
}

export function createDiscoveryQuery(
  discovery: ServiceDiscovery
): ServiceDiscoveryQuery {
  return new ServiceDiscoveryQuery(discovery);
}
