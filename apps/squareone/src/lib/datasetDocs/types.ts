import type { DatasetSummary } from '../apiEndpoints/types';

/**
 * A discovered dataset rendered as a documentation card on the `/docs` page:
 * the same {@link DatasetSummary} that heads the dataset's `/api-aspect`
 * group, so both pages name and link a dataset identically. The card links to
 * `docsUrl` when it has one and renders unlinked otherwise.
 */
export type DatasetDoc = DatasetSummary;

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
