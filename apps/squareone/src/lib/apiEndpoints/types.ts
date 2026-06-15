/**
 * A single API endpoint rendered in the `/api-aspect` listing.
 *
 * Mapped services carry a curated `label`, a version-selected `url`, and an
 * `ivoaUrl` pointing at the relevant IVOA standard. Unmapped services fall back
 * to the raw service name as the `label`, the base `url`, and a null `ivoaUrl`.
 */
export type ApiEndpoint = {
  /** Display label for the endpoint. */
  label: string;
  /** Endpoint URL the label links to. */
  url: string;
  /**
   * IVOA standard documentation link the label points to, or `null` when the
   * service is unmapped (no curated standard link).
   */
  ivoaUrl?: string | null;
};

/**
 * A group of API endpoints that share a section heading.
 *
 * The transform emits one group per discovered dataset. The heading renders
 * `displayName` (linked to `docsUrl` when present) followed by `description`.
 */
export type ApiEndpointGroup = {
  /** Raw dataset key (`dp1`, `dp02`, …); used as a stable React key. */
  datasetKey: string;
  /** Human-facing dataset name; falls back to the raw key when unmapped. */
  displayName: string;
  /** Dataset documentation URL the heading links to, when present. */
  docsUrl?: string | null;
  /** Dataset description rendered under the heading, when present. */
  description?: string | null;
  /** Endpoints served by this dataset. */
  endpoints: ApiEndpoint[];
};

/**
 * The outcome of resolving the API endpoint listing for the page.
 *
 * - `omitted`: no `repertoireUrl` configured, so the listing is left out
 *   entirely and only the surrounding MDX prose renders.
 * - `unavailable`: discovery was configured but the fetch/parse failed; the
 *   page shows a brief notice instead of the listing.
 * - `ok`: discovery succeeded and produced the dataset groups to render.
 */
export type ApiEndpointsResult =
  | { status: 'omitted' }
  | { status: 'unavailable' }
  | { status: 'ok'; groups: ApiEndpointGroup[] };
