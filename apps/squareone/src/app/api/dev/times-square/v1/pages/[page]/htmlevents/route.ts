/**
 * Mock Times Square API endpoint: /times-square/v1/pages/:page/htmlevents
 * Server-Sent Events (SSE) endpoint for execution status updates
 * (App Router version)
 */

import { loadAppConfig } from '@/lib/config/loader';

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

    // Mock execution data based on the parameter 'a'
    const executionStatus = a === '2' ? 'in_progress' : 'complete';
    const dateSubmitted = '2024-01-15T10:00:00Z';
    const dateStarted = '2024-01-15T10:00:01Z';
    const dateFinished =
      executionStatus === 'complete' ? '2024-01-15T10:00:15Z' : null;
    const executionDuration = executionStatus === 'complete' ? 14.2 : null;
    const htmlHash = executionStatus === 'complete' ? 'abc123def456' : null;

    const eventData = {
      date_submitted: dateSubmitted,
      date_started: dateStarted,
      date_finished: dateFinished,
      execution_status: executionStatus,
      execution_duration: executionDuration,
      html_hash: htmlHash,
      html_url: `${pageBaseUrl}/html?a=${a}`,
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
    console.error(
      'Failed to load configuration in Times Square htmlevents API:',
      error
    );
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
