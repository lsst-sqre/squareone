import {
  mockOidcClients,
  OIDCClientSchema,
} from '@lsst-sqre/gafaelfawr-client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { getDevState, setDevState } from '@/lib/mocks/devstate';
import {
  getDevOidcClientById,
  resetDevOidcClients,
} from '@/lib/mocks/oidcClientsStore';

import { DELETE, GET, PATCH } from './route.dev';

const CLIENT_ID = mockOidcClients[0].client_id;
const BASE = 'http://localhost:3000/auth/api/v1/oidc-clients';

const initialDevState = getDevState();

const validBody = {
  return_uri: 'https://rp.example.org/new-callback',
  description: 'Renamed relying party',
};

/**
 * Build the route context Next.js passes, with its promised params.
 *
 * Next hands a route handler the URL-*decoded* segment, so `clientId` here is
 * the decoded id — the same value the `[id]` page receives for the same URL.
 */
function context(clientId: string) {
  return { params: Promise.resolve({ clientId }) };
}

function patchRequest(body: unknown, raw?: string) {
  return new Request(`${BASE}/${CLIENT_ID}`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: raw ?? JSON.stringify(body),
  });
}

beforeEach(() => {
  resetDevOidcClients();
  setDevState({ ...initialDevState });
});

afterEach(() => {
  resetDevOidcClients();
  setDevState({ ...initialDevState });
});

describe('GET /api/dev/gafaelfawr/v1/oidc-clients/:clientId', () => {
  it('returns the requested client', async () => {
    const response = await GET(new Request(BASE), context(CLIENT_ID));

    expect(response.status).toBe(200);
    const client = OIDCClientSchema.parse(await response.json());
    expect(client.client_id).toBe(CLIENT_ID);
  });

  it('answers 404 with an ErrorModel body for an unknown client', async () => {
    const response = await GET(new Request(BASE), context('nope'));

    expect(response.status).toBe(404);
    const body = (await response.json()) as { detail: { msg: string }[] };
    expect(body.detail[0].msg).toContain('nope');
  });

  it('takes the id Next already decoded rather than decoding it again', async () => {
    // A lone `%` survives Next's own decode and reaches the handler intact.
    // Decoding it a second time here would throw `URIError` and answer 500 —
    // a status the real API never returns for an id that simply does not
    // exist.
    const response = await GET(new Request(BASE), context('100% legacy'));

    expect(response.status).toBe(404);
    const body = (await response.json()) as { detail: { msg: string }[] };
    expect(body.detail[0].msg).toContain('100% legacy');
  });

  it('answers 403 without admin:oidc', async () => {
    setDevState({ scopes: [] });

    const response = await GET(new Request(BASE), context(CLIENT_ID));

    expect(response.status).toBe(403);
  });
});

describe('PATCH /api/dev/gafaelfawr/v1/oidc-clients/:clientId', () => {
  it('updates the stored client and echoes it back', async () => {
    const response = await PATCH(patchRequest(validBody), context(CLIENT_ID));

    expect(response.status).toBe(200);
    const client = OIDCClientSchema.parse(await response.json());
    expect(client.description).toBe('Renamed relying party');
    expect(client.last_modified_by).toBe(initialDevState.username);
    expect(getDevOidcClientById(CLIENT_ID)?.return_uri).toBe(
      validBody.return_uri
    );
  });

  it('answers 404 for an unknown client', async () => {
    const response = await PATCH(patchRequest(validBody), context('nope'));

    expect(response.status).toBe(404);
  });

  it('answers 422 for a schema-invalid body and leaves the client alone', async () => {
    const response = await PATCH(
      patchRequest({ return_uri: 'https://rp.example.org/cb' }),
      context(CLIENT_ID)
    );

    expect(response.status).toBe(422);
    const body = (await response.json()) as { detail: { loc: string[] }[] };
    expect(body.detail[0].loc).toEqual(['body', 'description']);
    expect(getDevOidcClientById(CLIENT_ID)?.description).toBe(
      mockOidcClients[0].description
    );
  });

  it('answers 422 for a malformed JSON body', async () => {
    const response = await PATCH(
      patchRequest(null, 'not json'),
      context(CLIENT_ID)
    );

    expect(response.status).toBe(422);
  });

  it('answers 403 without admin:oidc', async () => {
    setDevState({ scopes: [] });

    const response = await PATCH(patchRequest(validBody), context(CLIENT_ID));

    expect(response.status).toBe(403);
  });
});

describe('DELETE /api/dev/gafaelfawr/v1/oidc-clients/:clientId', () => {
  it('removes the client and answers 204 with no body', async () => {
    const response = await DELETE(new Request(BASE), context(CLIENT_ID));

    expect(response.status).toBe(204);
    expect(await response.text()).toBe('');
    expect(getDevOidcClientById(CLIENT_ID)).toBeUndefined();
  });

  it('answers 404 for an unknown client', async () => {
    const response = await DELETE(new Request(BASE), context('nope'));

    expect(response.status).toBe(404);
  });

  it('answers 403 without admin:oidc and leaves the client in place', async () => {
    setDevState({ scopes: [] });

    const response = await DELETE(new Request(BASE), context(CLIENT_ID));

    expect(response.status).toBe(403);
    expect(getDevOidcClientById(CLIENT_ID)).toBeDefined();
  });
});
