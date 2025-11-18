import dynamic from 'next/dynamic';
import React from 'react';

type BroadcastBannerStackProps = {
  semaphoreUrl?: string;
};

// Dynamic import with SSR disabled to prevent SWR hook issues
const BroadcastBannerStackClient = dynamic(
  () => import('./BroadcastBannerStackClient'),
  {
    ssr: false,
    loading: () => <></>, // No loading state needed for broadcasts
  }
);

export default function BroadcastBannerStack({
  semaphoreUrl,
}: BroadcastBannerStackProps) {
  return <BroadcastBannerStackClient semaphoreUrl={semaphoreUrl} />;
}
