/**
 * Tests for the OpenID Connect client functions in `client.ts`.
 *
 * These live apart from `client.test.ts` because they drive a real msw server
 * rather than a `vi.stubGlobal('fetch')` double: the OIDC surface's contract is
 * mostly about HTTP details (methods, CSRF headers, status-code semantics,
 * empty 204 bodies) that a hand-rolled fetch stub cannot assert faithfully.
 * The two styles do not mix in one file — a global fetch stub would shadow
 * msw's interceptor.
 */
import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import {
  createOidcClient,
  deleteOidcClient,
  fetchOidcClient,
  fetchOidcClients,
  updateOidcClient,
} from './client';
import { GafaelfawrError, isOidcNotConfiguredError } from './errors';
import { mockOidcClients } from './mock-data';

const BASE = 'https://gafaelfawr.example.org/auth/api/v1';
const CSRF = 'csrf-token-value';

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

/** A Gafaelfawr `ErrorModel` body, as returned with 403/404/422. */
function errorModel(msg: string, loc?: string[]) {
  return { detail: [{ loc: loc ?? null, msg, type: 'error' }] };
}

describe('fetchOidcClients', () => {
  it('fetches and validates the client list', async () => {
    server.use(
      http.get(`${BASE}/oidc-clients`, () => HttpResponse.json(mockOidcClients))
    );

    const clients = await fetchOidcClients(BASE);

    expect(clients).toHaveLength(mockOidcClients.length);
    expect(clients[0].client_id).toBe(mockOidcClients[0].client_id);
  });

  it('sends session credentials', async () => {
    let credentials: RequestCredentials | undefined;
    server.use(
      http.get(`${BASE}/oidc-clients`, ({ request }) => {
        credentials = request.credentials;
        return HttpResponse.json([]);
      })
    );

    await fetchOidcClients(BASE);

    expect(credentials).toBe('include');
  });

  it('normalizes a trailing slash on the base URL', async () => {
    server.use(http.get(`${BASE}/oidc-clients`, () => HttpResponse.json([])));

    await expect(fetchOidcClients(`${BASE}/`)).resolves.toEqual([]);
  });

  it('raises a distinguishable error when the OIDC server is unconfigured', async () => {
    server.use(
      http.get(`${BASE}/oidc-clients`, () =>
        HttpResponse.json(errorModel('OpenID Connect server not configured'), {
          status: 404,
        })
      )
    );

    const error = await fetchOidcClients(BASE).catch((err: unknown) => err);

    expect(isOidcNotConfiguredError(error)).toBe(true);
    expect((error as GafaelfawrError).message).toBe(
      'OpenID Connect server not configured'
    );
  });

  it('raises a 403 as an ordinary error carrying the status', async () => {
    server.use(
      http.get(`${BASE}/oidc-clients`, () =>
        HttpResponse.json(errorModel('Permission denied'), { status: 403 })
      )
    );

    const error = await fetchOidcClients(BASE).catch((err: unknown) => err);

    expect(error).toBeInstanceOf(GafaelfawrError);
    expect(isOidcNotConfiguredError(error)).toBe(false);
    expect((error as GafaelfawrError).statusCode).toBe(403);
    expect((error as GafaelfawrError).message).toBe('Permission denied');
  });

  it('falls back to the status line when the error body is not an ErrorModel', async () => {
    server.use(
      http.get(`${BASE}/oidc-clients`, () =>
        HttpResponse.text('nope', { status: 500 })
      )
    );

    const error = await fetchOidcClients(BASE).catch((err: unknown) => err);

    expect((error as GafaelfawrError).statusCode).toBe(500);
    expect((error as GafaelfawrError).message).toContain('500');
  });

  it('rejects a response that drifts from the schema', async () => {
    server.use(
      http.get(`${BASE}/oidc-clients`, () =>
        HttpResponse.json([{ client_id: 'only-an-id' }])
      )
    );

    await expect(fetchOidcClients(BASE)).rejects.toThrow();
  });
});

