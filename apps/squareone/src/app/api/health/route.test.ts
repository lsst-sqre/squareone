import { afterEach, describe, expect, it, vi } from 'vitest';

import { version } from '../../../../package.json';

// Every path to the YAML app config (including the RSC `getStaticConfig`
// wrapper) goes through `loadAppConfig`. Replace it with one that fails, as a
// broken ConfigMap would, so the tests can show the probe never touches it.
const { loadAppConfig } = vi.hoisted(() => ({
  loadAppConfig: vi.fn(async () => {
    throw new Error('config unavailable');
  }),
}));
vi.mock('@/lib/config/loader', () => ({ loadAppConfig }));

import * as route from './route';
import { dynamic, GET } from './route';

describe('GET /api/health', () => {
  const originalRelease = process.env.SENTRY_RELEASE;
  const originalVersion = process.env.SQUAREONE_VERSION;

  afterEach(() => {
    if (originalRelease === undefined) {
      delete process.env.SENTRY_RELEASE;
    } else {
      process.env.SENTRY_RELEASE = originalRelease;
    }
    if (originalVersion === undefined) {
      delete process.env.SQUAREONE_VERSION;
    } else {
      process.env.SQUAREONE_VERSION = originalVersion;
    }
  });

  it('responds 200 with an ok status', async () => {
    const response = GET();

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.status).toBe('ok');
  });

  it('reports the build version and revision', async () => {
    process.env.SQUAREONE_VERSION = 'tickets-DM-57212';
    process.env.SENTRY_RELEASE = 'abc1234';

    const body = await GET().json();

    expect(body).toEqual({
      status: 'ok',
      version: 'tickets-DM-57212',
      revision: 'abc1234',
    });
  });

  it('falls back to the package version and a null revision when unset', async () => {
    delete process.env.SQUAREONE_VERSION;
    delete process.env.SENTRY_RELEASE;

    const body = await GET().json();

    expect(body).toEqual({ status: 'ok', version, revision: null });
  });

  it('forbids caching of the response', () => {
    const response = GET();

    expect(response.headers.get('Cache-Control')).toBe('no-store');
  });

  it('is rendered on every request, never at build time', () => {
    expect(dynamic).toBe('force-dynamic');
  });

  it('makes no outbound requests', () => {
    // A probe must measure squareone itself, so the handler must not reach
    // Repertoire, Semaphore, Gafaelfawr or anything else over the network.
    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    GET();

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('stays healthy without loading the app config', () => {
    const response = GET();

    expect(response.status).toBe(200);
    expect(loadAppConfig).not.toHaveBeenCalled();
  });

  it('runs in the Node.js runtime, where its Sentry traces are dropped', () => {
    // Only the Node.js server's Sentry config excludes this route from tracing
    // (src/lib/sentry/tracesSampler.ts); sentry.edge.config.js does not.
    expect(route).not.toHaveProperty('runtime', 'edge');
  });
});
