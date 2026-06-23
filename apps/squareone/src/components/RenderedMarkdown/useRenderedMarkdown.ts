import { useMemo } from 'react';
import { remark } from 'remark';
import gfm from 'remark-gfm';
import html from 'remark-html';

// A single reusable processor: remark + GFM + HTML, the same toolchain used by
// the `gfmToHtml` helper and the broadcast banners. unified processors are safe
// to reuse across many synchronous `processSync` calls once frozen.
//
// SECURITY: the rendered HTML is injected via `dangerouslySetInnerHTML` (see
// `RenderedMarkdown.tsx`), and the Markdown source can include untrusted,
// query-param-derived content (e.g. the compose page preview). This pipeline is
// safe only because `remark-html` defaults `sanitize` to `true`, which strips
// dangerous raw HTML (`<script>`, `<iframe>`, `on*` handlers, `javascript:`
// URLs). Do NOT pass `sanitize: false` (or otherwise disable sanitization) to
// `.use(html)` — doing so would reopen a cross-site-scripting (XSS) hole across
// all consumers (the notifications listing summary, detail body, and the
// compose preview).
const processor = remark().use(gfm).use(html);

/**
 * Render a GitHub-flavored Markdown string to an HTML string.
 *
 * Synchronous so it can drive a live preview (e.g. the compose form) without an
 * effect round-trip. Whitespace-only input renders to an empty string so empty
 * previews stay empty rather than emitting a stray paragraph.
 *
 * @param markdown - Raw Markdown source
 * @returns The rendered HTML
 */
export function renderMarkdownToHtml(markdown: string): string {
  if (markdown.trim() === '') {
    return '';
  }
  return processor.processSync(markdown).toString();
}

/**
 * Hook wrapper around {@link renderMarkdownToHtml} that memoizes the rendered
 * HTML for a given Markdown string.
 *
 * @param markdown - Raw Markdown source
 * @returns The rendered HTML
 */
export function useRenderedMarkdown(markdown: string): string {
  return useMemo(() => renderMarkdownToHtml(markdown), [markdown]);
}
