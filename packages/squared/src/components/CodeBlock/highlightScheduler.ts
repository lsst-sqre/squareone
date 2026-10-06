/**
 * One shared MicroLighter highlight pass for every mounted `CodeBlock`.
 *
 * MicroLighter (https://github.com/davatron5000/microlighter) colours plain
 * `<pre><code class="language-*">` text with the CSS Custom Highlight API, so
 * the DOM stays plain text. Its core API, `highlightAll()`, is document-wide:
 * each call clears every registered highlight category and rebuilds them from
 * the code blocks it matches. Highlighting one block at a time would therefore
 * erase the others, and cost a full pass per block.
 *
 * Instead, every `CodeBlock` calls {@link scheduleHighlight} when it mounts,
 * changes, or unmounts. Calls made in the same tick share one pass, which
 * highlights every `CodeBlock` on the page at once (and drops the ranges of
 * blocks that have left it). Passes never overlap: a call made while a pass
 * runs schedules one more pass after it.
 *
 * MicroLighter touches `CSS.highlights` and `document`, so it's only ever
 * loaded with a dynamic import in the browser, never during server rendering.
 * Each language grammar is a further lazy-loaded chunk.
 */

import type { HighlightAllOptions } from 'microlighter';

/** The part of MicroLighter's core module that the scheduler uses. */
type MicroLighterModule = {
  highlightAll: (options?: HighlightAllOptions) => Promise<HTMLElement[]>;
};

/**
 * Data attribute that marks a `CodeBlock`'s code frame, the element that holds
 * its `<pre>`. Highlight passes only scan code inside it, so stray
 * `pre > code` elsewhere on the page keep their own styling.
 */
export const CODE_BLOCK_ATTRIBUTE = 'data-sqr-code-block';

/** Selector for the code elements that a highlight pass colours. */
export const CODE_BLOCK_SELECTOR = `[${CODE_BLOCK_ATTRIBUTE}] > pre > code`;

/** The cached MicroLighter import, or `undefined` before (or after a failed) load. */
let microLighter: Promise<MicroLighterModule | null> | undefined;

/** The scheduled pass that hasn't started scanning the page yet. */
let pendingPass: Promise<boolean> | undefined;

/** Settles once the most recently scheduled pass has finished. */
let lastPass: Promise<unknown> = Promise.resolve();

/** Number of highlight passes run on this page. */
let passCount = 0;

/**
 * Whether this environment can run MicroLighter: a browser with the CSS
 * Custom Highlight API. False during server rendering, under jsdom, and in
 * browsers without `CSS.highlights`, where code blocks stay plain monospace
 * text.
 */
export function supportsMicroLighter(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof CSS !== 'undefined' &&
    'highlights' in CSS
  );
}

/**
 * Import MicroLighter's core module once per page. A failed import (such as a
 * chunk that fails to load mid-deploy or on a flaky network) clears the cache,
 * so the next call tries again instead of disabling highlighting for the rest
 * of the session.
 */
function importMicroLighter(): Promise<MicroLighterModule | null> {
  microLighter ??= import('microlighter').then(
    (loaded) => loaded,
    // Annotated so apps that compile this source without strictNullChecks
    // don't widen `null` to an implicit `any`.
    (): null => {
      microLighter = undefined;
      return null;
    }
  );
  return microLighter;
}

/**
 * Load MicroLighter's core module.
 *
 * Resolves to `true` once the module is loaded, or `false` when the
 * environment can't highlight (see {@link supportsMicroLighter}) or the import
 * fails. Repeated calls share one import; after a failure, the next call
 * imports again.
 */
export async function loadMicroLighter(): Promise<boolean> {
  if (!supportsMicroLighter()) return false;
  return (await importMicroLighter()) !== null;
}

/**
 * Run one highlight pass over every `CodeBlock` on the page.
 */
async function runPass(pass: Promise<boolean>): Promise<boolean> {
  const loaded = await importMicroLighter();
  // From here on the pass reads the page as it is now, so a later call must
  // schedule a new pass to pick up its changes.
  if (pendingPass === pass) pendingPass = undefined;
  if (!loaded) return false;
  passCount += 1;
  try {
    await loaded.highlightAll({ selector: CODE_BLOCK_SELECTOR });
    return true;
  } catch {
    // Plain, unhighlighted code is the fallback; nothing else to do.
    return false;
  }
}

/**
 * Schedule a highlight pass over every `CodeBlock` on the page.
 *
 * Calls made in the same tick (such as the effects of every `CodeBlock` that
 * mounts in one render) share one pass, which runs in a microtask once any
 * earlier pass has finished. Resolves to `true` once the pass has highlighted
 * the page, or `false` when the environment can't highlight or MicroLighter
 * fails to load.
 */
export function scheduleHighlight(): Promise<boolean> {
  if (!supportsMicroLighter()) return Promise.resolve(false);
  if (pendingPass) return pendingPass;
  const pass: Promise<boolean> = lastPass.then(() => runPass(pass));
  pendingPass = pass;
  lastPass = pass;
  return pass;
}

/**
 * Number of highlight passes that have run on this page, so tests can check
 * that many code blocks share one pass.
 */
export function getHighlightPassCount(): number {
  return passCount;
}
