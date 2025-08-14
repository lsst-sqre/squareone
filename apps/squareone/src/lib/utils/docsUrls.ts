import getConfig from 'next/config';

/**
 * Get the full URL to a documentation page.
 * @param path The path to the documentation page, starting with "/"
 * @returns The full URL to the documentation page
 */
export function getDocsUrl(path: string): string {
  const { publicRuntimeConfig } = getConfig();
  return `${publicRuntimeConfig.docsBaseUrl}${path}`;
}
