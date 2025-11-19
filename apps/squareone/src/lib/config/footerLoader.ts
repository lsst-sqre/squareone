import { serialize } from 'next-mdx-remote/serialize';

import type { AppConfigContextValue } from '../../contexts/AppConfigContext';
import { loadMdxContent } from './loader';

// Track if we've logged the footer load error to avoid log spam
let footerLoadErrorLogged = false;

/**
 * Load and serialize footer MDX content.
 *
 * This helper function loads footer MDX content based on the app configuration
 * and returns serialized MDX ready for rendering with MDXRemote.
 *
 * @param config - Application configuration
 * @returns Serialized MDX source, or null if loading fails
 *
 * @example
 * ```typescript
 * export const getServerSideProps: GetServerSideProps = async () => {
 *   const config = await loadAppConfig();
 *   const footerMdxSource = await loadFooterMdx(config);
 *
 *   return {
 *     props: {
 *       appConfig: config,
 *       footerMdxSource,
 *     },
 *   };
 * };
 * ```
 */
export async function loadFooterMdx(
  config: AppConfigContextValue
  // biome-ignore lint/suspicious/noExplicitAny: MDX serialized source is an opaque type from next-mdx-remote
): Promise<any | null> {
  try {
    const footerMdxContent = await loadMdxContent('footer.mdx', config);
    return await serialize(footerMdxContent);
  } catch (_error) {
    // If footer MDX can't be loaded, return null
    // Footer component will fall back to hardcoded content
    // Log only once to avoid flooding logs with repeated warnings
    if (!footerLoadErrorLogged) {
      console.info('Footer MDX not found, using fallback content');
      footerLoadErrorLogged = true;
    }
    return null;
  }
}
