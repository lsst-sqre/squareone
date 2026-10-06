/**
 * Tests for the user-scopes hook.
 *
 * Drives msw so the hook exercises the real login-info request it derives the
 * scopes from in the browser, and the hydrated-entry path that answers the
 * first render without any request.
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';
import type { ReactNode } from 'react';
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { mockLoginInfo } from '../mock-data';
import { gafaelfawrKeys } from '../query-keys';

import { useUserScopes } from './useUserScopes';

// The hook falls back to the relative default base URL when no repertoire URL
// is given; jsdom resolves that against its own origin.
const BASE = 'http://localhost:3000/auth/api/v1';

const server = setupServer();
const loginRequests = vi.fn();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  loginRequests.mockClear();
});
afterAll(() => server.close());

/** A silent logger so expected failures do not spam the test output. */
const logger = { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() };

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { Wrapper, queryClient };
}

describe('useUserScopes', () => {
  it("derives a signed-in user's scopes from login info", async () => {
    server.use(
      http.get(`${BASE}/login`, () => {
        loginRequests();
        return HttpResponse.json(mockLoginInfo);
      })
    );
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useUserScopes(undefined, { logger }), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.isPending).toBe(false));
    expect(result.current.scopes).toEqual(mockLoginInfo.scopes);
    expect(loginRequests).toHaveBeenCalledTimes(1);
  });

  it('reports no scopes for an anonymous visitor', async () => {
    server.use(
      http.get(`${BASE}/login`, () => new HttpResponse(null, { status: 401 }))
    );
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useUserScopes(undefined, { logger }), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.isPending).toBe(false));
    expect(result.current.scopes).toBeUndefined();
    expect(result.current.error).toBeNull();
  });

  it('answers the first render from a hydrated entry without a request', () => {
    const { Wrapper, queryClient } = createWrapper();
    queryClient.setQueryData(gafaelfawrKeys.userScopes(), ['exec:admin']);

    const { result } = renderHook(() => useUserScopes(undefined, { logger }), {
      wrapper: Wrapper,
    });

    expect(result.current.scopes).toEqual(['exec:admin']);
    expect(result.current.isPending).toBe(false);
    expect(loginRequests).not.toHaveBeenCalled();
  });
});
