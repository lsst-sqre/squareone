import { describe, expect, it } from 'vitest';
import { mockDiscovery } from './mock-discovery';
import { createDiscoveryQuery } from './query';
import { DiscoverySchema } from './schemas';

/**
 * These tests pin the mock to the live Repertoire discovery shape (datasets
 * dp1/dp02/dp03/prompt with real service + semantic version keys) and to the
 * Repertoire 3.0.0 metadata (environment, titles, docs URLs, required scopes,
 * quota labels) that data-dev publishes, so downstream slices test against
 * realistic data.
 */
describe('mockDiscovery (Repertoire 3.0.0 shape)', () => {
  it('parses cleanly against DiscoverySchema', () => {
    const result = DiscoverySchema.safeParse(mockDiscovery);
    expect(result.success).toBe(true);
    // The mock is already in parsed (defaults-applied) form.
    if (result.success) {
      expect(result.data).toEqual(mockDiscovery);
    }
  });

  it('models the live dp1/dp02/dp03/prompt datasets', () => {
    expect(Object.keys(mockDiscovery.datasets).sort()).toEqual([
      'dp02',
      'dp03',
      'dp1',
      'prompt',
    ]);
  });

  it('describes its environment, consistent with environment_name', () => {
    const query = createDiscoveryQuery(mockDiscovery);
    const environment = query.getEnvironment();

    expect(environment?.label).toBe('idfprod');
    expect(environment?.title).toBeTruthy();
    expect(environment?.docs_url).toMatch(/^https:\/\/phalanx\.lsst\.io\//);
    expect(query.getEnvironmentName()).toBe(mockDiscovery.environment_name);
  });

  it('declares the data-dev UI service scopes', () => {
    const { ui } = mockDiscovery.services;

    expect(ui.portal.required_scopes).toEqual(['exec:portal']);
    expect(ui.nublado.required_scopes).toEqual(['exec:notebook']);
    expect(ui.kafdrop.required_scopes).toEqual(['exec:internal-tools']);
    expect(ui.webdav.required_scopes).toEqual(['write:files']);
    // Argo CD and Chronograf are not Gafaelfawr-gated.
    expect(ui.argocd.required_scopes).toEqual([]);
    expect(ui.chronograf.required_scopes).toEqual([]);
  });

  it('titles every UI service', () => {
    for (const [name, service] of Object.entries(mockDiscovery.services.ui)) {
      expect(service.title, name).toBeTruthy();
    }
    expect(mockDiscovery.services.ui.argocd.title).toBe('Argo CD');
  });

  it('exposes the squareone and comanage UI services', () => {
    const query = createDiscoveryQuery(mockDiscovery);

    expect(query.getSquareoneUrl()).toBe('https://data.lsst.cloud/');
    expect(query.getComanageUrl()).toBe('https://id.lsst.cloud/');
  });

  it('keeps Times Square an internal service only', () => {
    expect(mockDiscovery.services.internal['times-square']).toBeDefined();
    expect(mockDiscovery.services.ui['times-square']).toBeUndefined();
  });

  it('declares the data-dev quota labels', () => {
    const index = createDiscoveryQuery(mockDiscovery).getQuotaLabelIndex();

    expect(Object.keys(index).sort()).toEqual([
      'datalinker',
      'herald',
      'hips',
      'muster-quota',
      'sia',
      'tap',
      'vo-cutouts',
    ]);
    expect(index.tap?.serviceTitle).toBe('Table access protocol (TAP)');
    expect(index.tap?.labelTitle).toBe('TAP API calls');
    expect(index.sia?.labelTitle).toBe('Image requests');
    expect(index['vo-cutouts']?.labelTitle).toBe('SODA API calls');
    // Not flagged internal on data-dev.
    expect(index['muster-quota']?.internal).toBe(false);
  });

  it('models the prompt dataset without a docs_url', () => {
    const prompt = mockDiscovery.datasets.prompt;

    expect(prompt.docs_url).toBeUndefined();
    expect(prompt.description).toBeTruthy();
    expect(prompt.services.alerts.title).toBe('Alert retrieval');
    expect(prompt.services.tap.url).toMatch(/\/ppdbtap$/);
  });

  it('carries dataset service titles, docs URLs, and scopes', () => {
    const { dp1 } = mockDiscovery.datasets;

    expect(dp1.obscore_config).toMatch(/dp1\.yaml$/);
    expect(dp1.services.sia.title).toBe('Simple image access (SIA)');
    expect(dp1.services.sia.docs_url).toBe(
      'https://www.ivoa.net/documents/SIA/'
    );
    expect(dp1.services.sia.required_scopes).toEqual(['read:image']);
    expect(dp1.services.tap.required_scopes).toEqual(['read:tap']);
    expect(dp1.services.gms.required_scopes).toEqual([]);
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
