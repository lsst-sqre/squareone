/**
 * Tests that the package's public entry points export the symbols apps rely
 * on. A missing export here compiles fine inside the package but breaks every
 * consumer, so the barrels get their own coverage.
 */
import { describe, expect, it } from 'vitest';

import * as hooksIndex from './hooks';
import * as packageIndex from './index';

describe('package index exports', () => {
  it('exports the service-token schema, client fn, and mutation config', () => {
    expect(packageIndex.AdminTokenRequestSchema).toBeDefined();
    expect(packageIndex.createServiceToken).toBeDefined();
    expect(packageIndex.createServiceTokenMutationConfig).toBeDefined();
  });

  it('re-exports the useCreateServiceToken hook from the package index', () => {
    expect(packageIndex.useCreateServiceToken).toBeDefined();
  });
});

describe('hooks index exports', () => {
  it('exports the useCreateServiceToken hook', () => {
    expect(hooksIndex.useCreateServiceToken).toBeDefined();
  });
});

describe('OpenID Connect client exports', () => {
  it('exports the schemas and their client functions', () => {
    expect(packageIndex.OIDCClientSchema).toBeDefined();
    expect(packageIndex.OIDCClientWithSecretSchema).toBeDefined();
    expect(packageIndex.OIDCClientUpdateSchema).toBeDefined();
    expect(packageIndex.fetchOidcClients).toBeDefined();
    expect(packageIndex.fetchOidcClient).toBeDefined();
    expect(packageIndex.createOidcClient).toBeDefined();
    expect(packageIndex.updateOidcClient).toBeDefined();
    expect(packageIndex.deleteOidcClient).toBeDefined();
  });

  it('exports the not-configured error and its guard', () => {
    expect(packageIndex.OidcNotConfiguredError).toBeDefined();
    expect(packageIndex.isOidcNotConfiguredError).toBeDefined();
  });

  it('exports the query and mutation options', () => {
    expect(packageIndex.oidcClientsQueryOptions).toBeDefined();
    expect(packageIndex.oidcClientQueryOptions).toBeDefined();
    expect(packageIndex.createOidcClientMutationConfig).toBeDefined();
    expect(packageIndex.updateOidcClientMutationConfig).toBeDefined();
    expect(packageIndex.deleteOidcClientMutationConfig).toBeDefined();
  });

  it('exports the mock clients used to seed dev and story fixtures', () => {
    expect(packageIndex.mockOidcClients).toBeDefined();
  });

  it('exports the hooks from both the package and hooks indexes', () => {
    for (const index of [packageIndex, hooksIndex]) {
      expect(index.useOidcClients).toBeDefined();
      expect(index.useOidcClient).toBeDefined();
      expect(index.useCreateOidcClient).toBeDefined();
      expect(index.useUpdateOidcClient).toBeDefined();
      expect(index.useDeleteOidcClient).toBeDefined();
    }
  });
});
