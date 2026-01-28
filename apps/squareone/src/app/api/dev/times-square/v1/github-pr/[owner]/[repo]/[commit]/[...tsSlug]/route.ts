/**
 * Mock Times Square API for a PR preview page:
 * /times-square/v1/github-pr/:owner/:repo/:commit/:slug (App Router version)
 */

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

    const content = {
      name: page,
      title: `Title for ${page}`,
      description: '<p>This is the description.</p>',
      self_url: pageBaseUrl,
      source_url: `${pageBaseUrl}/source`,
      rendered_url: `${pageBaseUrl}/rendered`,
      html_url: `${pageBaseUrl}/html`,
      html_status_url: `${pageBaseUrl}/htmlstatus`,
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
