'use client';

import { useBroadcasts } from '@lsst-sqre/semaphore-client';
import { useSemaphoreUrl } from '@/hooks/useSemaphoreUrl';
import BroadcastBanner from './BroadcastBanner';

export default function BroadcastBannerStack() {
  const semaphoreUrl = useSemaphoreUrl();

  const { broadcasts, isPending, isError } = useBroadcasts(semaphoreUrl ?? '');

  // ARIA polite/assertive live regions only reliably announce content that is
  // inserted after the region already exists in the DOM. Because broadcasts
  // arrive from a client-side fetch, we always render the two live-region
  // containers below — even while the fetch is pending, errored, or empty — so
  // that banners are announced when they are inserted. The banners themselves
  // carry no live-region role to avoid nested/duplicate live regions.
  const ready = Boolean(semaphoreUrl) && !isPending && !isError;
  const loadedBroadcasts = ready ? broadcasts : [];

  const outageBroadcasts = loadedBroadcasts.filter(
    (broadcast) => broadcast.category === 'outage'
  );
  const politeBroadcasts = loadedBroadcasts.filter(
    (broadcast) => broadcast.category !== 'outage'
  );

  return (
    <>
      {/* Assertive region for urgent outage broadcasts. */}
      <div role="alert" aria-live="assertive">
        {outageBroadcasts.map((broadcast) => (
          <BroadcastBanner broadcast={broadcast} key={broadcast.id} />
        ))}
      </div>
      {/* Polite region for info, notice, and any other broadcasts. */}
      {/* biome-ignore lint/a11y/useSemanticElements: <output> is for form calculation results, not a general polite live-region container for broadcast banners */}
      <div role="status" aria-live="polite">
        {politeBroadcasts.map((broadcast) => (
          <BroadcastBanner broadcast={broadcast} key={broadcast.id} />
        ))}
      </div>
    </>
  );
}
