/**
 * RSC-specific configuration utilities for the App Router.
 *
 * This module provides React cache()-wrapped versions of configuration
 * and content loaders optimized for React Server Components.
 */

export type { AppConfig, SentryConfig, StaticConfig } from './loader';
export { getMdxContent, getStaticConfig } from './loader';
