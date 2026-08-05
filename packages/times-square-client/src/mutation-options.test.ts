/**
 * Tests for Times Square mutation options factories.
 */
import {
  type MutationFunctionContext,
  QueryClient,
} from '@tanstack/react-query';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mockHtmlStatusFailed } from './mock-data';
import { rerunPageMutationOptions } from './mutation-options';
import { timesSquareKeys } from './query-keys';

const deleteResponse = {
  html_url: 'https://example.com/v1/pages/summit-weather/html',
  html_events_url: 'https://example.com/v1/pages/summit-weather/html/events',
};

/**
 * The mutation callback context, which these mutations ignore. TanStack passes
 * a real one at runtime; the tests only need it to satisfy the signatures.
 */
const callbackContext = {} as MutationFunctionContext;

/** Stub `fetch` with a successful soft-delete response. */
function stubDeleteOk() {
  const fetchMock = vi.fn().mockResolvedValue(
    new Response(JSON.stringify(deleteResponse), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  );
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('rerunPageMutationOptions', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('soft-deletes the page html for the page-name variables', async () => {
    const fetchMock = stubDeleteOk();
    const queryClient = new QueryClient();
    const options = rerunPageMutationOptions(queryClient);

    const result = await options.mutationFn?.(
      {
        pageName: 'summit-weather',
        params: { site: 'summit' },
        baseUrl: '/times-square/api/v1',
      },
      callbackContext
    );

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(
      '/times-square/api/v1/pages/summit-weather/html?site=summit'
    );
    expect(init).toMatchObject({ method: 'DELETE' });
    expect(result).toEqual(deleteResponse);
  });

  it('soft-deletes the given html URL for the html-url variables', async () => {
    const fetchMock = stubDeleteOk();
    const queryClient = new QueryClient();
    const options = rerunPageMutationOptions(queryClient);

    await options.mutationFn?.(
      {
        htmlUrl: 'https://example.com/v1/pages/summit-weather/html',
        params: { site: 'summit' },
      },
      callbackContext
    );

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(
      'https://example.com/v1/pages/summit-weather/html?site=summit'
    );
    expect(init).toMatchObject({ method: 'DELETE' });
  });

  it('invalidates the cached html status on success', async () => {
    const queryClient = new QueryClient();
    const variables = {
      pageName: 'summit-weather',
      params: { site: 'summit' },
    };
    // A terminal execution error is cached under both html-status key shapes:
    // the page-name shape and the direct-URL shape used by the viewer.
    const pageKey = timesSquareKeys.htmlStatusForPage(
      variables.pageName,
      variables.params
    );
    const urlKey = timesSquareKeys.htmlStatusByUrl(
      'https://example.com/v1/pages/summit-weather/htmlstatus',
      variables.params
    );
    queryClient.setQueryData(pageKey, mockHtmlStatusFailed);
    queryClient.setQueryData(urlKey, mockHtmlStatusFailed);

    const options = rerunPageMutationOptions(queryClient);
    await options.onSuccess?.(
      deleteResponse,
      variables,
      undefined,
      callbackContext
    );

    expect(queryClient.getQueryState(pageKey)?.isInvalidated).toBe(true);
    expect(queryClient.getQueryState(urlKey)?.isInvalidated).toBe(true);
  });

  it('leaves unrelated cached queries alone on success', async () => {
    const queryClient = new QueryClient();
    const pageMetadataKey = timesSquareKeys.page('summit-weather');
    queryClient.setQueryData(pageMetadataKey, { name: 'summit-weather' });

    const options = rerunPageMutationOptions(queryClient);
    await options.onSuccess?.(
      deleteResponse,
      { pageName: 'summit-weather' },
      undefined,
      callbackContext
    );

    expect(queryClient.getQueryState(pageMetadataKey)?.isInvalidated).toBe(
      false
    );
  });
});
