// Service discovery types - placeholder
export type ServiceDiscovery = {
  applications: string[];
  datasets: Record<string, unknown>;
  services: {
    internal: Record<string, unknown>;
    ui: Record<string, unknown>;
  };
  influxdb_databases: Record<string, unknown>;
};
