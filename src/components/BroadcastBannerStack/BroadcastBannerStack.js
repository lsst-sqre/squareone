import BroadcastBanner from './BroadcastBanner';
import useBroadcasts from './useBroadcasts';

export default function BroadcastBannerStack({ semaphoreUrl }) {
  const broadcastsUrl = semaphoreUrl ? `${semaphoreUrl}/v1/broadcasts` : null;
  const { broadcastData, error, isLoading } = useBroadcasts(semaphoreUrl);

  if (isLoading || error) {
    return <></>;
  } else {
    return (
      <>
        {broadcastData.map((broadcast) => (
          <BroadcastBanner broadcast={broadcast} key={broadcast.id} />
        ))}
      </>
    );
  }
}
