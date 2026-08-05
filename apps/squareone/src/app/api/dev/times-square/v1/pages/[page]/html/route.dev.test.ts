import { DeleteHtmlResponseSchema } from '@lsst-sqre/times-square-client';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/config/loader', () => ({
  loadAppConfig: async () => ({
    timesSquareUrl: 'https://example.test/times-square/api',
  }),
}));

import {
  resetTimesSquareReruns,
  resolveExecutionState,
} from '@/lib/mocks/timesSquareExecutionStore';
import { DELETE } from './route.dev';

afterEach(() => {
  resetTimesSquareReruns();
});

function makeParams(page: string) {
  return { params: Promise.resolve({ page }) };
}

describe('DELETE /api/dev/times-square/v1/pages/:page/html', () => {
  it('returns the re-running instance URLs', async () => {
    const response = await DELETE(
      new Request(
        'http://localhost/api/dev/times-square/v1/pages/mypage/html?a=3',
        { method: 'DELETE' }
      ),
      makeParams('mypage')
    );
    expect(response.status).toBe(200);

    const body = DeleteHtmlResponseSchema.parse(await response.json());
    expect(body.html_url).toBe(
      'https://example.test/times-square/api/v1/pages/mypage/html?a=3'
    );
    expect(body.html_events_url).toBe(
      'https://example.test/times-square/api/v1/pages/mypage/htmlevents?a=3'
    );
  });

  it('marks the page instance as re-executing', async () => {
    expect(resolveExecutionState('mypage', '3')).toBe('failed');

    await DELETE(
      new Request(
        'http://localhost/api/dev/times-square/v1/pages/mypage/html?a=3',
        { method: 'DELETE' }
      ),
      makeParams('mypage')
    );

    expect(resolveExecutionState('mypage', '3')).toBe('in_progress');
  });
});
