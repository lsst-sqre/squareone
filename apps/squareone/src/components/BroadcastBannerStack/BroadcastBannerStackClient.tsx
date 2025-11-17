/* Client-only BroadcastBannerStack component - uses SWR without SSR conflicts */

import { useEffect, useState } from 'react';
import BroadcastBanner from './BroadcastBanner';
import useBroadcasts from './useBroadcasts';

type BroadcastBannerStackClientProps = {
  semaphoreUrl?: string;
};

export default function BroadcastBannerStackClient({
  semaphoreUrl,
}: BroadcastBannerStackClientProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const { broadcastData, error, isLoading } = useBroadcasts(semaphoreUrl);

  // Don't render anything until client-side hydration
  if (!isClient) {
    return null;
  }

  if (isLoading || error) {
    return null;
  }

  return (
    <>
      {broadcastData?.map((broadcast) => (
        <BroadcastBanner broadcast={broadcast} key={broadcast.id} />
      ))}
    </>
  );
}
