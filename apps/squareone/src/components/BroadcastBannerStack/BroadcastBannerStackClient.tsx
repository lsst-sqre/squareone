/* Client-only BroadcastBannerStack component - uses SWR without SSR conflicts */

import { useState, useEffect } from 'react';
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
    return <></>;
  }

  if (isLoading || error) {
    return <></>;
  }

  return (
    <>
      {broadcastData?.map((broadcast) => (
        <BroadcastBanner broadcast={broadcast} key={broadcast.id} />
      ))}
    </>
  );
}
