'use client';

import styles from './RenderedMarkdown.module.css';
import { useRenderedMarkdown } from './useRenderedMarkdown';

export type RenderedMarkdownProps = {
  /** Raw Markdown source to render. */
  markdown: string;
  /** Optional className for styling overrides. */
  className?: string;
};

/**
 * Render a Markdown string (GitHub-flavored) as HTML.
 *
 * The Semaphore admin endpoints return `summary` and `body` as raw Markdown, so
 * the admin UI renders it client-side with the same `remark`/`remark-gfm`/
 * `remark-html` toolchain used elsewhere in the app. Shared by the listing
 * summary, the detail body, and the compose preview.
 *
 * @example
 * ```tsx
 * <RenderedMarkdown markdown="A **bold** word" />
 * ```
 */
export function RenderedMarkdown({
  markdown,
  className,
}: RenderedMarkdownProps) {
  const renderedHtml = useRenderedMarkdown(markdown);
  const rootClassName = className ? `${styles.root} ${className}` : styles.root;

  // The rendered HTML comes from our own remark/remark-html pipeline.
  /* eslint-disable react/no-danger */
  return (
    <div
      className={rootClassName}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
  /* eslint-enable react/no-danger */
}

export default RenderedMarkdown;
