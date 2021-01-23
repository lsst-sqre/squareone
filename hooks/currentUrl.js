/* Hook to get the current URL */

import { useRouter } from 'next/router';

export const useCurrentUrl = (baseUrl) => {
  const router = useRouter();
  return new URL(router.pathname, baseUrl);
};
