import {
  mockDiscovery,
  mockDiscovery2x,
  mockDiscoveryDataDev,
  type ServiceDiscovery,
} from '@lsst-sqre/repertoire-client';
import { describe, expect, it } from 'vitest';

import type { AppConfig } from './loader';
import {
  DEFAULT_ENVIRONMENT_NAME,
  DEFAULT_SITE_NAME,
  FALLBACK_BASE_URL,
  hasUnsetDefaultedKeys,
  needsRequestHeaders,
  resolveConfigDefaults,
} from './resolveConfigDefaults';

// A config with none of the discovery-backed keys set. Only the keys
// resolveConfigDefaults reads (plus one pass-through key) matter here.
const bareConfig = {
  siteDescription: 'Welcome',
  docsBaseUrl: 'https://rsp.lsst.io',
} as AppConfig;

const explicitConfig = {
  ...bareConfig,
  siteName: 'Configured Site',
  environmentName: 'configured-env',
  baseUrl: 'https://configured.example.org',
  timesSquareUrl: 'https://configured.example.org/times-square/api',
} as AppConfig;

// mockDiscovery follows Repertoire 3.0 (idfprod): environment.title is
// "US Rubin Science Platform", environment.label is "idfprod", and the
// squareone UI URL is "https://data.lsst.cloud/".
const discovery3: ServiceDiscovery = mockDiscovery;

// A Repertoire 2.x-shaped document: no environment object and no squareone
// UI service.
const discovery2: ServiceDiscovery = (() => {
  const d = structuredClone(mockDiscovery);
  delete d.environment;
  delete d.services.ui.squareone;
  return d;
})();

function makeHeaders(values: Record<string, string>): Headers {
  return new Headers(values);
}

describe('resolveConfigDefaults precedence', () => {
  it.each([
    ['config', explicitConfig, discovery3, 'Configured Site'],
    ['environment.title', bareConfig, discovery3, 'US Rubin Science Platform'],
    ['hardcoded (2.x discovery)', bareConfig, discovery2, DEFAULT_SITE_NAME],
    ['hardcoded (no discovery)', bareConfig, null, DEFAULT_SITE_NAME],
  ])('resolves siteName from %s', (_source, config, discovery, expected) => {
    expect(resolveConfigDefaults(config, discovery, null).siteName).toBe(
      expected
    );
  });

  it.each([
    ['config', explicitConfig, discovery3, 'configured-env'],
    ['environment.label', bareConfig, discovery3, 'idfprod'],
    [
      'hardcoded (2.x discovery)',
      bareConfig,
      discovery2,
      DEFAULT_ENVIRONMENT_NAME,
    ],
    ['hardcoded (no discovery)', bareConfig, null, DEFAULT_ENVIRONMENT_NAME],
  ])(
    'resolves environmentName from %s',
    (_source, config, discovery, expected) => {
      expect(
        resolveConfigDefaults(config, discovery, null).environmentName
      ).toBe(expected);
    }
  );

  it.each([
    ['config', explicitConfig, discovery3, 'https://configured.example.org'],
    [
      'the squareone UI service (trailing slash stripped)',
      bareConfig,
      discovery3,
      'https://data.lsst.cloud',
    ],
    [
      'the request headers (2.x discovery)',
      bareConfig,
      discovery2,
      'https://rsp.example.org',
    ],
    [
      'the request headers (no discovery)',
      bareConfig,
      null,
      'https://rsp.example.org',
    ],
  ])('resolves baseUrl from %s', (_source, config, discovery, expected) => {
    const headers = makeHeaders({
      'x-forwarded-proto': 'https',
      'x-forwarded-host': 'rsp.example.org',
      host: 'squareone.squareone.svc:8080',
    });
    expect(resolveConfigDefaults(config, discovery, headers).baseUrl).toBe(
      expected
    );
  });

  it('prefers explicit config values over discovery for every key', () => {
    const resolved = resolveConfigDefaults(explicitConfig, discovery3, null);
    expect(resolved).toMatchObject({
      siteName: 'Configured Site',
      environmentName: 'configured-env',
      baseUrl: 'https://configured.example.org',
      timesSquareUrl: 'https://configured.example.org/times-square/api',
    });
  });

  it('treats empty-string config values as unset', () => {
    const resolved = resolveConfigDefaults(
      {
        ...bareConfig,
        siteName: '',
        environmentName: '',
        baseUrl: '',
        timesSquareUrl: '',
      },
      discovery3,
      null
    );
    expect(resolved).toMatchObject({
      siteName: 'US Rubin Science Platform',
      environmentName: 'idfprod',
      baseUrl: 'https://data.lsst.cloud',
      timesSquareUrl: 'https://data.lsst.cloud/times-square/api',
    });
  });

  it('strips every trailing slash from the squareone UI URL', () => {
    const d = structuredClone(mockDiscovery);
    d.services.ui.squareone = {
      ...d.services.ui.squareone,
      url: 'https://data-dev.lsst.cloud//',
    };
    expect(resolveConfigDefaults(bareConfig, d, null).baseUrl).toBe(
      'https://data-dev.lsst.cloud'
    );
  });

  it('passes other config keys through unchanged', () => {
    const resolved = resolveConfigDefaults(bareConfig, discovery3, null);
    expect(resolved.siteDescription).toBe('Welcome');
    expect(resolved.docsBaseUrl).toBe('https://rsp.lsst.io');
  });

  it('does not mutate the input config', () => {
    const config = { ...bareConfig };
    resolveConfigDefaults(config, discovery3, null);
    expect(config).toEqual(bareConfig);
  });
});

