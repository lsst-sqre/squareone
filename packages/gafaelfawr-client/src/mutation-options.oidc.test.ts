/**
 * Tests for the OpenID Connect mutation configurations.
 *
 * Kept apart from `mutation-options.test.ts` because msw and a global `fetch`
 * stub cannot share a file.
 */
import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { mockOidcClients } from './mock-data';
import {
  createOidcClientMutationConfig,
  deleteOidcClientMutationConfig,
  updateOidcClientMutationConfig,
} from './mutation-options';
import { gafaelfawrKeys } from './query-keys';

const BASE = 'https://gafaelfawr.example.org/auth/api/v1';
const CSRF = 'csrf-token-value';

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const update = {
  return_uri: 'https://rp.example.org/callback',
  description: 'A relying party',
  notes: null,
};

describe('createOidcClientMutationConfig', () => {
  it('creates the client and returns its one-time secret', async () => {
    server.use(
      http.post(`${BASE}/oidc-clients`, () =>
        HttpResponse.json(
          { ...mockOidcClients[0], ...update, client_secret: 'one-time' },
          { status: 201 }
        )
      )
    );

    const created = await createOidcClientMutationConfig.mutationFn({
      request: update,
      csrfToken: CSRF,
      baseUrl: BASE,
    });

    expect(created.client_secret).toBe('one-time');
  });

  it('invalidates the deployment client list', () => {
    expect(createOidcClientMutationConfig.getInvalidateKeys(BASE)).toEqual([
      gafaelfawrKeys.oidcClients(BASE),
    ]);
  });
});

describe('updateOidcClientMutationConfig', () => {
  it('updates the client', async () => {
    server.use(
      http.patch(`${BASE}/oidc-clients/:clientId`, () =>
        HttpResponse.json({ ...mockOidcClients[0], ...update })
      )
    );

    const updated = await updateOidcClientMutationConfig.mutationFn({
      clientId: mockOidcClients[0].client_id,
      request: update,
      csrfToken: CSRF,
      baseUrl: BASE,
    });

    expect(updated.description).toBe('A relying party');
  });

  it('invalidates both the list and the edited client detail', () => {
    expect(
      updateOidcClientMutationConfig.getInvalidateKeys(BASE, 'abc')
    ).toEqual([
      gafaelfawrKeys.oidcClients(BASE),
      gafaelfawrKeys.oidcClient(BASE, 'abc'),
    ]);
  });
});

describe('deleteOidcClientMutationConfig', () => {
  it('deletes the client', async () => {
    server.use(
      http.delete(
        `${BASE}/oidc-clients/:clientId`,
        () => new HttpResponse(null, { status: 204 })
      )
    );

    await expect(
      deleteOidcClientMutationConfig.mutationFn({
        clientId: 'abc',
        csrfToken: CSRF,
        baseUrl: BASE,
      })
    ).resolves.toBeUndefined();
  });

  it('invalidates the list and removes the deleted client detail', () => {
    expect(deleteOidcClientMutationConfig.getInvalidateKeys(BASE)).toEqual([
      gafaelfawrKeys.oidcClients(BASE),
    ]);
    expect(deleteOidcClientMutationConfig.getRemoveKeys(BASE, 'abc')).toEqual([
      gafaelfawrKeys.oidcClient(BASE, 'abc'),
    ]);
  });
});
