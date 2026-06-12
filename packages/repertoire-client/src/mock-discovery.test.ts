import { describe, expect, it } from 'vitest';
import { mockDiscovery } from './mock-discovery';
import { createDiscoveryQuery } from './query';
import { DiscoverySchema } from './schemas';

/**
 * These tests pin the refreshed mock to the live Repertoire 2.0.0 discovery
 * shape (datasets dp1/dp02/dp03 with real service + semantic version keys), so
 * downstream slices test against realistic data.
 */
describe('mockDiscovery (Repertoire 2.0.0 shape)', () => {
  it('parses cleanly against DiscoverySchema', () => {
    const result = DiscoverySchema.safeParse(mockDiscovery);
    expect(result.success).toBe(true);
  });

  it('models the live dp1/dp02/dp03 datasets', () => {
    expect(Object.keys(mockDiscovery.datasets).sort()).toEqual([
      'dp02',
      'dp03',
      'dp1',
    ]);
  });

  it('uses semantic version keys for dataset services', () => {
    const dp1 = mockDiscovery.datasets.dp1;

    // SIA surfaces the sia-query-2.0 /query URL.
    expect(dp1.services.sia.versions['sia-query-2.0'].url).toMatch(/\/query$/);
    // HiPS surfaces the hips-list-1.0 /list URL.
    expect(dp1.services.hips.versions['hips-list-1.0'].url).toMatch(/\/list$/);
    // SODA Cutout exposes sync + async versions.
    expect(dp1.services.cutout.versions['soda-sync-1.0'].url).toMatch(
      /\/sync$/
    );
    expect(dp1.services.cutout.versions['soda-async-1.0'].url).toMatch(
      /\/jobs$/
    );
    // TAP carries a VOSI tables version key.
    expect(dp1.services.tap.versions.tables).toBeDefined();
    // GMS carries the gms-search-1.0 version key.
    expect(dp1.services.gms.versions['gms-search-1.0']).toBeDefined();
  });

  it('includes the datalink and gms services', () => {
    expect(mockDiscovery.datasets.dp1.services.datalink).toBeDefined();
    expect(
      mockDiscovery.datasets.dp1.services.datalink.versions[
        'datalink-links-1.1'
      ]
    ).toBeDefined();
    expect(mockDiscovery.datasets.dp1.services.gms).toBeDefined();
  });

  it('routes dp03 TAP through the SSO TAP endpoint', () => {
    expect(mockDiscovery.datasets.dp03.services.tap.url).toMatch(/\/ssotap$/);
    // dp03 is catalog-only: no image services.
    expect(mockDiscovery.datasets.dp03.services.sia).toBeUndefined();
    expect(mockDiscovery.datasets.dp03.services.hips).toBeUndefined();
    expect(mockDiscovery.datasets.dp03.services.cutout).toBeUndefined();
  });

  it('keeps internal gafaelfawr/times-square on v1 so helpers resolve', () => {
    const query = createDiscoveryQuery(mockDiscovery);
    expect(query.getGafaelfawrUrl()).toMatch(/\/v1$/);
    expect(query.getTimesSquareUrl()).toMatch(/\/v1$/);
    // UI + internal helpers used by Header nav / banners still resolve.
    expect(query.getPortalUrl()).toBeDefined();
    expect(query.getNubladoUrl()).toBeDefined();
    expect(query.getSemaphoreUrl()).toBeDefined();
  });
});
