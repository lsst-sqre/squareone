/**
 * A discovered dataset rendered as a documentation card on the `/docs` page.
 */
export type DatasetDoc = {
  /** Raw dataset key (`dp1`, `dp02`, `prompt`, …); used as a stable React key. */
  datasetKey: string;
  /**
   * Human-facing dataset name from the presentation map's
   * `datasetDisplayNames`, falling back to the raw key when unmapped.
   */
  displayName: string;
  /** The dataset's discovery `description`, or `null` when it has none. */
  description: string | null;
  /**
   * The dataset's discovery `docs_url` the card links to, or `null` when it
   * has none (the card then renders unlinked).
   */
  docsUrl: string | null;
};

/**
 * The outcome of resolving the dataset documentation cards for the page.
 *
 * - `omitted`: no `repertoireUrl` configured, so the cards are left out
 *   entirely and only the surrounding MDX prose renders.
 * - `unavailable`: discovery was configured but the fetch/parse failed; the
 *   page shows a brief notice instead of the cards.
 * - `ok`: discovery succeeded and produced one entry per dataset.
 */
export type DatasetDocsResult =
  | { status: 'omitted' }
  | { status: 'unavailable' }
  | { status: 'ok'; datasets: DatasetDoc[] };
