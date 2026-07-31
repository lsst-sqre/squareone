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
    // in progress and `3` fails it terminally. A failed execution still
    // reaches `complete` — it just produces no HTML, so `html_hash` is null and
    // `execution_error` carries the failure. A re-run (DELETE on the html
    // route) overrides the state while the instance re-executes.
    const executionState = resolveExecutionState(page, a);
    const isFinished = executionState !== 'in_progress';
    const executionStatus = isFinished ? 'complete' : 'in_progress';
    const dateSubmitted = '2024-01-15T10:00:00Z';
    const dateStarted = '2024-01-15T10:00:01Z';
    const dateFinished = isFinished ? '2024-01-15T10:00:15Z' : null;
    const executionDuration = isFinished ? 14.2 : null;
    const htmlHash = executionState === 'complete' ? 'abc123def456' : null;

    const eventData = {
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

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        // Send the event data
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(eventData)}\n\n`)
        );
        // Close the stream after sending one event
        // In real implementation, this would stay open and send updates
        controller.close();
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
