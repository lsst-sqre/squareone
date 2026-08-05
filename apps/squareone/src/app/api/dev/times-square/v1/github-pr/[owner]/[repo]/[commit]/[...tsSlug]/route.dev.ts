/**
 * Mock Times Square API for a PR preview page:
 * /times-square/v1/github-pr/:owner/:repo/:commit/:slug (App Router version)
 */

import { NextResponse } from 'next/server';

import { loadAppConfig } from '@/lib/config/loader';
import { createRouteLogger } from '@/lib/logger';
import { buildMockPage } from '@/lib/mocks/timesSquarePage';

const log = createRouteLogger(
  'times-square/github-pr/[owner]/[repo]/[commit]/[...tsSlug]'
);

export async function GET() {
  try {
    const page = 'demo';
    const appConfig = await loadAppConfig();
    const { timesSquareUrl } = appConfig;

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
