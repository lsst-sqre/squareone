/**
 * TanStack Query mutation options factories for Times Square mutations.
 *
 * These mirror the `queryOptions` factories in `query-options.ts`: each factory
 * returns a plain options object that can be handed to `useMutation` (see the
 * `useRerunPage` hook) or driven directly from a `QueryClient`. Because a
 * mutation's cache side effects need a client, the factories take the
 * `QueryClient` as their first argument rather than reading it from context.
 */
import {
  type MutationOptions,
  mutationOptions,
  type QueryClient,
} from '@tanstack/react-query';

import {
  DEFAULT_TIMES_SQUARE_URL,
  deleteHtmlByUrl,
  deletePageHtml,
} from './client';
import { timesSquareKeys } from './query-keys';
import type { DeleteHtmlResponse } from './schemas';

/**
 * Identifies the page instance to re-run.
 *
 * Two call shapes are supported, mirroring the two html-status query options
 * ({@link htmlStatusQueryOptions} / {@link htmlStatusUrlQueryOptions}):
 *
 * - `{ pageName, params, baseUrl }` — build the endpoint from the page name.
 * - `{ htmlUrl, params }` — use a fully-formed `html_url` that the consumer
 *   already holds (e.g. from page metadata or an SSE event).
 */
export type RerunPageVariables =
  | {
      /** Page name/slug. */
      pageName: string;
      /** Notebook parameters identifying the page instance. */
      params?: Record<string, string>;
      /** Times Square base URL; defaults to {@link DEFAULT_TIMES_SQUARE_URL}. */
      baseUrl?: string;
    }
  | {
      /** Fully-formed `html_url` for the page instance. */
      htmlUrl: string;
      /** Notebook parameters to append to `htmlUrl`. */
      params?: Record<string, string>;
    };

/**
 * Mutation options for re-running a notebook page instance (DM-55470).
 *
 * The mutation soft-deletes the page instance's cached HTML
 * (`DELETE /v1/pages/{page}/html`), which clears any cached `execution_error`
 * and schedules a fresh execution.
 *
 * On success every html-status query is invalidated by its shared
 * `['times-square', 'html-status']` key prefix. That covers both key shapes —
 * {@link timesSquareKeys.htmlStatusForPage} and
 * {@link timesSquareKeys.htmlStatusByUrl} — which matters because the consumer
 * that holds an `html_url` generally cannot reconstruct the exact key of the
 * html-status query it needs to refresh. Invalidation drops the cached terminal
 * `execution_error`, so the polling that
 * `htmlStatusQueryOptions`/`htmlStatusUrlQueryOptions` stopped resumes on the
 * refetched (`execution_error: null`) status.
 *
 * @param queryClient - Client whose html-status queries are invalidated on success
 *
 * @example
 * ```ts
 * const queryClient = useQueryClient();
 * const { mutate } = useMutation(rerunPageMutationOptions(queryClient));
 * mutate({ pageName: 'summit-weather', params });
 * ```
 */
export const rerunPageMutationOptions = (
  queryClient: QueryClient
): MutationOptions<DeleteHtmlResponse, Error, RerunPageVariables> =>
  mutationOptions({
    mutationKey: timesSquareKeys.rerunPage(),
    mutationFn: (variables: RerunPageVariables) =>
      'htmlUrl' in variables
        ? deleteHtmlByUrl(variables.htmlUrl, variables.params)
        : deletePageHtml(
            variables.baseUrl ?? DEFAULT_TIMES_SQUARE_URL,
            variables.pageName,
            variables.params
          ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: timesSquareKeys.htmlStatus(),
      });
    },
  });
