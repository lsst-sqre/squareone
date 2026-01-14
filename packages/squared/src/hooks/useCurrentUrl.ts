'use client';

import { usePathname } from 'next/navigation';

/** Get the current absolute URL of the current page with next/navigation.
 *
 * @param baseUrl The base URL of the site, e.g. https://example.com
 * @returns currentUrl The URL of the current page endpoint.
 */
function useCurrentUrl(baseUrl: string): import('url').URL {
  const pathname = usePathname();
  return new URL(pathname, baseUrl);
}

export default useCurrentUrl;
