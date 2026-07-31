/**
 * Mock Times Square API endpoint: /times-square/v1/pages/:page (App Router version)
 */

import { NextResponse } from 'next/server';

import { loadAppConfig } from '@/lib/config/loader';
import { createRouteLogger } from '@/lib/logger';
import { buildMockPage } from '@/lib/mocks/timesSquarePage';

const log = createRouteLogger('times-square/pages/[page]');

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ page: string }> }
) {
  try {
    const { page } = await params;
    const appConfig = await loadAppConfig();
    const { timesSquareUrl } = appConfig;

    if (page === 'not-found') {
      // simulate a page that doesn't exist in the backend
      return new Response(null, { status: 404 });
    }

    const content = buildMockPage({ name: page, timesSquareUrl });

    return NextResponse.json(content);
  } catch (error) {
    log.error({ err: error }, 'Failed to load configuration');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
