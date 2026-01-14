/**
 * RSC-specific MDX compilation utilities for the App Router.
 *
 * This module provides MDX compilation functions optimized for React Server
 * Components, using next-mdx-remote/rsc for direct compilation without the
 * serialize/hydrate boundary required in the Pages Router.
 */

export type { CompileMdxOptions, MdxCompileResult } from './compiler';
export {
  commonMdxComponents,
  compileFooterMdxForRsc,
  compileMdxForRsc,
  footerMdxComponents,
} from './compiler';
