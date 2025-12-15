/**
 * RSC-optimized MDX compilation utilities.
 *
 * This module provides MDX compilation functions for React Server Components
 * using next-mdx-remote/rsc. Unlike the Pages Router approach which requires
 * serialize/hydrate, RSC MDX compilation returns React elements directly.
 */

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

/**
 * Compile footer MDX content for RSC rendering.
 *
 * Loads and compiles footer.mdx with footer-specific components.
 * Returns null if the footer MDX file is not found (graceful fallback).
 *
 * @returns Compiled footer content or null if not found
 *
 * @example
 * ```tsx
 * const footerContent = await compileFooterMdxForRsc();
 * return footerContent ? footerContent : <DefaultFooter />;
 * ```
 */
export async function compileFooterMdxForRsc(): Promise<ReactElement | null> {
  const { footerMdxComponents } = await import('../../utils/mdxComponents');

  try {
    const { content } = await compileMdxForRsc({
      contentPath: 'footer.mdx',
      components: footerMdxComponents,
    });
    return content;
  } catch {
    // Graceful fallback - footer MDX is optional
    return null;
  }
}
