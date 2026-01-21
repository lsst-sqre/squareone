'use client';

/**
 * Hook for polling HTML rendering status.
 */
import { useQuery } from '@tanstack/react-query';

import { DEFAULT_TIMES_SQUARE_URL } from '../client';
import { htmlStatusQueryOptions } from '../query-options';

import { useTimesSquareUrl } from './useTimesSquareUrl';

/**
 * Options for useHtmlStatus hook.
 */
export type UseHtmlStatusOptions = {
  /** Repertoire URL for service discovery */
  repertoireUrl?: string;
};

/**
 * Return type for useHtmlStatus hook.
 */
export type UseHtmlStatusReturn = {
  /** Whether HTML is available for the current parameters */
  htmlAvailable: boolean;
  /** SHA256 hash of the HTML content (for change detection) */
  htmlHash: string | null;
  /** URL to fetch the rendered HTML */
  htmlUrl: string | null;
  /** Key for iframe to force re-render on content change */
  iframeKey: string;
  /** Whether the query is loading */
  isLoading: boolean;
  /** Error if the query failed */
  error: Error | null;
  /** Refetch the status */
  refetch: () => void;
};

/**
 * Poll HTML rendering status for a notebook page.
 *
 * This hook polls the HTML status endpoint every second to track
 * notebook execution progress. It provides an `iframeKey` that changes
 * when new HTML is available, which can be used as a React key to
 * force iframe re-rendering.
 *
 * @endpoint GET /times-square/v1/pages/{page}/htmlstatus
 *
 * @param pageName - Page name/slug
 * @param params - Optional notebook parameters to check status for
 * @param options - Hook options
 *
 * @example
 * ```tsx
 * function NotebookViewer({ pageName, params }: Props) {
 *   const { htmlAvailable, htmlUrl, iframeKey, isLoading } = useHtmlStatus(
 *     pageName,
 *     params
 *   );
 *
 *   if (isLoading) return <div>Loading...</div>;
 *   if (!htmlAvailable) return <div>Notebook is executing...</div>;
 *
 *   return (
 *     <iframe
 *       key={iframeKey}
 *       src={htmlUrl}
 *       title="Notebook output"
 *     />
 *   );
 * }
 * ```
 */
export function useHtmlStatus(
  pageName: string,
  params?: Record<string, string>,
  options?: UseHtmlStatusOptions
): UseHtmlStatusReturn {
  const { repertoireUrl } = options ?? {};
  const timesSquareUrl = useTimesSquareUrl(repertoireUrl);
  const effectiveUrl = repertoireUrl
    ? timesSquareUrl
    : DEFAULT_TIMES_SQUARE_URL;

  const { data, error, isLoading, refetch } = useQuery(
    htmlStatusQueryOptions(pageName, params, effectiveUrl)
  );

  // Use html_hash as iframe key when available, fallback to static string
  const iframeKey = data?.html_hash ?? 'html-not-available';

  return {
    htmlAvailable: data?.available ?? false,
    htmlHash: data?.html_hash ?? null,
    htmlUrl: data?.html_url ?? null,
    iframeKey,
    isLoading,
    error: error ?? null,
    refetch,
  };
}
