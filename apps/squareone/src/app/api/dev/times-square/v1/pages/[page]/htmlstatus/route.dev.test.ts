import { HtmlStatusSchema } from '@lsst-sqre/times-square-client';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/config/loader', () => ({
  loadAppConfig: async () => ({
    timesSquareUrl: 'https://example.test/times-square/api',
  }),
}));

import {
  recordRerun,
  resetTimesSquareReruns,
} from '@/lib/mocks/timesSquareExecutionStore';
import { GET } from './route.dev';

afterEach(() => {
  resetTimesSquareReruns();
});

function makeParams(page: string) {
  return { params: Promise.resolve({ page }) };
}

async function getStatus(page: string, query = '') {
  const response = await GET(
    new Request(
      `http://localhost/api/dev/times-square/v1/pages/${page}/htmlstatus${query}`
    ),
    makeParams(page)
  );
  expect(response.status).toBe(200);
  return HtmlStatusSchema.parse(await response.json());
}

describe('GET /api/dev/times-square/v1/pages/:page/htmlstatus', () => {
  it('reports a terminal execution error for the failure magic value', async () => {
    const status = await getStatus('mypage', '?a=3');

    expect(status.available).toBe(false);
    expect(status.html_hash).toBeNull();
    expect(status.execution_error).toEqual({
      code: 'timeout',
      title: expect.any(String),
      message: expect.any(String),
    });
  });

  it('reports an available rendering by default', async () => {
    const status = await getStatus('mypage');

    expect(status.available).toBe(true);
    expect(status.html_hash).not.toBeNull();
    expect(status.execution_error).toBeNull();
  });

  it('reports a pending rendering for the pending magic value', async () => {
    const status = await getStatus('mypage', '?a=2');

    expect(status.available).toBe(false);
    expect(status.html_hash).toBeNull();
    expect(status.execution_error).toBeNull();
  });

  it('clears the execution error while a re-run is in flight', async () => {
    recordRerun('mypage', '3');

    const status = await getStatus('mypage', '?a=3');

    expect(status.available).toBe(false);
    expect(status.execution_error).toBeNull();
  });
});
