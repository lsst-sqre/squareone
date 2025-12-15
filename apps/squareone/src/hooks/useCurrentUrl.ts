import { usePathname } from 'next/navigation';
import { useAppConfig } from '../contexts/AppConfigContext';

/* Hook to get the current URL. */
function useCurrentUrl(): URL {
  const { baseUrl } = useAppConfig();
  const pathname = usePathname();
  return new URL(pathname, baseUrl);
}

export default useCurrentUrl;
