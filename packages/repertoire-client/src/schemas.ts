import { z } from 'zod';

// URI validation helper (1-2083 chars per OpenAPI spec)
const uriSchema = z.url().min(1).max(2083);

// API Version (used in service versions)
export const ApiVersionSchema = z.object({
  url: uriSchema,
});

// Descriptive metadata shared by every service type (added in Repertoire
// 3.0.0). Each field is optional or defaulted so 2.x responses still parse.
const serviceMetadataShape = {
  // Short human-readable description of the service.
  title: z.string().nullable().optional(),
  // URL to the service's documentation.
  docs_url: uriSchema.nullable().optional(),
  // Gafaelfawr scopes needed to use the service; ALL listed scopes are
  // required. Empty when the service declares no scope requirement.
  required_scopes: z.array(z.string()).default([]),
};

// A Gafaelfawr API quota label that applies to a service (added in Repertoire
// 3.0.0). Labels are the keys of Gafaelfawr's `quota.api` mapping.
export const QuotaLabelSchema = z.object({
  // Short human-readable description of what the quota counts.
  title: z.string(),
  // If true, hide the quota from user-facing quota summaries.
  internal: z.boolean().default(false),
});

// Data Service (services within datasets)
export const DataServiceSchema = z.object({
  url: uriSchema,
  ...serviceMetadataShape,
  openapi: uriSchema.nullable().optional(),
  quota_labels: z.record(z.string(), QuotaLabelSchema).default({}),
  versions: z.record(z.string(), ApiVersionSchema).default({}),
});

// Dataset
export const DatasetSchema = z.object({
  butler_config: uriSchema.nullable().optional(),
  description: z.string().nullable().optional(),
  docs_url: uriSchema.nullable().optional(),
  // Added in Repertoire 3.0.0; URL of the ObsCore exporter config used by the
  // SIAv2 service. The spec does not declare it as a URI, so accept any string.
  obscore_config: z.string().nullable().optional(),
  services: z.record(z.string(), DataServiceSchema).default({}),
});

// Internal Service (gafaelfawr, semaphore, etc.)
export const InternalServiceSchema = z.object({
  url: uriSchema,
  ...serviceMetadataShape,
  openapi: uriSchema.nullable().optional(),
  quota_labels: z.record(z.string(), QuotaLabelSchema).default({}),
  versions: z.record(z.string(), ApiVersionSchema).default({}),
});

// UI Service (portal, nublado, argocd, etc.)
export const UiServiceSchema = z.object({
  url: uriSchema,
  ...serviceMetadataShape,
});

// Services container
export const ServicesSchema = z.object({
  internal: z.record(z.string(), InternalServiceSchema).default({}),
  ui: z.record(z.string(), UiServiceSchema).default({}),
});

// InfluxDB Database with pointer (credentials_url instead of actual credentials)
export const InfluxDatabaseSchema = z.object({
  url: uriSchema,
  database: z.string(),
  schema_registry: uriSchema,
  credentials_url: uriSchema,
  // Added in Repertoire 2.0.0; whether the database is local to the queried
  // Phalanx environment. Serialized with exclude_defaults, so it is omitted
  // when false.
  local: z.boolean().default(false),
});

// Metadata about the Phalanx environment (added in Repertoire 3.0.0)
export const EnvironmentSchema = z.object({
  // Human-readable name for status/error reporting (often the hostname, but
  // not to be used to construct URLs).
  name: z.string(),
  // Phalanx environment name, such as `idfprod` or `idfdev`.
  label: z.string(),
  // Short human-readable title of the environment.
  title: z.string(),
  // Full human-readable title (may equal `title`).
  title_long: z.string(),
  description: z.string().nullable().optional(),
  docs_url: uriSchema,
});

// Root Discovery response
export const DiscoverySchema = z.object({
  applications: z.array(z.string()).default([]),
  datasets: z.record(z.string(), DatasetSchema).default({}),
  // Added in Repertoire 3.0.0; absent from 2.x responses.
  environment: EnvironmentSchema.nullable().optional(),
  // Added in Repertoire 2.0.0; human-readable name of the environment, intended
  // for status/error reporting only (not a hostname, not used to build URLs).
  // Deprecated in Repertoire 3.0.0 in favor of `environment.name`.
  environment_name: z.string().nullable().optional(),
  influxdb_databases: z.record(z.string(), InfluxDatabaseSchema).default({}),
  services: ServicesSchema,
});

// Infer types from schemas
export type ApiVersion = z.infer<typeof ApiVersionSchema>;
export type DataService = z.infer<typeof DataServiceSchema>;
export type Dataset = z.infer<typeof DatasetSchema>;
export type InternalService = z.infer<typeof InternalServiceSchema>;
export type UiService = z.infer<typeof UiServiceSchema>;
export type QuotaLabel = z.infer<typeof QuotaLabelSchema>;
export type Environment = z.infer<typeof EnvironmentSchema>;
export type Services = z.infer<typeof ServicesSchema>;
export type InfluxDatabase = z.infer<typeof InfluxDatabaseSchema>;
export type ServiceDiscovery = z.infer<typeof DiscoverySchema>;
