/**
 * A single API endpoint rendered in the `/api-aspect` listing.
 *
 * Mapped services carry a curated `label`, a version-selected `url`, and an
 * `ivoaUrl` pointing at the relevant IVOA standard. Unmapped services use the
 * base `url` and fall back to their discovery `title` (or the raw service
 * name) as the `label`, with their discovery `docs_url` as the `ivoaUrl` (when
 * it is an IVOA standard) or `docsUrl` (otherwise).
 */
export type ApiEndpoint = {
  /** Display label for the endpoint. */
  label: string;
  /** Endpoint URL the label links to. */
  url: string;
  /**
   * IVOA standard documentation link for the endpoint, or `null` when there is
   * none (neither a curated standard link nor an IVOA discovery `docs_url`).
   */
  ivoaUrl?: string | null;
  /**
   * Short standard/spec acronym for the IVOA doc link's accessible label —
   * e.g. `TAP` yields "IVOA TAP docs". Curated, or derived from the label for
   * an unmapped service; `null` when there is no {@link ivoaUrl}.
   */
  ivoaName?: string | null;
  /**
   * Documentation link for a service whose docs are not an IVOA standard —
   * an uncurated service's discovery `docs_url` (e.g. the alerts service's
   * technote). `null` when the endpoint has no such link; an endpoint links to
   * at most one of {@link ivoaUrl} and `docsUrl`.
   */
  docsUrl?: string | null;
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
