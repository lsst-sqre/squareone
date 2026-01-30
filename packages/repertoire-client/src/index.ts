// Core client

export type { Logger } from './client';
export {
  fetchServiceDiscovery,
  getEmptyDiscovery,
  RepertoireError,
} from './client';
// React hooks
export { useServiceDiscovery } from './hooks/useServiceDiscovery';
// Mock data for development
export { mockDiscovery } from './mock-discovery';
// TanStack Query integration
export * from './query';
export * from './query-options';
// Types (re-exported from schemas)
export type {
  ApiVersion,
  DataService,
  Dataset,
  InfluxDatabase,
  InternalService,
  ServiceDiscovery,
  Services,
  UiService,
} from './schemas';
export {
  ApiVersionSchema,
  DataServiceSchema,
  DatasetSchema,
  DiscoverySchema,
  InfluxDatabaseSchema,
  InternalServiceSchema,
  ServicesSchema,
  UiServiceSchema,
} from './schemas';
