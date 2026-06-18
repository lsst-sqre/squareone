import { remark } from 'remark';
import gfm from 'remark-gfm';
import html from 'remark-html';

/**
 * Render a GitHub-flavored Markdown string to HTML asynchronously.
 *
 * Shares the same remark + remark-gfm + remark-html toolchain as the
 * synchronous `renderMarkdownToHtml` helper in `components/RenderedMarkdown`.
 * Prefer that synchronous variant where a value is needed inline (e.g. a live
 * preview); use this async variant in contexts that already await.
 */
export default async function gfmToHtml(markdown: string): Promise<string> {
  const result = await remark().use(gfm).use(html).process(markdown);
  return result.toString();
}