describe('resolveConfigDefaults timesSquareUrl', () => {
  // Discovery without a times-square internal service, as in an environment
  // that doesn't deploy the times-square application.
  const withoutTimesSquare: ServiceDiscovery = (() => {
    const d = structuredClone(mockDiscovery);
    delete d.services.internal['times-square'];
    return d;
  })();

  it.each([
    [
      'config',
      explicitConfig,
      mockDiscoveryDataDev,
      'https://configured.example.org/times-square/api',
    ],
    [
      'the times-square internal service (3.x discovery)',
      bareConfig,
      mockDiscoveryDataDev,
      'https://data-dev.lsst.cloud/times-square/api',
    ],
    [
      'the times-square internal service (2.x discovery)',
      bareConfig,
      mockDiscovery2x,
      'https://data.lsst.cloud/times-square/api',
    ],
  ])('resolves from %s', (_source, config, discovery, expected) => {
    expect(resolveConfigDefaults(config, discovery, null).timesSquareUrl).toBe(
      expected
    );
  });

  it.each([
    ['discovery has no times-square service', withoutTimesSquare],
    ['there is no discovery', null],
  ])('stays unset when %s', (_desc, discovery) => {
    expect(
      resolveConfigDefaults(bareConfig, discovery, null).timesSquareUrl
    ).toBeUndefined();
  });

  it('strips every trailing slash from the service URL', () => {
    const d = structuredClone(mockDiscovery);
    d.services.internal['times-square'] = {
      ...d.services.internal['times-square'],
      url: 'https://data-dev.lsst.cloud/times-square/api//',
    };
    expect(resolveConfigDefaults(bareConfig, d, null).timesSquareUrl).toBe(
      'https://data-dev.lsst.cloud/times-square/api'
    );
  });
});

describe('resolveConfigDefaults baseUrl from request headers', () => {
  function baseUrlFrom(values: Record<string, string>): string {
    return resolveConfigDefaults(bareConfig, null, makeHeaders(values)).baseUrl;
  }

  it('uses X-Forwarded-Proto and X-Forwarded-Host', () => {
    expect(
      baseUrlFrom({
        'x-forwarded-proto': 'https',
        'x-forwarded-host': 'data.example.org',
        host: 'internal:3000',
      })
    ).toBe('https://data.example.org');
  });

  it('falls back to the Host header without X-Forwarded-Host', () => {
    expect(
      baseUrlFrom({ 'x-forwarded-proto': 'https', host: 'data.example.org' })
    ).toBe('https://data.example.org');
  });

  it('defaults the protocol to http without X-Forwarded-Proto', () => {
    expect(baseUrlFrom({ host: 'localhost:3000' })).toBe(
      'http://localhost:3000'
    );
  });

  it('uses the first entry of comma-separated forwarded headers', () => {
    expect(
      baseUrlFrom({
        'x-forwarded-proto': 'https, http',
        'x-forwarded-host': 'data.example.org, proxy.internal',
      })
    ).toBe('https://data.example.org');
  });

  it('keeps a non-default port in the origin', () => {
    expect(
      baseUrlFrom({
        'x-forwarded-proto': 'https',
        'x-forwarded-host': 'data.example.org:8443',
      })
    ).toBe('https://data.example.org:8443');
  });

  it('drops a default port from the origin', () => {
    expect(
      baseUrlFrom({
        'x-forwarded-proto': 'https',
        'x-forwarded-host': 'data.example.org:443',
      })
    ).toBe('https://data.example.org');
  });

  it('ignores an X-Forwarded-Proto that is not http or https', () => {
    expect(
      baseUrlFrom({
        'x-forwarded-proto': 'javascript',
        host: 'data.example.org',
      })
    ).toBe('http://data.example.org');
  });

  it.each([
    ['a path', 'data.example.org/evil'],
    ['userinfo', 'user@data.example.org'],
    ['a query', 'data.example.org?x=1'],
    ['whitespace', 'data example.org'],
  ])('rejects a host containing %s', (_desc, host) => {
    expect(baseUrlFrom({ host })).toBe(FALLBACK_BASE_URL);
  });

  it('uses the fallback base URL without any host header', () => {
    expect(baseUrlFrom({ 'x-forwarded-proto': 'https' })).toBe(
      FALLBACK_BASE_URL
    );
  });

  it('uses the fallback base URL when headers were not read', () => {
    expect(resolveConfigDefaults(bareConfig, null, null).baseUrl).toBe(
      FALLBACK_BASE_URL
    );
  });
});

describe('needsRequestHeaders', () => {
  it('is false when config sets baseUrl', () => {
    expect(needsRequestHeaders(explicitConfig, null)).toBe(false);
  });

  it('is false when discovery has a squareone UI URL', () => {
    expect(needsRequestHeaders(bareConfig, discovery3)).toBe(false);
  });

  it('is true when neither config nor discovery supplies baseUrl', () => {
    expect(needsRequestHeaders(bareConfig, discovery2)).toBe(true);
    expect(needsRequestHeaders(bareConfig, null)).toBe(true);
  });
});

describe('hasUnsetDefaultedKeys', () => {
  it('is false when config sets every discovery-backed key', () => {
    expect(hasUnsetDefaultedKeys(explicitConfig)).toBe(false);
  });

  it.each([
    'siteName',
    'environmentName',
    'baseUrl',
    'timesSquareUrl',
  ] as const)('is true when only %s is unset', (key) => {
    expect(hasUnsetDefaultedKeys({ ...explicitConfig, [key]: undefined })).toBe(
      true
    );
  });
});
