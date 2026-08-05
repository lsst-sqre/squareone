/**
 * Mock Times Square API endpoint: /times-square/v1/pages/:page/htmlevents
 * Server-Sent Events (SSE) endpoint for execution status updates
 * (App Router version)
 */

import { loadAppConfig } from '@/lib/config/loader';
import { createRouteLogger } from '@/lib/logger';
import {
  mockExecutionError,
  resolveExecutionState,
} from '@/lib/mocks/timesSquareExecutionStore';

const log = createRouteLogger('times-square/pages/[page]/htmlevents');

/** How often the mock stream emits, mirroring Times Square's fixed interval. */
const EVENT_INTERVAL_MS = 1000;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ page: string }> }
) {
  try {
    const { page } = await params;
    const url = new URL(request.url);
    const a = url.searchParams.get('a') ?? '1';

    const appConfig = await loadAppConfig();
    const { timesSquareUrl } = appConfig;

    const pageBaseUrl = `${timesSquareUrl}/v1/pages/${page}`;

    // Mock execution data based on the parameter 'a': `2` keeps the execution
    // in progress, `3` fails it terminally, and `4` reports an idle instance. A
    // failed execution still reaches `complete` — it just produces no HTML, so
    // `html_hash` is null and `execution_error` carries the failure. A re-run
    // (DELETE on the html route) overrides the state while the instance
    // re-executes.
    // The state is resolved per event rather than once per connection: a re-run
    // recorded while the stream is open has to be reported on it, the way Times
    // Square reports a newly scheduled execution.
    const buildEvent = () => {
      const executionState = resolveExecutionState(page, a);
      // An idle instance has neither a job nor a rendering, so every execution
      // field is null and only `html_url` is populated — the payload Times
      // Square emits before anything has been queued.
      const isIdle = executionState === 'idle';
      const isFinished = executionState !== 'in_progress' && !isIdle;
      const executionStatus = isIdle
        ? null
        : isFinished
          ? 'complete'
          : 'in_progress';
      const dateSubmitted = isIdle ? null : '2024-01-15T10:00:00Z';
      const dateStarted = isIdle ? null : '2024-01-15T10:00:01Z';
      const dateFinished = isFinished ? '2024-01-15T10:00:15Z' : null;
      const executionDuration = isFinished ? 14.2 : null;
      const htmlHash = executionState === 'complete' ? 'abc123def456' : null;

      return {
        date_submitted: dateSubmitted,
        date_started: dateStarted,
        date_finished: dateFinished,
        execution_status: executionStatus,
        execution_duration: executionDuration,
        html_hash: htmlHash,
        html_url: `${pageBaseUrl}/html?a=${a}`,
        execution_error:
          executionState === 'failed' ? { ...mockExecutionError } : null,
      };
    };

    const encoder = new TextEncoder();
    // Times Square emits an event on a fixed interval and holds the connection
    // open; a client that ends its subscription aborts the request. A mock that
    // sent one event and closed instead ended the subscription for good — the
    // transport only reconnects after an error — so an execution that changed
    // state later (a re-run being the case that matters) was never reported.
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(buildEvent())}\n\n`)
        );

        const timer = setInterval(() => {
          try {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(buildEvent())}\n\n`)
            );
          } catch {
            // The client went away between the abort and its signal firing.
            clearInterval(timer);
          }
        }, EVENT_INTERVAL_MS);

        request.signal.addEventListener('abort', () => {
          clearInterval(timer);
          controller.close();
        });
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control',
      },
    });
  } catch (error) {
    log.error({ err: error }, 'Failed to load configuration');
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
