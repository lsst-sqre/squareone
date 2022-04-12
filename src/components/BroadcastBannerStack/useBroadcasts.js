import useSWR from 'swr';

const fetcher = (...args) => fetch(...args).then((res) => res.json());

/*
 * A React hook for getting data from the Semaphore `/v1/broadcasts` endpoint.
 *
 * This hook uses swr to continuously refresh the broadcast data.
 */
function useBroadcasts(semaphoreUrl) {
  const broadcastsUrl = semaphoreUrl ? `${semaphoreUrl}/v1/broadcasts` : null;
  const { data, error } = useSWR(broadcastsUrl, fetcher, {
    refreshInterval: 60000,
  });

  const isLoading = !error & !data;

  return {
    broadcastData: data,
    error,
    isLoading,
  };
}

export default useBroadcasts;