describe('fetchOidcClient', () => {
  it('fetches a single client', async () => {
    server.use(
      http.get(`${BASE}/oidc-clients/:clientId`, ({ params }) => {
        expect(params.clientId).toBe(mockOidcClients[0].client_id);
        return HttpResponse.json(mockOidcClients[0]);
      })
    );

    const client = await fetchOidcClient(mockOidcClients[0].client_id, BASE);

    expect(client.description).toBe(mockOidcClients[0].description);
  });

  it('URL-encodes the client id', async () => {
    let path: string | undefined;
    server.use(
      http.get(`${BASE}/oidc-clients/:clientId`, ({ request }) => {
        path = new URL(request.url).pathname;
        return HttpResponse.json(mockOidcClients[0]);
      })
    );

    await fetchOidcClient('weird/id', BASE);

    expect(path).toBe('/auth/api/v1/oidc-clients/weird%2Fid');
  });

  it('raises a plain 404 for an unknown client, not the not-configured error', async () => {
    server.use(
      http.get(`${BASE}/oidc-clients/:clientId`, () =>
        HttpResponse.json(errorModel('OIDC client not found'), { status: 404 })
      )
    );

    const error = await fetchOidcClient('nope', BASE).catch(
      (err: unknown) => err
    );

    expect(error).toBeInstanceOf(GafaelfawrError);
    expect(isOidcNotConfiguredError(error)).toBe(false);
    expect((error as GafaelfawrError).statusCode).toBe(404);
    expect((error as GafaelfawrError).message).toBe('OIDC client not found');
  });

  it('raises a 403 carrying the status', async () => {
    server.use(
      http.get(`${BASE}/oidc-clients/:clientId`, () =>
        HttpResponse.json(errorModel('Permission denied'), { status: 403 })
      )
    );

    const error = await fetchOidcClient('any', BASE).catch(
      (err: unknown) => err
    );

    expect((error as GafaelfawrError).statusCode).toBe(403);
  });
});

describe('createOidcClient', () => {
  const update = {
    return_uri: 'https://rp.example.org/callback',
    description: 'New relying party',
    notes: null,
  };

  it('POSTs the update body with the CSRF header and returns the secret', async () => {
    let method: string | undefined;
    let csrf: string | null = null;
    let body: unknown;
    server.use(
      http.post(`${BASE}/oidc-clients`, async ({ request }) => {
        method = request.method;
        csrf = request.headers.get('x-csrf-token');
        body = await request.json();
        return HttpResponse.json(
          {
            ...mockOidcClients[0],
            ...update,
            client_secret: 'one-time-secret',
          },
          { status: 201 }
        );
      })
    );

    const created = await createOidcClient(update, CSRF, BASE);

    expect(method).toBe('POST');
    expect(csrf).toBe(CSRF);
    expect(body).toEqual(update);
    expect(created.client_secret).toBe('one-time-secret');
  });

  it('surfaces a 422 validation error message', async () => {
    server.use(
      http.post(`${BASE}/oidc-clients`, () =>
        HttpResponse.json(
          errorModel('URL scheme not permitted', ['body', 'return_uri']),
          { status: 422 }
        )
      )
    );

    const error = await createOidcClient(update, CSRF, BASE).catch(
      (err: unknown) => err
    );

    expect((error as GafaelfawrError).statusCode).toBe(422);
    expect((error as GafaelfawrError).message).toBe(
      'body.return_uri: URL scheme not permitted'
    );
  });

  it('raises the not-configured error on 404', async () => {
    server.use(
      http.post(`${BASE}/oidc-clients`, () =>
        HttpResponse.json(errorModel('OpenID Connect server not configured'), {
          status: 404,
        })
      )
    );

    const error = await createOidcClient(update, CSRF, BASE).catch(
      (err: unknown) => err
    );

    expect(isOidcNotConfiguredError(error)).toBe(true);
  });

  it('raises a 403 carrying the status', async () => {
    server.use(
      http.post(`${BASE}/oidc-clients`, () =>
        HttpResponse.json(errorModel('Permission denied'), { status: 403 })
      )
    );

    const error = await createOidcClient(update, CSRF, BASE).catch(
      (err: unknown) => err
    );

    expect((error as GafaelfawrError).statusCode).toBe(403);
    expect((error as GafaelfawrError).message).toBe('Permission denied');
  });

  it('rejects a created client that drifts from the schema', async () => {
    server.use(
      http.post(`${BASE}/oidc-clients`, () =>
        // No client_secret: the one field the create response must carry.
        HttpResponse.json(mockOidcClients[0], { status: 201 })
      )
    );

    await expect(createOidcClient(update, CSRF, BASE)).rejects.toThrow();
  });
});

