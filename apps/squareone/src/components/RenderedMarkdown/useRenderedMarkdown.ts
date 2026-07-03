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

// Minimal structural view of the mdast nodes the helpers below traverse. The
// full mdast types are not imported to keep this dependency-light; only `type`,
// `value`, and `children` are needed.
type SummaryNode = {
  type: string;
  value?: string;
  children?: SummaryNode[];
};

/** Replace every link node with its inline children, in place and recursively. */
function unwrapLinks(node: SummaryNode): void {
  if (!node.children) {
    return;
  }
  const next: SummaryNode[] = [];
  for (const child of node.children) {
    unwrapLinks(child);
    if (child.type === 'link' && child.children) {
      next.push(...child.children);
    } else {
      next.push(child);
    }
  }
  node.children = next;
}

// remark transformer that rewrites a parsed summary into inline phrasing
// content: it unwraps links to their text/emphasis (live links belong in the
// expanded body and the detail page, not the inline summary) and unwraps a lone
// top-level paragraph so the rendered HTML carries no block `<p>` wrapper —
// keeping it valid phrasing content inside the summary toggle `<button>`.
function remarkInlineSummary() {
  return (tree: unknown) => {
    const root = tree as SummaryNode;
    unwrapLinks(root);
    if (root.children?.length === 1 && root.children[0].type === 'paragraph') {
      root.children = root.children[0].children ?? [];
    }
  };
}

const inlineSummaryProcessor = remark()
  .use(gfm)
  .use(remarkInlineSummary)
  .use(html);

/**
 * Render a notification summary's GitHub-flavored Markdown to **inline** HTML.
 *
 * Goes through the same sanitizing remark/remark-html pipeline as
 * {@link renderMarkdownToHtml} (so dangerous raw HTML is stripped — never trust
 * the API's pre-rendered `summary.html`), but additionally flattens links to
 * plain text and drops the block paragraph wrapper. The result is valid
 * phrasing content, safe to place inside a `<button>` and to inject via
 * `dangerouslySetInnerHTML`.
 *
 * @param markdown - Raw Markdown source (the summary's `gfm` field)
 * @returns The rendered inline HTML
 */
export function renderInlineMarkdown(markdown: string): string {
  if (markdown.trim() === '') {
    return '';
  }
  return inlineSummaryProcessor.processSync(markdown).toString().trim();
}

/** Concatenate the text of an mdast subtree (drops markup, keeps link text). */
function collectText(node: SummaryNode): string {
  if (typeof node.value === 'string') {
    return node.value;
  }
  if (node.children) {
    return node.children.map(collectText).join('');
  }
  return '';
}

/**
 * Extract the plain-text content of a GitHub-flavored Markdown string for use in
 * an accessible label: emphasis markers are dropped, link text is kept, and URLs
 * are discarded. Parses with the same remark/gfm toolchain and walks the syntax
 * tree, so there is no HTML to sanitize.
 *
 * @param markdown - Raw Markdown source (the summary's `gfm` field)
 * @returns The plain-text content, with runs of whitespace collapsed
 */
export function markdownToPlainText(markdown: string): string {
  const tree = processor.parse(markdown) as unknown as SummaryNode;
  return collectText(tree).replace(/\s+/g, ' ').trim();
}
