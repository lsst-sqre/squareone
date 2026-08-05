/**
 * Mock Times Square API endpoint: /times-square/v1/pages/[page]/html (App Router version)
 *
 * GET serves the mock notebook rendering. DELETE mocks Times Square's soft
 * delete (the re-run request): it returns the spec's `DeleteHtmlResponse` and
 * marks the page instance as re-executing, so the failure → error panel →
 * re-run → loading flow is exercisable in dev mode.
 */

import { NextResponse } from 'next/server';

import { loadAppConfig } from '@/lib/config/loader';
import { createRouteLogger } from '@/lib/logger';
import { recordRerun } from '@/lib/mocks/timesSquareExecutionStore';

const log = createRouteLogger('times-square/pages/[page]/html');

const htmlContent = `
<!doctype html>
<html class="no-js" lang="">

<head>
  <meta charset="utf-8">
  <title>Test document</title>
</head>

<body>
  <h1>Test content</h1>
  <p>Hello world</p>
</body>
</html>
`;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ page: string }> }
) {
  const { page: _page } = await params;
  log.debug({ url: request.url }, 'Serving HTML content');

  return new Response(htmlContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/html',
    },
  });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ page: string }> }
) {
  try {
    const { page } = await params;
    const url = new URL(request.url);
    // The query string identifies the page instance (notebook parameters and
    // display settings), so it is carried into the returned URLs.
    const query = url.search;
    const a = url.searchParams.get('a') ?? '1';

    // Clear the instance's cached outcome: it reports as re-executing until the
    // re-run window elapses, so the viewer returns to its loading state.
    recordRerun(page, a);

    const appConfig = await loadAppConfig();
    const { timesSquareUrl } = appConfig;
    const pageBaseUrl = `${timesSquareUrl}/v1/pages/${page}`;

    log.debug({ url: request.url }, 'Requested a re-run (soft delete)');

    return NextResponse.json({
      html_url: `${pageBaseUrl}/html${query}`,
      html_events_url: `${pageBaseUrl}/htmlevents${query}`,
    });
  } catch (error) {
    log.error({ err: error }, 'Failed to load configuration');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
