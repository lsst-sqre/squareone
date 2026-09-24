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

import { resolveDatasetDocs } from './resolve';

function makeLogger() {
  return { debug: vi.fn(), warn: vi.fn(), error: vi.fn() };
}

describe('resolveDatasetDocs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('omits the cards when no repertoireUrl is configured', async () => {
    const result = await resolveDatasetDocs({ repertoireUrl: undefined });

    expect(result).toEqual({ status: 'omitted' });
    expect(fetchServiceDiscovery).not.toHaveBeenCalled();
  });

  test('returns one card per dataset, newest release first with prompt second', async () => {
    vi.mocked(fetchServiceDiscovery).mockResolvedValue(mockDiscovery);

    const result = await resolveDatasetDocs({
      repertoireUrl: 'https://example.org/repertoire',
    });

    const { datasets } = mockDiscovery;
    expect(result).toEqual({
      status: 'ok',
      datasets: [
        {
          datasetKey: 'dp1',
          displayName: 'Data Preview 1',
          description: datasets.dp1.description,
          docsUrl: 'https://dp1.lsst.io',
        },
        {
          datasetKey: 'prompt',
          displayName: 'Prompt Products',
          description: datasets.prompt.description,
          // The mock prompt dataset has no docs_url, as on data-dev.
          docsUrl: null,
        },
        {
          datasetKey: 'dp03',
          displayName: 'Data Preview 0.3',
          description: datasets.dp03.description,
          docsUrl: 'https://dp0-3.lsst.io',
        },
        {
          datasetKey: 'dp02',
          displayName: 'Data Preview 0.2',
          description: datasets.dp02.description,
          docsUrl: 'https://dp0-2.lsst.io',
        },
      ],
    });
  });

  test('returns unavailable and logs the error when discovery fails', async () => {
    const logger = makeLogger();
    const error = new Error('discovery exploded');
    vi.mocked(fetchServiceDiscovery).mockRejectedValue(error);

    const result = await resolveDatasetDocs({
      repertoireUrl: 'https://example.org/repertoire',
      logger,
    });

    expect(result).toEqual({ status: 'unavailable' });
    expect(logger.error).toHaveBeenCalledWith(
      expect.objectContaining({ err: error }),
      expect.any(String)
    );
  });

  test('reports a report-worthy discovery failure with call-site context', async () => {
    const reportError = vi.fn();
    // A 5xx is report-worthy per classifyError (upstream server failure).
    const error = new RepertoireError('discovery exploded', 503);
    vi.mocked(fetchServiceDiscovery).mockRejectedValue(error);

    const result = await resolveDatasetDocs({
      repertoireUrl: 'https://example.org/repertoire',
      reportError,
    });

    // UI fallback is unchanged: still 'unavailable'.
    expect(result).toEqual({ status: 'unavailable' });
    expect(reportError).toHaveBeenCalledTimes(1);
    const [reported, context] = reportError.mock.calls[0];
    expect(reported).toBe(error);
    expect(context).toMatchObject({
      site: 'docs-dataset-discovery',
      package: 'squareone',
    });
  });

  test('does not report an expected discovery failure (403)', async () => {
    const reportError = vi.fn();
    // A 403 is expected per classifyError (auth failures are routine).
    vi.mocked(fetchServiceDiscovery).mockRejectedValue(
      new RepertoireError('forbidden', 403)
    );

    const result = await resolveDatasetDocs({
      repertoireUrl: 'https://example.org/repertoire',
      reportError,
    });

    expect(result).toEqual({ status: 'unavailable' });
    expect(reportError).not.toHaveBeenCalled();
  });

  test('threads the logger into the discovery fetch', async () => {
    const logger = makeLogger();
    vi.mocked(fetchServiceDiscovery).mockResolvedValue(mockDiscovery);

    await resolveDatasetDocs({
      repertoireUrl: 'https://example.org/repertoire',
      logger,
    });

    expect(fetchServiceDiscovery).toHaveBeenCalledWith(
      'https://example.org/repertoire',
      { logger }
    );
  });
});
