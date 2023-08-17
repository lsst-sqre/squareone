import { useRouter } from 'next/router';

/** Get the current absolute URL of the current page with next/router.
 *
 * @param baseUrl The base URL of the site, e.g. https://example.com
 * @returns currentUrl The URL of the current page endpoint.
 */
function useCurrentUrl(baseUrl: string): import('url').URL {
  const router = useRouter();
  return new URL(router.pathname, baseUrl);
}

export default useCurrentUrl;
