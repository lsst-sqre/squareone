/**
 * Mock Times Square API endpoint: /times-square/api/v1/pages/:page/htmlstatus
 * (App Router version)
 */

import { NextResponse } from 'next/server';

import { loadAppConfig } from '@/lib/config/loader';
import { createRouteLogger } from '@/lib/logger';
import {
  mockExecutionError,
  resolveExecutionState,
} from '@/lib/mocks/timesSquareExecutionStore';

const log = createRouteLogger('times-square/pages/[page]/htmlstatus');

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

    // The `a` notebook parameter is the dev mocks' magic knob for execution
    // state: `2` keeps the rendering pending and `3` fails it terminally. A
    // re-run (DELETE on the html route) overrides it while re-executing.
    const executionState = resolveExecutionState(page, a);
    const available = executionState === 'complete';

    const content = {
      available,
      html_url: `${pageBaseUrl}/html?a=${a}`,
      html_hash: available ? '12345' : null,
      execution_error:
        executionState === 'failed' ? { ...mockExecutionError } : null,
    };

    log.debug({ content }, 'Pinged status');

    return NextResponse.json(content);
  } catch (error) {
    log.error({ err: error }, 'Failed to load configuration');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
