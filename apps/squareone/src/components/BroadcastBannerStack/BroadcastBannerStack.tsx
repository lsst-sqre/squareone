import BroadcastBanner from './BroadcastBanner';
import useBroadcasts from './useBroadcasts';

type BroadcastBannerStackProps = {
  semaphoreUrl?: string;
};

export default function BroadcastBannerStack({
  semaphoreUrl,
}: BroadcastBannerStackProps) {
  const broadcastsUrl = semaphoreUrl ? `${semaphoreUrl}/v1/broadcasts` : null;
  const { broadcastData, error, isLoading } = useBroadcasts(semaphoreUrl);

  if (isLoading || error) {
    return <></>;
  } else {
    return (
      <>
        {broadcastData?.map((broadcast) => (
          <BroadcastBanner broadcast={broadcast} key={broadcast.id} />
        ))}
      </>
    );
  }
}
