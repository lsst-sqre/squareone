'use client';

/**
 * Hook for re-running a notebook page instance (HTML soft delete).
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import {
  type RerunPageVariables,
  rerunPageMutationOptions,
} from '../mutation-options';
import type { DeleteHtmlResponse } from '../schemas';

import { useTimesSquareUrl } from './useTimesSquareUrl';

/**
 * Options for the useRerunPage hook.
 */
export type UseRerunPageOptions = {
  /** Repertoire URL for service discovery. */
  repertoireUrl?: string;
};

/**
 * Return type for the useRerunPage hook.
 */
export type UseRerunPageReturn = {
  /** Request a re-run of the page instance identified by `variables`. */
  rerunPage: (variables: RerunPageVariables) => void;
  /** Promise-returning form of {@link UseRerunPageReturn.rerunPage}. */
  rerunPageAsync: (
    variables: RerunPageVariables
  ) => Promise<DeleteHtmlResponse>;
  /** Whether a re-run request is in flight. */
  isPending: boolean;
  /** Whether the last re-run request failed. */
  isError: boolean;
  /** Error from the last failed re-run request, or `null`. */
  error: Error | null;
  /** Clear the mutation's error/success state. */
  reset: () => void;
};

/**
 * Request a re-run of a notebook page instance.
 *
 * Soft-deletes the page instance's cached HTML, which clears a cached terminal
 * `execution_error` (DM-55470) and schedules a fresh execution. On success the
 * html-status queries are invalidated, so a viewer whose polling had stopped on
 * the terminal error refetches and resumes its normal cadence.
 *
 * @endpoint DELETE /times-square/v1/pages/{page}/html
 *
 * @param options - Hook options including the repertoire URL for discovery
 *
 * @example Re-running by page name
 * ```tsx
 * const { rerunPage, isPending } = useRerunPage({ repertoireUrl });
 *
 * <Button disabled={isPending} onClick={() => rerunPage({ pageName, params })}>
 *   Re-run
 * </Button>
 * ```
 *
 * @example Re-running from a known html_url
 * ```tsx
 * const { rerunPage } = useRerunPage();
 * rerunPage({ htmlUrl: htmlEvent.htmlUrl });
 * ```
 */
export function useRerunPage(
  options?: UseRerunPageOptions
): UseRerunPageReturn {
  const { repertoireUrl } = options ?? {};
  const baseUrl = useTimesSquareUrl(repertoireUrl);
  const queryClient = useQueryClient();

  const mutation = useMutation(rerunPageMutationOptions(queryClient));
  const { mutate, mutateAsync, reset } = mutation;

  // Fill in the discovered base URL when the caller passes page-name variables
  // without one, so consumers don't have to thread service discovery through
  // every call site. An explicit `baseUrl` always wins.
  const withBaseUrl = useCallback(
    (variables: RerunPageVariables): RerunPageVariables =>
      'htmlUrl' in variables
        ? variables
        : { ...variables, baseUrl: variables.baseUrl ?? baseUrl },
    [baseUrl]
  );

  const rerunPage = useCallback(
    (variables: RerunPageVariables) => mutate(withBaseUrl(variables)),
    [mutate, withBaseUrl]
  );

  const rerunPageAsync = useCallback(
    (variables: RerunPageVariables) => mutateAsync(withBaseUrl(variables)),
    [mutateAsync, withBaseUrl]
  );

  return {
    rerunPage,
    rerunPageAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error ?? null,
    reset,
  };
}
