import BroadcastBanner from './BroadcastBanner';
import { useFetch } from '../../hooks/fetch';

export default function BroadcastBannerStack({ semaphoreUrl }) {
  const broadcastsUrl = semaphoreUrl ? `${semaphoreUrl}/v1/broadcasts` : null;
  const { data: broadcastData } = useFetch(broadcastsUrl);

  return (
    <>
      {broadcastData.map((broadcast) => (
        <BroadcastBanner broadcast={broadcast} key={broadcast.id} />
      ))}
    </>
  );
}
