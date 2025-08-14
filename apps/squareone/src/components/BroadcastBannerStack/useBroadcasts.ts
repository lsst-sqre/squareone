import useSWR from 'swr';

type BroadcastCategory = 'info' | 'outage' | 'notice' | 'maintenance' | 'other';

type BroadcastContent = {
  gfm: string;
  html: string;
};

type Broadcast = {
  id: string;
  summary: BroadcastContent;
  body?: BroadcastContent;
  active: boolean;
  enabled: boolean;
  stale: boolean;
  category: BroadcastCategory;
};

type UseBroadcastsReturn = {
  broadcastData?: Broadcast[];
  error?: Error;
  isLoading: boolean;
};

const fetcher = (...args: Parameters<typeof fetch>) =>
  fetch(...args).then((res) => res.json());

/*
 * A React hook for getting data from the Semaphore `/v1/broadcasts` endpoint.
 *
 * Uses SWR with SWRConfig fallback data to ensure SSR compatibility while
 * continuously refreshing the broadcast data every 60 seconds.
 */
function useBroadcasts(semaphoreUrl?: string): UseBroadcastsReturn {
  const broadcastsUrl = semaphoreUrl ? `${semaphoreUrl}/v1/broadcasts` : null;
  const { data, error } = useSWR<Broadcast[]>(broadcastsUrl, fetcher, {
    refreshInterval: 60000, // 60 seconds refresh interval
    revalidateOnFocus: true, // Keep background refresh behavior
    revalidateOnReconnect: true, // Refresh when network reconnects
  });

  const isLoading = !error && !data;

  return {
    broadcastData: data,
    error,
    isLoading,
  };
}

export default useBroadcasts;
