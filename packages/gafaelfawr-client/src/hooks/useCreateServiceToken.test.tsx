/**
 * Tests for the useCreateServiceToken hook.
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { mockLoginInfo } from '../mock-data';
import { gafaelfawrKeys } from '../query-keys';

import { useCreateServiceToken } from './useCreateServiceToken';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { Wrapper, queryClient };
}

/**
 * Mock fetch so that the login-info query resolves with a CSRF token and the
 * admin tokens endpoint returns a created token.
 */
function stubFetch(createdToken = 'gt-bot-service-token-xyz') {
  const fetchMock = vi.fn(
    async (
      input: RequestInfo | URL,
      _init?: RequestInit
    ): Promise<Response> => {
      const url = String(input);
      if (url.endsWith('/login')) {
        return new Response(JSON.stringify(mockLoginInfo), { status: 200 });
      }
      if (url.endsWith('/tokens')) {
        return new Response(JSON.stringify({ token: createdToken }), {
          status: 200,
        });
      }
      throw new Error(`Unexpected fetch: ${url}`);
    }
  );
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('useCreateServiceToken', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('exposes the expected return shape', () => {
    stubFetch();
    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useCreateServiceToken(), {
      wrapper: Wrapper,
    });

    expect(typeof result.current.createServiceToken).toBe('function');
    expect(result.current.isCreating).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.reset).toBe('function');
  });

  it('creates a service token using the CSRF token from login info', async () => {
    const fetchMock = stubFetch();
    const { Wrapper, queryClient } = createWrapper();
    const { result } = renderHook(() => useCreateServiceToken(), {
      wrapper: Wrapper,
    });

    // Wait for the login-info query (CSRF source) to resolve.
    await waitFor(() => {
      expect(queryClient.getQueryData(gafaelfawrKeys.loginInfo())).toBeTruthy();
    });

    let token: string | undefined;
    await act(async () => {
      const response = await result.current.createServiceToken({
        username: 'bot-example',
        tokenName: 'CI token',
        scopes: ['read:tap'],
        expires: null,
      });
      token = response.token;
    });

    expect(token).toBe('gt-bot-service-token-xyz');

    const postCall = fetchMock.mock.calls.find(([url]) =>
      String(url).endsWith('/tokens')
    );
    expect(postCall).toBeDefined();
    const init = postCall?.[1] as RequestInit;
    const headers = init.headers as Record<string, string>;
    expect(init.method).toBe('POST');
    expect(headers['x-csrf-token']).toBe(mockLoginInfo.csrf);
    const body = JSON.parse(init.body as string);
    expect(body.token_type).toBe('service');
    expect(body.username).toBe('bot-example');
  });

  it("invalidates the bot user's token list on success", async () => {
    stubFetch();
    const { Wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useCreateServiceToken(), {
      wrapper: Wrapper,
    });

    await waitFor(() => {
      expect(queryClient.getQueryData(gafaelfawrKeys.loginInfo())).toBeTruthy();
    });

    await act(async () => {
      await result.current.createServiceToken({
        username: 'bot-example',
        tokenName: 'CI token',
        scopes: ['read:tap'],
        expires: null,
      });
    });

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: gafaelfawrKeys.tokensList('bot-example'),
    });
  });
});
