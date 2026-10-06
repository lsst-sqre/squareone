/**
 * The book-icon documentation link shown beside an endpoint's name.
 */
export type ApiEndpointDocsLink = {
  /** Documentation URL. */
  url: string;
  /**
   * Accessible name (and tooltip) for the icon-only link — e.g. "IVOA TAP
   * docs" for an IVOA standard, or "Alert retrieval docs" for other docs.
   */
  label: string;
};

/**
 * A single API endpoint rendered in the `/api-aspect` listing.
 *
 * The transform resolves each field by merging the service's curated
 * presentation entry over its discovery metadata, per the precedence rule
 * documented on `PresentationMap` (`presentation.ts`).
 */
export type ApiEndpoint = {
  /** Display label for the endpoint. */
  label: string;
  /** Endpoint URL, rendered as copyable code text. */
  url: string;
  /**
   * The endpoint's documentation link, or `null` when it has none. An IVOA
   * standard link is labelled by the standard's name ("IVOA TAP docs"); any
   * other docs link by the endpoint label ("Alert retrieval docs").
   */
  docs: ApiEndpointDocsLink | null;
  /**
   * Gafaelfawr scopes the service requires, from its discovery
   * `required_scopes` (all of them are needed to use it). Empty when the
   * service declares none, including every service under Repertoire 2.x,
   * which predates the field.
   */
  requiredScopes: string[];
};

/**
 * A discovered dataset's presentation, shared by the `/api-aspect` group
 * headings and the `/docs` dataset cards.
 *
 * `serviceDiscoveryToDatasetSummaries` (`transform.ts`) emits one per
 * discovered dataset, in curated order.
 */
export type DatasetSummary = {
  /** Raw dataset key (`dp1`, `dp02`, `prompt`, …); used as a stable React key. */
  datasetKey: string;
  /**
   * Human-facing dataset name from the presentation map's
   * `datasetDisplayNames`, falling back to the raw key when unmapped.
   */
  displayName: string;
  /** The dataset's discovery `description`, or `null` when it has none. */
  description: string | null;
  /** The dataset's discovery `docs_url`, or `null` when it has none. */
  docsUrl: string | null;
};

/**
 * A group of API endpoints that share a section heading.
 *
 * The transform emits one group per discovered dataset. The heading renders
 * `displayName` (linked to `docsUrl` when present) followed by `description`.
 */
export type ApiEndpointGroup = DatasetSummary & {
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
