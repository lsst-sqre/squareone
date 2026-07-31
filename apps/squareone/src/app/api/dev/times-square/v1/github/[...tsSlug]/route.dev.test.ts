import { PageSchema } from '@lsst-sqre/times-square-client';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/config/loader', () => ({
  loadAppConfig: async () => ({
    timesSquareUrl: 'https://example.test/times-square/api',
  }),
}));

import { GET } from './route.dev';

describe('GET /api/dev/times-square/v1/github/:tsSlug*', () => {
  it('returns schema-valid page metadata', async () => {
    const response = await GET(new Request('http://localhost'), {
      params: Promise.resolve({ tsSlug: ['lsst-sqre', 'demo-repo', 'demo'] }),
    });
    expect(response.status).toBe(200);

    const page = PageSchema.parse(await response.json());
    expect(page.name).toBe('demo');
    expect(page.html_status_url).toBe(
      'https://example.test/times-square/api/v1/pages/demo/htmlstatus'
    );
  });

  it('returns 404 for the not-found page', async () => {
    const response = await GET(new Request('http://localhost'), {
      params: Promise.resolve({
        tsSlug: ['lsst-sqre', 'demo-repo', 'not-found'],
      }),
    });
    expect(response.status).toBe(404);
  });
});
