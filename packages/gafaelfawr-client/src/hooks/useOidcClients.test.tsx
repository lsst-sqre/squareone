/**
 * Tests for the OpenID Connect client hooks.
 *
 * Drives msw rather than a `fetch` stub so the hooks exercise real status-code
 * and CSRF-header behavior end to end, including the "OIDC server not
 * configured" 404 that the list must present as its own state.
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
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

import { mockLoginInfo, mockOidcClients } from '../mock-data';
import { gafaelfawrKeys } from '../query-keys';

import { useCreateOidcClient } from './useCreateOidcClient';
import { useDeleteOidcClient } from './useDeleteOidcClient';
import { useOidcClient } from './useOidcClient';
import { useOidcClients } from './useOidcClients';
import { useUpdateOidcClient } from './useUpdateOidcClient';

// The hooks fall back to the relative default base URL when no repertoire URL
// is given; jsdom resolves that against its own origin.
const BASE = 'http://localhost:3000/auth/api/v1';

const server = setupServer(
  http.get(`${BASE}/login`, () => HttpResponse.json(mockLoginInfo))
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
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

/** Wait until the login-info query has produced a CSRF token. */
async function waitForCsrf(queryClient: QueryClient) {
  await waitFor(() => {
    expect(queryClient.getQueryData(gafaelfawrKeys.loginInfo())).toBeTruthy();
  });
}

describe('useOidcClients', () => {
  it('lists the registered clients under the list query key', async () => {
    server.use(
      http.get(`${BASE}/oidc-clients`, () => HttpResponse.json(mockOidcClients))
    );
    const { Wrapper, queryClient } = createWrapper();

    const { result } = renderHook(() => useOidcClients(), {
      wrapper: Wrapper,
    });

    await waitFor(() => {
      expect(result.current.clients).toHaveLength(mockOidcClients.length);
    });
    expect(result.current.isNotConfigured).toBe(false);
    expect(
      queryClient.getQueryData(gafaelfawrKeys.oidcClients('/auth/api/v1'))
    ).toHaveLength(mockOidcClients.length);
  });

  it('flags an unconfigured OIDC server rather than reporting a bare error', async () => {
    server.use(
      http.get(`${BASE}/oidc-clients`, () =>
        HttpResponse.json(
          {
            detail: [
              { msg: 'OpenID Connect server not configured', type: 'x' },
            ],
          },
          { status: 404 }
        )
      )
    );
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useOidcClients(undefined, { logger }), {
      wrapper: Wrapper,
    });

    await waitFor(() => {
      expect(result.current.isNotConfigured).toBe(true);
    });
    expect(result.current.clients).toBeUndefined();
  });

  it('surfaces a 403 as an ordinary error', async () => {
    server.use(
      http.get(`${BASE}/oidc-clients`, () =>
        HttpResponse.json(
          { detail: [{ msg: 'Permission denied', type: 'permission_denied' }] },
          { status: 403 }
        )
      )
    );
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useOidcClients(undefined, { logger }), {
      wrapper: Wrapper,
    });

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });
    expect(result.current.isNotConfigured).toBe(false);
    expect(result.current.error?.message).toBe('Permission denied');
  });
});

describe('useOidcClient', () => {
  it('fetches one client under the detail query key', async () => {
    const client = mockOidcClients[0];
    server.use(
      http.get(`${BASE}/oidc-clients/${client.client_id}`, () =>
        HttpResponse.json(client)
      )
    );
    const { Wrapper, queryClient } = createWrapper();

    const { result } = renderHook(() => useOidcClient(client.client_id), {
      wrapper: Wrapper,
    });

    await waitFor(() => {
      expect(result.current.client?.client_id).toBe(client.client_id);
    });
    expect(
      queryClient.getQueryData(
        gafaelfawrKeys.oidcClient('/auth/api/v1', client.client_id)
      )
    ).toBeTruthy();
  });

  it('stays idle without a client id', () => {
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useOidcClient(undefined), {
      wrapper: Wrapper,
    });

    expect(result.current.client).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
  });

  it('flags a missing client', async () => {
    server.use(
      http.get(`${BASE}/oidc-clients/nope`, () =>
        HttpResponse.json(
          { detail: [{ msg: 'OIDC client not found', type: 'not_found' }] },
          { status: 404 }
        )
      )
    );
    const { Wrapper } = createWrapper();

    const { result } = renderHook(
      () => useOidcClient('nope', undefined, { logger }),
      {
        wrapper: Wrapper,
      }
    );

    await waitFor(() => {
      expect(result.current.isNotFound).toBe(true);
    });
  });
});

