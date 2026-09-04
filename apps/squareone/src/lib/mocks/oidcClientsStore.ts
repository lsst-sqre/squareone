// In-memory dev store for Gafaelfawr's OpenID Connect clients.
//
// Backs the dev mocks of the OIDC client API (`/auth/api/v1/oidc-clients*`) so
// the `/admin/oidc-clients` pages — and the full create / read / update /
// delete cycle behind them — are exercisable without a live Gafaelfawr, which
// is doubly useful here because most environments do not even have the OpenID
// Connect server enabled.
//
// Seeds from the shared `mockOidcClients` fixtures in
// `@lsst-sqre/gafaelfawr-client`, so the dev server, the package's tests, and
// any Storybook stories all show the same clients. It is colocated with the
// rest of the dev tooling so it never reaches the production build.

import {
  mockOidcClients,
  type OIDCClient,
  type OIDCClientUpdate,
  type OIDCClientWithSecret,
} from '@lsst-sqre/gafaelfawr-client';

// Deep-cloned so mutations never write through to the shared fixtures.
let clients: OIDCClient[] = structuredClone(mockOidcClients);

// Monotonic counter for deterministic, collision-free ids within a dev session.
let counter = 0;

/**
 * Generate a client id shaped like the UUIDs Gafaelfawr assigns.
 *
 * Deterministic within a dev session rather than random, so a reloaded page
 * and a `curl` transcript agree on what was created. Generated ids use a
 * different prefix from the seeded fixtures and additionally skip any id
 * already in the store: a collision would let the new client shadow an
 * existing one, so deleting it would appear to resurrect the old client.
 *
 * Advances the shared counter, which {@link generateClientSecret} then reads.
 */
function generateClientId(): string {
  let candidate: string;
  do {
    counter += 1;
    candidate = `deadbeef-0000-4000-8000-${String(counter).padStart(12, '0')}`;
  } while (clients.some((client) => client.client_id === candidate));
  return candidate;
}

/**
 * Generate a client secret.
 *
 * Long enough to look like the real thing in the "copy this now" UI, and
 * deterministic for the same reason as {@link generateClientId}.
 */
function generateClientSecret(): string {
  return `dev-oidc-secret-${String(counter).padStart(4, '0')}-${'x'.repeat(24)}`;
}

/** Return every registered client, most-recently-created first. */
export function getDevOidcClients(): OIDCClient[] {
  return clients;
}

/** Return the client with the given id, or undefined if there is none. */
export function getDevOidcClientById(clientId: string): OIDCClient | undefined {
  return clients.find((client) => client.client_id === clientId);
}

/**
 * Register a new client and return it with its one-time secret.
 *
 * Mirrors the server's create behavior: the server assigns `client_id`, the
 * timestamps, and the secret, attributing `last_modified_by` to the caller.
 *
 * @param update - The `{ return_uri, description, notes? }` create payload
 * @param actor - Username attributed as `last_modified_by` (the dev session
 *   username, standing in for the authenticated admin)
 * @returns The created client, including the secret Gafaelfawr discloses once
 */
export function addDevOidcClient(
  update: OIDCClientUpdate,
  actor: string
): OIDCClientWithSecret {
  const now = new Date().toISOString();
  const record: OIDCClient = {
    client_id: generateClientId(),
    return_uri: update.return_uri,
    description: update.description,
    notes: update.notes ?? null,
    // `url` is server-side metadata with no place in the update payload.
    url: null,
    last_modified_by: actor,
    created: now,
    last_modified: now,
  };
  clients.unshift(record);
  return { ...record, client_secret: generateClientSecret() };
}

/**
 * Apply an update to a client, returning the updated record.
 *
 * Returns undefined when no client has that id, so the route can answer 404.
 * The whole updatable state is replaced, matching Gafaelfawr's PATCH, which
 * requires `return_uri` and `description` on every call.
 */
export function updateDevOidcClient(
  clientId: string,
  update: OIDCClientUpdate,
  actor: string
): OIDCClient | undefined {
  const index = clients.findIndex((client) => client.client_id === clientId);
  if (index === -1) {
    return undefined;
  }
  const updated: OIDCClient = {
    ...clients[index],
    return_uri: update.return_uri,
    description: update.description,
    notes: update.notes ?? null,
    last_modified: new Date().toISOString(),
    last_modified_by: actor,
  };
  clients[index] = updated;
  return updated;
}

/** Delete a client by id. Returns true if a client was removed. */
export function deleteDevOidcClient(clientId: string): boolean {
  const index = clients.findIndex((client) => client.client_id === clientId);
  if (index === -1) {
    return false;
  }
  clients.splice(index, 1);
  return true;
}

/** Reset the store to its seeded state. Primarily for tests. */
export function resetDevOidcClients(): void {
  clients = structuredClone(mockOidcClients);
  counter = 0;
}
