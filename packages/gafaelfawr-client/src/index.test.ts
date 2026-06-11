/**
 * Tests that the new service-token symbols are exported from the package's
 * public entry points.
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
