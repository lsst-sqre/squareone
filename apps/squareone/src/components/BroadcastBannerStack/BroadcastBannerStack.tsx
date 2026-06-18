'use client';

import { useBroadcasts } from '@lsst-sqre/semaphore-client';
import { useSemaphoreUrl } from '@/hooks/useSemaphoreUrl';
import BroadcastBanner from './BroadcastBanner';

export default function BroadcastBannerStack() {
  const semaphoreUrl = useSemaphoreUrl();

  const { broadcasts, isPending, isError } = useBroadcasts(semaphoreUrl ?? '');

  if (!semaphoreUrl || isPending || isError || !broadcasts.length) {
    return null;
  }

  return (
    <>
      {broadcasts.map((broadcast) => (
        <BroadcastBanner broadcast={broadcast} key={broadcast.id} />
      ))}
    </>
  );
}