describe('updateOidcClient', () => {
  const update = {
    return_uri: 'https://rp.example.org/callback2',
    description: 'Edited relying party',
    notes: 'Rotated the callback',
  };

  it('PATCHes the update body with the CSRF header', async () => {
    let method: string | undefined;
    let csrf: string | null = null;
    let body: unknown;
    server.use(
      http.patch(`${BASE}/oidc-clients/:clientId`, async ({ request }) => {
        method = request.method;
        csrf = request.headers.get('x-csrf-token');
        body = await request.json();
        return HttpResponse.json({ ...mockOidcClients[0], ...update });
      })
    );

    const updated = await updateOidcClient('client-1', update, CSRF, BASE);

    expect(method).toBe('PATCH');
    expect(csrf).toBe(CSRF);
    expect(body).toEqual(update);
    expect(updated.description).toBe('Edited relying party');
  });

  it('raises a plain 404 for an unknown client', async () => {
    server.use(
      http.patch(`${BASE}/oidc-clients/:clientId`, () =>
        HttpResponse.json(errorModel('OIDC client not found'), { status: 404 })
      )
    );

    const error = await updateOidcClient('nope', update, CSRF, BASE).catch(
      (err: unknown) => err
    );

    expect(isOidcNotConfiguredError(error)).toBe(false);
    expect((error as GafaelfawrError).statusCode).toBe(404);
  });

  it('surfaces a 422 validation error message', async () => {
    server.use(
      http.patch(`${BASE}/oidc-clients/:clientId`, () =>
        HttpResponse.json(
          errorModel('Field required', ['body', 'description']),
          { status: 422 }
        )
      )
    );

    const error = await updateOidcClient('client-1', update, CSRF, BASE).catch(
      (err: unknown) => err
    );

    expect((error as GafaelfawrError).statusCode).toBe(422);
    expect((error as GafaelfawrError).message).toBe(
      'body.description: Field required'
    );
  });

  it('raises a 403 carrying the status', async () => {
    server.use(
      http.patch(`${BASE}/oidc-clients/:clientId`, () =>
        HttpResponse.json(errorModel('Permission denied'), { status: 403 })
      )
    );

    const error = await updateOidcClient('client-1', update, CSRF, BASE).catch(
      (err: unknown) => err
    );

    expect((error as GafaelfawrError).statusCode).toBe(403);
  });
});

describe('deleteOidcClient', () => {
  it('DELETEs with the CSRF header and resolves on an empty 204', async () => {
    let method: string | undefined;
    let csrf: string | null = null;
    server.use(
      http.delete(`${BASE}/oidc-clients/:clientId`, ({ request }) => {
        method = request.method;
        csrf = request.headers.get('x-csrf-token');
        return new HttpResponse(null, { status: 204 });
      })
    );

    await expect(
      deleteOidcClient('client-1', CSRF, BASE)
    ).resolves.toBeUndefined();
    expect(method).toBe('DELETE');
    expect(csrf).toBe(CSRF);
  });

  it('raises a plain 404 for an unknown client', async () => {
    server.use(
      http.delete(`${BASE}/oidc-clients/:clientId`, () =>
        HttpResponse.json(errorModel('OIDC client not found'), { status: 404 })
      )
    );

    const error = await deleteOidcClient('nope', CSRF, BASE).catch(
      (err: unknown) => err
    );

    expect(isOidcNotConfiguredError(error)).toBe(false);
    expect((error as GafaelfawrError).statusCode).toBe(404);
    expect((error as GafaelfawrError).message).toBe('OIDC client not found');
  });

  it('raises a 403 carrying the status', async () => {
    server.use(
      http.delete(`${BASE}/oidc-clients/:clientId`, () =>
        HttpResponse.json(errorModel('Permission denied'), { status: 403 })
      )
    );

    const error = await deleteOidcClient('client-1', CSRF, BASE).catch(
      (err: unknown) => err
    );

    expect((error as GafaelfawrError).statusCode).toBe(403);
  });
});
