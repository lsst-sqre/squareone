/**
 * Mock Times Square API for a PR preview page:
 * /times-square/v1/github-pr/:owner/:repo/:commit/:slug (App Router version)
 */

import type { Page } from '@lsst-sqre/times-square-client';
import { NextResponse } from 'next/server';

import { loadAppConfig } from '@/lib/config/loader';
import { createRouteLogger } from '@/lib/logger';

const log = createRouteLogger(
  'times-square/github-pr/[owner]/[repo]/[commit]/[...tsSlug]'
);

export async function GET() {
  try {
    const page = 'demo';
    const appConfig = await loadAppConfig();
    const { timesSquareUrl } = appConfig;
    const pageBaseUrl = `${timesSquareUrl}/v1/pages/${page}`;

    // Shape must conform to the PageSchema Zod schema in
    // @lsst-sqre/times-square-client (packages/times-square-client/src/schemas.ts).
    const content: Page = {
      name: page,
      title: `Title for ${page}`,
      description: {
        gfm: 'This is the description.',
        html: '<p>This is the description.</p>',
      },
      date_added: '2024-01-15T10:00:00Z',
      authors: [],
      tags: [],
      uploader_username: null,
      self_url: pageBaseUrl,
      source_url: `${pageBaseUrl}/source`,
      rendered_url: `${pageBaseUrl}/rendered`,
      html_url: `${pageBaseUrl}/html`,
      html_status_url: `${pageBaseUrl}/htmlstatus`,
      html_events_url: `${pageBaseUrl}/htmlevents`,
      parameters: {
        a: {
          type: 'number',
          default: 42,
          description: 'A number.',
        },
        b: {
          type: 'string',
          default: 'Hello',
          description: 'A string.',
        },
      },
      github: {
        owner: 'lsst-sqre',
        repository: 'times-square-demo',
        source_path: `${page}.ipynb`,
        sidecar_path: `${page}.yaml`,
      },
    };

    return NextResponse.json(content);
  } catch (error) {
    log.error({ err: error }, 'Failed to load configuration');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
