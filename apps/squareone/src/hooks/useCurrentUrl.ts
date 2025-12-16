import { usePathname } from 'next/navigation';
import { useStaticConfig } from './useStaticConfig';

/* Hook to get the current URL. */
function useCurrentUrl(): URL {
  const { baseUrl } = useStaticConfig();
  const pathname = usePathname();
  return new URL(pathname, baseUrl);
}

export default useCurrentUrl;
