import getConfig from 'next/config';
import { useRouter } from 'next/router';

const { publicRuntimeConfig } = getConfig();

/* Hook to get the current URL. */
function useCurrentUrl(): URL {
  const { baseUrl } = publicRuntimeConfig;
  const router = useRouter();
  return new URL(router.pathname, baseUrl);
}

export default useCurrentUrl;
