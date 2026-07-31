/**
 * Mock Times Square API endpoint: /times-square/v1/github/:slug (App Router version)
 * Updated to include github field for Times Square page data
 * Fixed URLs to use mock API endpoints
 */

import { NextResponse } from 'next/server';

import { loadAppConfig } from '@/lib/config/loader';
import { createRouteLogger } from '@/lib/logger';
import { buildMockPage } from '@/lib/mocks/timesSquarePage';

const log = createRouteLogger('times-square/github/[...tsSlug]');

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ tsSlug: string[] }> }
) {
  try {
    const { tsSlug } = await params;
    const page =
      Array.isArray(tsSlug) && tsSlug.length > 0
        ? tsSlug[tsSlug.length - 1]
        : 'demo';

    const appConfig = await loadAppConfig();
    const { timesSquareUrl } = appConfig;

    if (page === 'not-found') {
      // simulate a page that doesn't exist in the backend
      return new Response(null, { status: 404 });
    }

    const content = buildMockPage({
      name: page,
      timesSquareUrl,
      github: {
        owner: 'lsst-sqre',
        repository: 'times-square-demo',
        source_path: `${page}.ipynb`,
        sidecar_path: `${page}.yaml`,
      },
    });

    return NextResponse.json(content);
  } catch (error) {
    log.error({ err: error }, 'Failed to load configuration');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
