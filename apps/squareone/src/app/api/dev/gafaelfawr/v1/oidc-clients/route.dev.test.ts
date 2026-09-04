import {
  mockOidcClients,
  OIDCClientSchema,
  OIDCClientWithSecretSchema,
} from '@lsst-sqre/gafaelfawr-client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { getDevState, setDevState } from '@/lib/mocks/devstate';
import {
  getDevOidcClientById,
  resetDevOidcClients,
} from '@/lib/mocks/oidcClientsStore';

import { GET, POST } from './route.dev';

const BASE = 'http://localhost:3000/auth/api/v1/oidc-clients';

const initialDevState = getDevState();

const validBody = {
  return_uri: 'https://rp.example.org/callback',
  description: 'A new relying party',
  notes: 'Created from the dev panel',
};

function postRequest(body: unknown, raw?: string) {
  return new Request(BASE, {
    method: 'POST',
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

describe('GET /api/dev/gafaelfawr/v1/oidc-clients', () => {
  it('lists the stored clients', async () => {
    const response = await GET();

    expect(response.status).toBe(200);
    const clients = (await response.json()) as unknown[];
    expect(clients).toHaveLength(mockOidcClients.length);
    for (const client of clients) {
      expect(() => OIDCClientSchema.parse(client)).not.toThrow();
    }
  });

  it('answers 401 when the dev session is logged out', async () => {
    setDevState({ loggedIn: false });

    const response = await GET();

    expect(response.status).toBe(401);
  });

  it('answers 403 with an ErrorModel body without admin:oidc', async () => {
    setDevState({ scopes: ['admin:token'] });

    const response = await GET();

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({
      detail: [
        { loc: null, msg: 'Permission denied', type: 'permission_denied' },
      ],
    });
  });
});

describe('POST /api/dev/gafaelfawr/v1/oidc-clients', () => {
  it('creates a client and returns it with a one-time secret', async () => {
    const response = await POST(postRequest(validBody));

    expect(response.status).toBe(201);
    const created = OIDCClientWithSecretSchema.parse(await response.json());
    expect(created.description).toBe('A new relying party');
    expect(created.client_secret).toBeTruthy();
    // The dev session username stands in for the authenticated admin.
    expect(created.last_modified_by).toBe(initialDevState.username);

    const stored = getDevOidcClientById(created.client_id);
    expect(stored?.return_uri).toBe(validBody.return_uri);
    expect(stored).not.toHaveProperty('client_secret');
  });

  it('answers 422 for a body missing a required field', async () => {
    const response = await POST(postRequest({ description: 'No return URI' }));

    expect(response.status).toBe(422);
    const body = (await response.json()) as {
      detail: { loc: string[] }[];
    };
    expect(body.detail[0].loc).toEqual(['body', 'return_uri']);
  });

  it('answers 422 for an empty description', async () => {
    const response = await POST(
      postRequest({ return_uri: 'https://rp.example.org/cb', description: '' })
    );

    expect(response.status).toBe(422);
  });

  it('answers 422 for a malformed JSON body', async () => {
    const response = await POST(postRequest(null, 'not json'));

    expect(response.status).toBe(422);
  });

  it('answers 403 without admin:oidc and does not create anything', async () => {
    setDevState({ scopes: [] });

    const response = await POST(postRequest(validBody));

    expect(response.status).toBe(403);
  });
});
