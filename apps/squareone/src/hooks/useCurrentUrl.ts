import { useRouter } from 'next/router';
import { useAppConfig } from '../contexts/AppConfigContext';

/* Hook to get the current URL. */
function useCurrentUrl(): URL {
  const { baseUrl } = useAppConfig();
  const router = useRouter();
  return new URL(router.pathname, baseUrl);
}

export default useCurrentUrl;
