import { HtmlEventSchema } from '@lsst-sqre/times-square-client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

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

function makeParams(page: string) {
  return { params: Promise.resolve({ page }) };
}

/**
 * Open the event stream and return a reader plus the abort that closes it.
 *
 * The stream stays open the way Times Square's does, so tests read the events
 * they need and then abort rather than draining the response to completion.
 */
async function openStream(page: string, query = '') {
  const controller = new AbortController();
  const response = await GET(
    new Request(
      `http://localhost/api/dev/times-square/v1/pages/${page}/htmlevents${query}`,
      { signal: controller.signal }
    ),
    makeParams(page)
  );
  expect(response.status).toBe(200);

  const reader = (response.body as ReadableStream<Uint8Array>).getReader();
  return {
    reader,
    async close() {
      controller.abort();
      await reader.cancel();
    },
  };
}

/** Read the next event off an open stream. */
async function readEvent(reader: ReadableStreamDefaultReader<Uint8Array>) {
  const { value } = await reader.read();
  const payload = new TextDecoder()
    .decode(value)
    .split('\n')[0]
    .replace(/^data: /, '')
    .trim();
  return HtmlEventSchema.parse(JSON.parse(payload));
}

/** Read the first event a fresh connection reports, then close it. */
async function getEvent(page: string, query = '') {
  const { reader, close } = await openStream(page, query);
  try {
    return await readEvent(reader);
  } finally {
    await close();
  }
}

describe('GET /api/dev/times-square/v1/pages/:page/htmlevents', () => {
  beforeEach(() => {
    resetTimesSquareReruns();
  });

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

  it('keeps emitting so a re-run is reported on the open connection', async () => {
    const { reader, close } = await openStream('mypage');
    try {
      expect((await readEvent(reader)).execution_status).toBe('complete');

      // The client subscribes once and leaves the connection open; a re-run
      // requested afterwards has to reach it on that same stream, or nothing
      // ever reports the execution it scheduled.
      recordRerun('mypage', '1');

      expect((await readEvent(reader)).execution_status).toBe('in_progress');
    } finally {
      await close();
    }
  });
});