describe('useCreateOidcClient', () => {
  const update = {
    return_uri: 'https://rp.example.org/callback',
    description: 'New relying party',
  };

  it('creates a client with the CSRF token and invalidates the list', async () => {
    let csrf: string | null = null;
    server.use(
      http.post(`${BASE}/oidc-clients`, async ({ request }) => {
        csrf = request.headers.get('x-csrf-token');
        return HttpResponse.json(
          { ...mockOidcClients[0], ...update, client_secret: 'one-time' },
          { status: 201 }
        );
      })
    );
    const { Wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useCreateOidcClient(), {
      wrapper: Wrapper,
    });
    await waitForCsrf(queryClient);

    let secret: string | undefined;
    await act(async () => {
      const created = await result.current.createOidcClient(update);
      secret = created.client_secret;
    });

    expect(secret).toBe('one-time');
    expect(csrf).toBe(mockLoginInfo.csrf);
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: gafaelfawrKeys.oidcClients('/auth/api/v1'),
    });
  });

  it('exposes a 422 as a status-carrying error', async () => {
    server.use(
      http.post(`${BASE}/oidc-clients`, () =>
        HttpResponse.json(
          {
            detail: [
              {
                loc: ['body', 'return_uri'],
                msg: 'URL scheme not permitted',
                type: 'value_error',
              },
            ],
          },
          { status: 422 }
        )
      )
    );
    const { Wrapper, queryClient } = createWrapper();

    const { result } = renderHook(() => useCreateOidcClient(), {
      wrapper: Wrapper,
    });
    await waitForCsrf(queryClient);

    await act(async () => {
      await result.current.createOidcClient(update).catch(() => undefined);
    });

    expect(result.current.error).toEqual({
      status: 422,
      message: 'body.return_uri: URL scheme not permitted',
      details: undefined,
    });

    act(() => {
      result.current.reset();
    });
    expect(result.current.error).toBeNull();
  });
});

describe('useUpdateOidcClient', () => {
  const update = {
    return_uri: 'https://rp.example.org/callback2',
    description: 'Edited relying party',
  };

  it('updates a client and invalidates both the list and its detail', async () => {
    let method: string | undefined;
    server.use(
      http.patch(`${BASE}/oidc-clients/client-1`, ({ request }) => {
        method = request.method;
        return HttpResponse.json({ ...mockOidcClients[0], ...update });
      })
    );
    const { Wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useUpdateOidcClient(), {
      wrapper: Wrapper,
    });
    await waitForCsrf(queryClient);

    await act(async () => {
      await result.current.updateOidcClient('client-1', update);
    });

    expect(method).toBe('PATCH');
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: gafaelfawrKeys.oidcClients('/auth/api/v1'),
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: gafaelfawrKeys.oidcClient('/auth/api/v1', 'client-1'),
    });
  });
});

describe('useDeleteOidcClient', () => {
  it('deletes a client, invalidates the list, and drops its detail entry', async () => {
    server.use(
      http.delete(
        `${BASE}/oidc-clients/client-1`,
        () => new HttpResponse(null, { status: 204 })
      )
    );
    const { Wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const removeSpy = vi.spyOn(queryClient, 'removeQueries');

    const { result } = renderHook(() => useDeleteOidcClient(), {
      wrapper: Wrapper,
    });
    await waitForCsrf(queryClient);

    await act(async () => {
      await result.current.deleteOidcClient('client-1');
    });

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: gafaelfawrKeys.oidcClients('/auth/api/v1'),
    });
    expect(removeSpy).toHaveBeenCalledWith({
      queryKey: gafaelfawrKeys.oidcClient('/auth/api/v1', 'client-1'),
    });
  });

  it('refuses to delete without a CSRF token', async () => {
    server.use(
      http.get(`${BASE}/login`, () =>
        HttpResponse.text('nope', { status: 401 })
      )
    );
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useDeleteOidcClient(), {
      wrapper: Wrapper,
    });

    await act(async () => {
      await expect(result.current.deleteOidcClient('client-1')).rejects.toThrow(
        /CSRF/
      );
    });
    expect(result.current.error?.status).toBe(401);
  });
});
