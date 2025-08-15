/*
 * Mock Times Square API endpoint: /times-square/v1/pages/:page/htmlevents
 * Server-Sent Events (SSE) endpoint for execution status updates
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { loadAppConfig } from '../../../../../../../lib/config/loader';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { page, a } = req.query;
    const appConfig = await loadAppConfig();
    const { timesSquareUrl } = appConfig;

    const pageBaseUrl = `${timesSquareUrl}/v1/pages/${page}`;

    // Set up Server-Sent Events headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    });

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

    // Send the event data
    res.write(`data: ${JSON.stringify(eventData)}\n\n`);

    // For demo purposes, close the connection after sending one event
    // In real implementation, this would stay open and send updates
    res.end();
  } catch (error) {
    console.error(
      'Failed to load configuration in Times Square htmlevents API:',
      error
    );
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
}
