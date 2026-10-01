import {
  mockDiscovery,
  type ServiceDiscovery,
} from '@lsst-sqre/repertoire-client';
import { describe, expect, it } from 'vitest';

import type { AppConfig } from './loader';
import {
  DEFAULT_ENVIRONMENT_NAME,
  DEFAULT_SITE_NAME,
  FALLBACK_BASE_URL,
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
    });
  });

  it('treats empty-string config values as unset', () => {
    const resolved = resolveConfigDefaults(
      { ...bareConfig, siteName: '', environmentName: '', baseUrl: '' },
      discovery3,
      null
    );
    expect(resolved).toMatchObject({
      siteName: 'US Rubin Science Platform',
      environmentName: 'idfprod',
      baseUrl: 'https://data.lsst.cloud',
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
