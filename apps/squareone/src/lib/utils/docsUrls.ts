/**
 * Get the full URL to a documentation page.
 * @param docsBaseUrl The base URL for documentation
 * @param path The path to the documentation page, starting with "/"
 * @returns The full URL to the documentation page
 */
export function getDocsUrl(docsBaseUrl: string, path: string): string {
  return `${docsBaseUrl}${path}`;
}
