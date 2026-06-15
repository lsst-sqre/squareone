/**
 * A single API endpoint rendered in the `/api-aspect` listing.
 *
 * The base (discovery-driven skeleton) transform fills `label` with the raw
 * service name and `url` with the service's base URL. Later curated work
 * (#465) can substitute human labels and version-selected URLs without
 * changing this shape.
 */
export type ApiEndpoint = {
  /** Display label for the endpoint. */
  label: string;
  /** Endpoint URL the label links to. */
  url: string;
};

/**
 * A group of API endpoints that share a section heading.
 *
 * The base transform emits one group per discovered dataset, keyed by the
 * raw dataset key (`dp1`, `dp02`, `dp03`).
 */
export type ApiEndpointGroup = {
  /** Section heading for the group (the dataset key in the base transform). */
  datasetKey: string;
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
