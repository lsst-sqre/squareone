import { beforeEach, describe, expect, test, vi } from 'vitest';

// Mock only fetchServiceDiscovery; keep the real mock data and types from the
// client package.
vi.mock('@lsst-sqre/repertoire-client', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@lsst-sqre/repertoire-client')>();
  return {
    ...actual,
    fetchServiceDiscovery: vi.fn(),
  };
});

import {
  fetchServiceDiscovery,
  mockDiscovery,
  RepertoireError,
} from '@lsst-sqre/repertoire-client';

import { __resetMissingServiceWarnings, resolveServiceLink } from './resolve';

function makeLogger() {
  return { debug: vi.fn(), warn: vi.fn(), error: vi.fn() };
}

// The shared fetch/log/report handling is covered in
// lib/discovery/fetchDiscoveryForRender.test.ts; these tests cover the wiring:
// the call-site log message and Sentry site, and the transform of the result.
describe('resolveServiceLink', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // The missing-service warning is once per process; start each test fresh.
    __resetMissingServiceWarnings();
  });

  test('omits the link when no repertoireUrl is configured', async () => {
    const result = await resolveServiceLink({
      service: 'comanage',
      repertoireUrl: undefined,
    });

    expect(result).toEqual({ status: 'omitted' });
    expect(fetchServiceDiscovery).not.toHaveBeenCalled();
  });

  test('resolves the UI service URL from discovery', async () => {
    vi.mocked(fetchServiceDiscovery).mockResolvedValue(mockDiscovery);

    const result = await resolveServiceLink({
      service: 'comanage',
      repertoireUrl: 'https://example.org/repertoire',
    });

    // The discovered URL as published, trailing slash included.
    expect(result).toEqual({
      status: 'ok',
      url: mockDiscovery.services.ui.comanage.url,
    });
    expect(result).toEqual({ status: 'ok', url: 'https://id.lsst.cloud/' });
  });

  test('returns missing and warns when discovery lacks the service', async () => {
    const logger = makeLogger();
    vi.mocked(fetchServiceDiscovery).mockResolvedValue(mockDiscovery);

    const result = await resolveServiceLink({
      service: 'no-such-service',
      repertoireUrl: 'https://example.org/repertoire',
      logger,
    });

    expect(result).toEqual({ status: 'missing' });
    expect(logger.warn).toHaveBeenCalledWith(
      expect.objectContaining({ service: 'no-such-service' }),
      expect.any(String)
    );
    expect(logger.error).not.toHaveBeenCalled();
  });

  test('warns once per process for a missing service, still returning missing each time', async () => {
    const logger = makeLogger();
    vi.mocked(fetchServiceDiscovery).mockResolvedValue(mockDiscovery);
    const options = {
      service: 'no-such-service',
      repertoireUrl: 'https://example.org/repertoire',
      logger,
    };

    const first = await resolveServiceLink(options);
    const second = await resolveServiceLink(options);

    // Every call still returns missing, so the tag renders its fallback.
    expect(first).toEqual({ status: 'missing' });
    expect(second).toEqual({ status: 'missing' });
    expect(logger.warn).toHaveBeenCalledTimes(1);
  });

  test('warns once for each distinct missing service', async () => {
    const logger = makeLogger();
    vi.mocked(fetchServiceDiscovery).mockResolvedValue(mockDiscovery);
    const repertoireUrl = 'https://example.org/repertoire';

    for (const service of ['comange', 'no-such-service', 'comange']) {
      await resolveServiceLink({ service, repertoireUrl, logger });
    }

    expect(logger.warn).toHaveBeenCalledTimes(2);
    expect(logger.warn).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ service: 'comange' }),
      expect.any(String)
    );
    expect(logger.warn).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ service: 'no-such-service' }),
      expect.any(String)
    );
  });

  test('still warns once a logger is passed after a logger-less call', async () => {
    const logger = makeLogger();
    vi.mocked(fetchServiceDiscovery).mockResolvedValue(mockDiscovery);
    const options = {
      service: 'no-such-service',
      repertoireUrl: 'https://example.org/repertoire',
    };

    await resolveServiceLink(options);
    await resolveServiceLink({ ...options, logger });

    expect(logger.warn).toHaveBeenCalledTimes(1);
  });

  test('returns unavailable and logs the error when discovery fails', async () => {
    const logger = makeLogger();
    const error = new Error('discovery exploded');
    vi.mocked(fetchServiceDiscovery).mockRejectedValue(error);

    const result = await resolveServiceLink({
      service: 'comanage',
      repertoireUrl: 'https://example.org/repertoire',
      logger,
    });

    expect(result).toEqual({ status: 'unavailable' });
    expect(logger.error).toHaveBeenCalledWith(
      expect.objectContaining({ err: error, service: 'comanage' }),
      'Failed to fetch service discovery for a <ServiceLink>'
    );
  });

  test('reports a report-worthy discovery failure with call-site context', async () => {
    const reportError = vi.fn();
    // A 5xx is report-worthy per classifyError (upstream server failure).
    const error = new RepertoireError('discovery exploded', 503);
    vi.mocked(fetchServiceDiscovery).mockRejectedValue(error);

    const result = await resolveServiceLink({
      service: 'comanage',
      repertoireUrl: 'https://example.org/repertoire',
      reportError,
    });

    // The fallback is unchanged: still 'unavailable'.
    expect(result).toEqual({ status: 'unavailable' });
    expect(reportError).toHaveBeenCalledTimes(1);
    const [reported, context] = reportError.mock.calls[0];
    expect(reported).toBe(error);
    expect(context).toMatchObject({
      site: 'service-link-discovery',
      package: 'squareone',
      service: 'comanage',
    });
  });

  test('does not report a service missing from discovery', async () => {
    const reportError = vi.fn();
    vi.mocked(fetchServiceDiscovery).mockResolvedValue(mockDiscovery);

    const result = await resolveServiceLink({
      service: 'no-such-service',
      repertoireUrl: 'https://example.org/repertoire',
      reportError,
    });

    expect(result).toEqual({ status: 'missing' });
    expect(reportError).not.toHaveBeenCalled();
  });
});
