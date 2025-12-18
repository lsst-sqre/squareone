import { z } from 'zod';

// URI validation helper (1-2083 chars per OpenAPI spec)
const uriSchema = z.string().url().min(1).max(2083);

// API Version (used in service versions)
export const ApiVersionSchema = z.object({
  url: uriSchema,
  ivoa_standard_id: z.string().nullable().optional(),
});

// Data Service (services within datasets)
export const DataServiceSchema = z.object({
  url: uriSchema,
  openapi: uriSchema.nullable().optional(),
  versions: z.record(ApiVersionSchema).default({}),
});

// Dataset
export const DatasetSchema = z.object({
  butler_config: uriSchema.nullable().optional(),
  description: z.string().nullable().optional(),
  docs_url: uriSchema.nullable().optional(),
  services: z.record(DataServiceSchema).default({}),
});

// Internal Service (gafaelfawr, semaphore, etc.)
// Has url, openapi, and versions fields
export const InternalServiceSchema = z.object({
  url: uriSchema,
  openapi: uriSchema.nullable().optional(),
  versions: z.record(ApiVersionSchema).default({}),
});

// UI Service (portal, nublado, times-square, etc.)
// Only has url field per OpenAPI spec
export const UiServiceSchema = z.object({
  url: uriSchema,
});

// Services container
export const ServicesSchema = z.object({
  internal: z.record(InternalServiceSchema).default({}),
  ui: z.record(UiServiceSchema).default({}),
});

// InfluxDB Database with pointer (credentials_url instead of actual credentials)
export const InfluxDatabaseSchema = z.object({
  url: uriSchema,
  database: z.string(),
  schema_registry: uriSchema,
  credentials_url: uriSchema,
});

// Root Discovery response
export const DiscoverySchema = z.object({
  applications: z.array(z.string()).default([]),
  datasets: z.record(DatasetSchema).default({}),
  influxdb_databases: z.record(InfluxDatabaseSchema).default({}),
  services: ServicesSchema,
});

// Infer types from schemas
export type ApiVersion = z.infer<typeof ApiVersionSchema>;
export type DataService = z.infer<typeof DataServiceSchema>;
export type Dataset = z.infer<typeof DatasetSchema>;
export type InternalService = z.infer<typeof InternalServiceSchema>;
export type UiService = z.infer<typeof UiServiceSchema>;
export type Services = z.infer<typeof ServicesSchema>;
export type InfluxDatabase = z.infer<typeof InfluxDatabaseSchema>;
export type ServiceDiscovery = z.infer<typeof DiscoverySchema>;
