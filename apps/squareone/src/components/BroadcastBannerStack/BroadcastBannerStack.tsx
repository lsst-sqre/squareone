'use client';

import { useServiceDiscovery } from '@lsst-sqre/repertoire-client';
import { useBroadcasts } from '@lsst-sqre/semaphore-client';
import { useRepertoireUrl } from '@/hooks/useRepertoireUrl';
import BroadcastBanner from './BroadcastBanner';

export default function BroadcastBannerStack() {
  const repertoireUrl = useRepertoireUrl();
  const { query: discoveryQuery } = useServiceDiscovery(repertoireUrl ?? '');
  const semaphoreUrl = discoveryQuery?.getSemaphoreUrl();

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
