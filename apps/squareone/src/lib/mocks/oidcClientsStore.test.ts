import {
  mockOidcClients,
  OIDCClientSchema,
  OIDCClientWithSecretSchema,
} from '@lsst-sqre/gafaelfawr-client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  addDevOidcClient,
  deleteDevOidcClient,
  getDevOidcClientById,
  getDevOidcClients,
  resetDevOidcClients,
  updateDevOidcClient,
} from './oidcClientsStore';

const update = {
  return_uri: 'https://rp.example.org/callback',
  description: 'A new relying party',
  notes: 'Created in dev',
};

beforeEach(() => {
  resetDevOidcClients();
});

afterEach(() => {
  resetDevOidcClients();
});

describe('getDevOidcClients', () => {
  it('is seeded from the shared mock clients', () => {
    const clients = getDevOidcClients();
    expect(clients).toHaveLength(mockOidcClients.length);
    expect(clients.map((c) => c.client_id)).toEqual(
      mockOidcClients.map((c) => c.client_id)
    );
  });

  it('returns records that satisfy the API schema', () => {
    for (const client of getDevOidcClients()) {
      expect(() => OIDCClientSchema.parse(client)).not.toThrow();
    }
  });

  it('does not write through to the shared fixtures', () => {
    addDevOidcClient(update, 'vera');
    expect(mockOidcClients).toHaveLength(2);
  });
});

describe('getDevOidcClientById', () => {
  it('finds a seeded client', () => {
    const id = mockOidcClients[0].client_id;
    expect(getDevOidcClientById(id)?.client_id).toBe(id);
  });

  it('returns undefined for an unknown id', () => {
    expect(getDevOidcClientById('nope')).toBeUndefined();
  });
});

describe('addDevOidcClient', () => {
  it('assigns an id, timestamps, and a one-time secret', () => {
    const created = addDevOidcClient(update, 'vera');

    expect(() => OIDCClientWithSecretSchema.parse(created)).not.toThrow();
    expect(created.client_id).toMatch(/^[0-9a-f-]{36}$/);
    expect(created.client_secret.length).toBeGreaterThan(16);
    expect(created.last_modified_by).toBe('vera');
    expect(created.created).toBe(created.last_modified);
    expect(created.notes).toBe('Created in dev');
    expect(created.url).toBeNull();
  });

  it('prepends the client to the list and makes it retrievable', () => {
    const created = addDevOidcClient(update, 'vera');

    expect(getDevOidcClients()).toHaveLength(mockOidcClients.length + 1);
    expect(getDevOidcClients()[0].client_id).toBe(created.client_id);
    expect(getDevOidcClientById(created.client_id)?.description).toBe(
      'A new relying party'
    );
  });

  it('does not store the secret on the readable record', () => {
    const created = addDevOidcClient(update, 'vera');
    expect(getDevOidcClientById(created.client_id)).not.toHaveProperty(
      'client_secret'
    );
  });

  it('assigns distinct ids to successive creates', () => {
    const first = addDevOidcClient(update, 'vera');
    const second = addDevOidcClient(update, 'vera');
    expect(first.client_id).not.toBe(second.client_id);
  });

  it('never reuses a seeded client id', () => {
    const seeded = mockOidcClients.map((client) => client.client_id);
    for (let i = 0; i < 5; i += 1) {
      expect(seeded).not.toContain(addDevOidcClient(update, 'vera').client_id);
    }
  });

  it('does not shadow a seeded client, so deleting the new one is clean', () => {
    const created = addDevOidcClient(update, 'vera');

    deleteDevOidcClient(created.client_id);

    expect(getDevOidcClientById(created.client_id)).toBeUndefined();
    expect(getDevOidcClients().map((c) => c.client_id)).toEqual(
      mockOidcClients.map((c) => c.client_id)
    );
  });

  it('defaults omitted notes to null', () => {
    const created = addDevOidcClient(
      { return_uri: update.return_uri, description: update.description },
      'vera'
    );
    expect(created.notes).toBeNull();
  });
});

describe('updateDevOidcClient', () => {
  it('replaces the updatable fields and re-stamps the modification', () => {
    const id = mockOidcClients[0].client_id;
    const original = getDevOidcClientById(id);

    const updated = updateDevOidcClient(
      id,
      {
        return_uri: 'https://rp.example.org/new-callback',
        description: 'Renamed',
      },
      'rubin'
    );

    expect(updated?.return_uri).toBe('https://rp.example.org/new-callback');
    expect(updated?.description).toBe('Renamed');
    // Omitted notes clear the field: PATCH carries the whole updatable state.
    expect(updated?.notes).toBeNull();
    expect(updated?.last_modified_by).toBe('rubin');
    expect(updated?.created).toBe(original?.created);
    expect(getDevOidcClientById(id)?.description).toBe('Renamed');
  });

  it('returns undefined for an unknown id', () => {
    expect(updateDevOidcClient('nope', update, 'vera')).toBeUndefined();
  });
});

describe('deleteDevOidcClient', () => {
  it('removes the client and reports success', () => {
    const id = mockOidcClients[0].client_id;

    expect(deleteDevOidcClient(id)).toBe(true);
    expect(getDevOidcClientById(id)).toBeUndefined();
    expect(getDevOidcClients()).toHaveLength(mockOidcClients.length - 1);
  });

  it('reports failure for an unknown id', () => {
    expect(deleteDevOidcClient('nope')).toBe(false);
  });
});

describe('resetDevOidcClients', () => {
  it('restores the seeded state', () => {
    addDevOidcClient(update, 'vera');
    deleteDevOidcClient(mockOidcClients[0].client_id);

    resetDevOidcClients();

    expect(getDevOidcClients().map((c) => c.client_id)).toEqual(
      mockOidcClients.map((c) => c.client_id)
    );
  });
});
