'use client';

import { useBroadcasts } from '@lsst-sqre/semaphore-client';
import { useMemo } from 'react';
import { useSemaphoreUrl } from '@/hooks/useSemaphoreUrl';
import { makeReportError } from '@/lib/sentry/reportError';
import BroadcastBanner from './BroadcastBanner';

export default function BroadcastBannerStack() {
  const semaphoreUrl = useSemaphoreUrl();

  // Inject the app's Sentry-backed reporter so report-worthy broadcast
  // failures (e.g. the DM-55599 ZodError) reach Sentry with site context tags.
  // Client-side dedupe caps this at one capture per browser session despite
  // 60 s polling.
  const reportError = useMemo(() => makeReportError({ isServer: false }), []);

  const { broadcasts, isPending, isError } = useBroadcasts(semaphoreUrl ?? '', {
    reportError,
    context: { site: 'broadcasts', package: 'semaphore-client' },
  });

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
