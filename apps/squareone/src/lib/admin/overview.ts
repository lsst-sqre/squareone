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
