/**
 * RSC-optimized MDX compilation utilities.
 *
 * This module provides MDX compilation functions for React Server Components
 * using next-mdx-remote/rsc. Unlike the Pages Router approach which requires
 * serialize/hydrate, RSC MDX compilation returns React elements directly.
 */

import type { ReportError } from '@lsst-sqre/api-client-core';
import { compileMDX } from 'next-mdx-remote/rsc';
import type { ComponentType, ReactElement } from 'react';

import { getMdxContent } from '../../config/rsc';

// Re-export MDX component registries for convenience
export {
  commonMdxComponents,
  footerMdxComponents,
} from '../../utils/mdxComponents';

/**
 * Result of MDX compilation for RSC.
 */
export type MdxCompileResult = {
  /** Compiled MDX content as a React element ready for rendering */
  content: ReactElement;
  /** Frontmatter extracted from MDX file */
  frontmatter: Record<string, unknown>;
};

/**
 * Options for MDX compilation.
 */
export type CompileMdxOptions = {
  /** Path to MDX file relative to mdxDir (e.g., 'docs.mdx') */
  contentPath: string;
  /** Custom MDX components to use during rendering */
  // biome-ignore lint/suspicious/noExplicitAny: MDX components accept various prop types
  components?: Record<string, ComponentType<any>>;
};

/**
 * Compile MDX content for RSC rendering.
 *
 * Uses next-mdx-remote/rsc for direct server-side compilation. Unlike the
 * Pages Router approach, there's no serialize/hydrate boundary - the content
 * is compiled directly into React elements.
 *
 * @param options - Compilation options
 * @returns Compiled MDX content and frontmatter
 *
 * @example
 * ```tsx
 * // In a server component
 * const { content } = await compileMdxForRsc({
 *   contentPath: 'docs.mdx',
 *   components: { ...commonMdxComponents, CustomComponent },
 * });
 * return <div>{content}</div>;
 * ```
 */
export async function compileMdxForRsc(
  options: CompileMdxOptions
): Promise<MdxCompileResult> {
  const { contentPath, components = {} } = options;

  // Load raw MDX content using cached loader
  const mdxSource = await getMdxContent(contentPath);

  // Compile MDX directly to React elements
  const { content, frontmatter } = await compileMDX({
    source: mdxSource,
    components,
    options: {
      parseFrontmatter: true,
    },
  });

  return {
    content,
    frontmatter: frontmatter ?? {},
  };
}

/** Options for {@link compileFooterMdxForRsc}. */
export type CompileFooterMdxOptions = {
  /**
   * Optional error reporter (e.g. Sentry) for report-worthy footer failures.
   * An MDX compile error is forwarded so a broken footer template surfaces;
   * a missing (optional) footer file is never reported.
   */
  reportError?: ReportError;
};

/** Message prefix thrown by the base MDX loader when the file is absent. */
const MISSING_MDX_PREFIX = 'MDX file not found:';

/** True when `error` is the loader's "file absent" signal (an optional footer). */
function isMissingMdxFileError(error: unknown): boolean {
  return error instanceof Error && error.message.startsWith(MISSING_MDX_PREFIX);
}

/**
 * Compile footer MDX content for RSC rendering.
 *
 * Loads and compiles footer.mdx with footer-specific components. The footer is
 * optional, so a missing file yields a `null` footer silently. Any other
 * failure — most notably an MDX compile/syntax error in a footer that *does*
 * exist — also degrades to a `null` footer, but is reported via `reportError`
 * so the broken template surfaces rather than vanishing quietly.
 *
 * @param options - See {@link CompileFooterMdxOptions}.
 * @returns Compiled footer content, or null if not found or unrenderable.
 *
 * @example
 * ```tsx
 * const footerContent = await compileFooterMdxForRsc({ reportError });
 * return footerContent ? footerContent : <DefaultFooter />;
 * ```
 */
export async function compileFooterMdxForRsc(
  options: CompileFooterMdxOptions = {}
): Promise<ReactElement | null> {
  const { reportError } = options;
  const { footerMdxComponents } = await import('../../utils/mdxComponents');

  try {
    const { content } = await compileMdxForRsc({
      contentPath: 'footer.mdx',
      components: footerMdxComponents,
    });
    return content;
  } catch (error) {
    // A missing footer file is expected (the footer is optional): degrade to
    // null silently. Anything else (e.g. an MDX syntax error in a footer that
    // exists) is a real problem — report it, but still degrade gracefully.
    if (!isMissingMdxFileError(error)) {
      reportError?.(error, { site: 'footer-mdx', package: 'squareone' });
    }
    return null;
  }
}
