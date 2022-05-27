import useSWR from 'swr';

const fetcher = (...args) => fetch(...args).then((res) => res.json());

function useTimesSquarePage(pageUrl) {
  const { data, error } = useSWR(pageUrl, fetcher);

  return {
    error: error,
    loading: !error && !data,
    title: data ? data.title : null,
    parameters: data ? data.parameters : null,
    description: data ? data.description : null,
    htmlUrl: data ? data.html_url : null,
    htmlStatusUrl: data ? data.html_status_url : null,
  };
}

export default useTimesSquarePage;
