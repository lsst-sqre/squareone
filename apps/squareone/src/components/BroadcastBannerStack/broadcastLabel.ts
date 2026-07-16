/**
 * Derive a concise plain-text accessible name from a broadcast summary's
 * GitHub-flavored Markdown (GFM) source.
 *
 * The banner's `<aside>` landmark needs an accessible name so screen readers
 * can distinguish simultaneous banners in landmark navigation. Using the raw
 * GFM source would make a screen reader announce literal Markdown syntax
 * (asterisks, brackets, URLs) and duplicate the entire banner body. This helper
 * reuses the AST-based {@link markdownToPlainText} extractor (the established
 * pattern for deriving accessible labels from semaphore summaries) to recover
 * readable text, then truncates it to a short landmark name.
 */

import { markdownToPlainText } from '../RenderedMarkdown';

const MAX_LABEL_LENGTH = 80;

/**
 * Build a concise, truncated plain-text accessible name from broadcast summary
 * GFM. Returns an empty string when the summary reduces to no text.
 */
export function broadcastAccessibleName(gfm: string): string {
  const text = markdownToPlainText(gfm);

  if (text.length <= MAX_LABEL_LENGTH) {
    return text;
  }

  // Truncate on a word boundary when possible, then append an ellipsis.
  const truncated = text.slice(0, MAX_LABEL_LENGTH);
  const lastSpace = truncated.lastIndexOf(' ');
  const head = lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated;
  return `${head.trimEnd()}…`;
}
