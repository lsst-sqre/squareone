import { HtmlEventSchema } from '@lsst-sqre/times-square-client';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/config/loader', () => ({
  loadAppConfig: async () => ({
    timesSquareUrl: 'https://example.test/times-square/api',
  }),
}));

import { GET } from './route.dev';

function makeParams(page: string) {
  return { params: Promise.resolve({ page }) };
}

/** Read the SSE stream and parse the single event it carries. */
async function getEvent(page: string, query = '') {
  const response = await GET(
    new Request(
      `http://localhost/api/dev/times-square/v1/pages/${page}/htmlevents${query}`
    ),
    makeParams(page)
  );
  expect(response.status).toBe(200);

  const body = await response.text();
  const payload = body.replace(/^data: /, '').trim();
  return HtmlEventSchema.parse(JSON.parse(payload));
}

describe('GET /api/dev/times-square/v1/pages/:page/htmlevents', () => {
  it('reports a terminal execution error for the failure magic value', async () => {
    const event = await getEvent('mypage', '?a=3');

    expect(event.execution_status).toBe('complete');
    expect(event.html_hash).toBeNull();
    expect(event.execution_error).toEqual({
      code: 'timeout',
      title: expect.any(String),
      message: expect.any(String),
    });
  });

  it('reports a successful execution by default', async () => {
    const event = await getEvent('mypage');

    expect(event.execution_status).toBe('complete');
    expect(event.html_hash).not.toBeNull();
    expect(event.execution_error).toBeNull();
  });

  it('reports an in-progress execution for the pending magic value', async () => {
    const event = await getEvent('mypage', '?a=2');

    expect(event.execution_status).toBe('in_progress');
    expect(event.html_hash).toBeNull();
    expect(event.execution_error).toBeNull();
  });

  it('reports an idle instance with all-null execution fields', async () => {
    const event = await getEvent('mypage', '?a=4');

    expect(event.date_submitted).toBeNull();
    expect(event.date_started).toBeNull();
    expect(event.date_finished).toBeNull();
    expect(event.execution_status).toBeNull();
    expect(event.execution_duration).toBeNull();
    expect(event.html_hash).toBeNull();
    expect(event.execution_error).toBeNull();
    // Only the URL is populated when there is no job and no rendering.
    expect(event.html_url).toContain('/v1/pages/mypage/html');
  });
});
