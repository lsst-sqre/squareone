import { describe, expect, it } from 'vitest';
import discovery21 from './__fixtures__/discovery-2.1.0-data.json';
import discovery30 from './__fixtures__/discovery-3.0.0-data-dev.json';
import { mockDiscovery2x, mockDiscoveryDataDev } from './index';
import { DiscoverySchema } from './schemas';

/**
 * `mockDiscoveryDataDev` is the live data-dev (idfdev) Repertoire 3.0.0
 * response, parsed. The admin overview's acceptance criteria are written
 * against it, so these tests pin the facts they rely on.
 */
describe('mockDiscoveryDataDev (live data-dev, Repertoire 3.0.0)', () => {
  it('is the data-dev fixture parsed through DiscoverySchema', () => {
    expect(mockDiscoveryDataDev).toEqual(DiscoverySchema.parse(discovery30));
  });

  it('describes the idfdev environment', () => {
    expect(mockDiscoveryDataDev.environment?.label).toBe('idfdev');
    expect(mockDiscoveryDataDev.environment?.docs_url).toBe(
      'https://phalanx.lsst.io/environments/idfdev/'
    );
  });

  it('lists 41 enabled applications', () => {
    expect(mockDiscoveryDataDev.applications).toHaveLength(41);
  });

  it('exposes the Argo CD, Chronograf, and Kafdrop UI services', () => {
    const { ui } = mockDiscoveryDataDev.services;

    expect(ui.argocd).toBeDefined();
    expect(ui.chronograf).toBeDefined();
    expect(ui.kafdrop).toBeDefined();
  });

  it('has five datasets and one local InfluxDB database', () => {
    expect(Object.keys(mockDiscoveryDataDev.datasets)).toHaveLength(5);

    const influx = Object.values(mockDiscoveryDataDev.influxdb_databases);
    expect(influx).toHaveLength(1);
    expect(influx[0].local).toBe(true);
  });
});

/**
 * `mockDiscovery2x` is the production (data.lsst.cloud) Repertoire 2.1.0
 * response, parsed: the shape an environment still on Repertoire 2.x serves,
 * for exercising the fallbacks when the 3.0.0 metadata is absent.
 */
describe('mockDiscovery2x (live data.lsst.cloud, Repertoire 2.1.0)', () => {
  it('is the 2.1.0 fixture parsed through DiscoverySchema', () => {
    expect(mockDiscovery2x).toEqual(DiscoverySchema.parse(discovery21));
  });

  it('has no environment, only the deprecated environment_name', () => {
    expect(mockDiscovery2x.environment).toBeUndefined();
    expect(mockDiscovery2x.environment_name).toBe('data.lsst.cloud');
  });

  it('has no service titles or docs URLs', () => {
    const services = [
      ...Object.values(mockDiscovery2x.services.ui),
      ...Object.values(mockDiscovery2x.services.internal),
    ];

    expect(services.length).toBeGreaterThan(0);
    for (const service of services) {
      expect(service.title).toBeUndefined();
      expect(service.docs_url).toBeUndefined();
    }
  });
});
